"""Campaign state. Singleton accessible by all agents."""
from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any, Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from ..domain.campaign import Campaign
from ..i18n import normalize


_CAMPAIGN = Campaign()
_LANG: str = "en"


def current() -> Campaign:
    return _CAMPAIGN


def current_lang() -> str:
    return _LANG


def reset(lang: str = "en") -> None:
    global _CAMPAIGN, _LANG
    _CAMPAIGN = Campaign()
    _LANG = normalize(lang)


class _UpdateInput(BaseModel):
    # Single string argument: JSON-encoded patch. A simple, unambiguous
    # schema works better with small models than a str|dict union — qwen
    # and similar 7B models occasionally refuse to invoke tools whose
    # args use an anyOf branch.
    patch_json: str = Field(
        default="{}",
        description=(
            "A JSON string with the campaign fields to update. The shape is: "
            "{\"<field>\": <value>, \"pricing\": {\"<subfield>\": <value>}}. "
            "Use the actual merchant data from the current context — do not "
            "copy any example name. Unknown fields are ignored. "
            "The tool deep-merges into the current state, so you only need "
            "to send the fields you want to change."
        ),
    )
    # Allow extra fields. Some LLMs pass the patch as flat kwargs like
    # update_campaign(merchant_name="X", city="Y") instead of wrapping
    # them in patch_json. We catch them here and merge in _run().
    model_config = {"extra": "allow"}


def _tolerant_json_load(s: str) -> dict | list | None:
    """Try hard to parse JSON from a small-LLM output.

    Small models routinely produce JSON with: trailing commas, unquoted
    keys, single quotes, embedded newlines, missing closing braces, or
    extra text before/after. We try a sequence of repairs."""
    import re as _re

    # 1) Plain json.loads
    try:
        return json.loads(s)
    except (json.JSONDecodeError, ValueError):
        pass

    # 2) Strip surrounding text — keep only the first {...} balanced block.
    start = s.find("{")
    end = s.rfind("}")
    if start != -1 and end > start:
        candidate = s[start : end + 1]
        try:
            return json.loads(candidate)
        except (json.JSONDecodeError, ValueError):
            s = candidate

    # 3) Trailing commas before } or ]
    repaired = _re.sub(r",(\s*[}\]])", r"\1", s)
    try:
        return json.loads(repaired)
    except (json.JSONDecodeError, ValueError):
        pass

    # 4) Single quotes → double quotes (only if it looks safe).
    if "'" in repaired and '"' not in repaired:
        try:
            return json.loads(repaired.replace("'", '"'))
        except (json.JSONDecodeError, ValueError):
            pass

    # 5) Python literal fallback
    try:
        import ast as _ast
        obj = _ast.literal_eval(repaired)
        if isinstance(obj, (dict, list)):
            return obj
    except (ValueError, SyntaxError):
        pass

    return None


_MOJIBAKE_MARKERS = ("Ã¡", "Ã©", "Ã­", "Ã³", "Ãº", "Ã±", "Ã¼", "Ã‘", "Ã‰", "Ã“")


def _fix_mojibake(value: Any) -> Any:
    """Repair UTF-8 → Latin-1 → UTF-8 mojibake (e.g. 'MalasaÃ¡na' →
    'Malasaña'). Walks dicts/lists recursively. Strings without obvious
    mojibake markers pass through unchanged so we don't risk corrupting
    legitimate accented text twice."""
    if isinstance(value, dict):
        return {k: _fix_mojibake(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_fix_mojibake(v) for v in value]
    if isinstance(value, str) and any(m in value for m in _MOJIBAKE_MARKERS):
        try:
            return value.encode("latin-1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            return value
    return value


def _normalise_slots(patch: dict) -> dict:
    """Some LLMs return weekly_slots as a list of {day, hours} objects
    instead of plain strings. Flatten them into 'Day HH-HH' strings so
    the Pydantic model accepts them without erroring out."""
    slots = patch.get("weekly_slots")
    if not isinstance(slots, list):
        return patch
    flat: list[str] = []
    for item in slots:
        if isinstance(item, str):
            flat.append(item)
        elif isinstance(item, dict):
            day = item.get("day") or item.get("weekday") or ""
            hours = (
                item.get("hours")
                or item.get("slot")
                or item.get("time")
                or item.get("range")
                or ""
            )
            joined = " ".join(str(x) for x in (day, hours) if x).strip()
            if joined:
                flat.append(joined)
        else:
            flat.append(str(item))
    patch["weekly_slots"] = flat
    return patch


def _explode_dot_keys(d: dict) -> dict:
    """Convert {'pricing.pvp_eur': 70} into {'pricing': {'pvp_eur': 70}}.
    Some LLMs emit nested fields as flat dotted keys; we want to be
    tolerant rather than reject the patch."""
    out: dict = {}
    for k, v in d.items():
        if isinstance(v, dict):
            v = _explode_dot_keys(v)
        if "." in k:
            parts = k.split(".")
            cursor = out
            for part in parts[:-1]:
                if not isinstance(cursor.get(part), dict):
                    cursor[part] = {}
                cursor = cursor[part]
            cursor[parts[-1]] = v
        else:
            existing = out.get(k)
            if isinstance(existing, dict) and isinstance(v, dict):
                out[k] = _deep_merge(existing, v)
            else:
                out[k] = v
    return out


class UpdateCampaignTool(BaseTool):
    name: str = "update_campaign"
    description: str = (
        "Update the campaign state with the fields you provide. Accepts a "
        "JSON object (or a JSON string). Nested fields like pricing.pvp_eur "
        "can be written either as {'pricing': {'pvp_eur': 70}} or as "
        "'pricing.pvp_eur': 70 — both work. Unknown fields are ignored."
    )
    args_schema: Type[BaseModel] = _UpdateInput

    def _run(self, patch_json: str | dict | None = None, **kwargs) -> str:
        global _CAMPAIGN

        # 1) Normalise into a dict. Small LLMs pass data in many shapes:
        # JSON string, dict, raw kwargs. Accept all of them.
        patch: dict = {}
        if isinstance(patch_json, dict):
            patch = dict(patch_json)
        elif isinstance(patch_json, str):
            s = patch_json.strip()
            if s and s != "{}":
                parsed = _tolerant_json_load(s)
                if parsed is None:
                    return (
                        "ERROR: could not parse patch_json. Try passing the "
                        "fields as direct keyword arguments instead, e.g. "
                        "update_campaign(merchant_name='X', city='Y')."
                    )
                if isinstance(parsed, dict):
                    patch = parsed

        # 2) Merge any direct keyword args (LLM may pass merchant_name=...
        # at the top level instead of inside patch_json).
        if kwargs:
            patch = _deep_merge(patch, kwargs)

        if not patch:
            return "ERROR: empty patch — nothing to update."

        # 3) Explode dotted keys, then deep-merge into the current state.
        patch = _explode_dot_keys(patch)
        patch = _normalise_slots(patch)
        patch = _fix_mojibake(patch)
        merged = _deep_merge(_CAMPAIGN.model_dump(), patch)

        # 4) Sanity-check pricing: offerly_price MUST be cheaper than pvp.
        # Small LLMs at temperature 0 sometimes generate offerly_price > pvp,
        # which is economically nonsense (negative discount). Refuse the
        # patch so the agent retries instead of poisoning the state.
        pricing = merged.get("pricing") or {}
        pvp = pricing.get("pvp_eur")
        offerly = pricing.get("offerly_price_eur")
        cost = pricing.get("variable_cost_eur")
        if (
            isinstance(pvp, (int, float))
            and isinstance(offerly, (int, float))
            and offerly >= pvp
        ):
            return (
                f"ERROR: offerly_price_eur ({offerly}) must be strictly LESS than "
                f"pvp_eur ({pvp}). Recompute as round(pvp_eur * (1 - discount/100), 2) "
                f"with a discount between 25 and 70."
            )
        if (
            isinstance(pvp, (int, float))
            and isinstance(offerly, (int, float))
            and isinstance(cost, (int, float))
            and offerly <= cost
        ):
            return (
                f"ERROR: offerly_price_eur ({offerly}) must be greater than "
                f"variable_cost_eur ({cost}). Otherwise margin is negative even before commission."
            )

        try:
            _CAMPAIGN = Campaign.model_validate(merged)
        except Exception as e:
            return f"ERROR: resulting campaign is not valid: {e}"
        return _CAMPAIGN.model_dump_json()


class GetCampaignTool(BaseTool):
    name: str = "get_campaign"
    description: str = "Returns the current campaign state as JSON."

    def _run(self, **_kwargs) -> str:
        # Accept and ignore any kwargs — small LLMs sometimes pass spurious
        # arguments like `merchant_name=...` even to a no-arg getter.
        return _CAMPAIGN.model_dump_json()


class _ExportInput(BaseModel):
    out_dir: str = Field(default="out", description="Folder to write into.")


class ExportCampaignTool(BaseTool):
    name: str = "export_campaign"
    description: str = (
        "Exports the current campaign to JSON and Markdown in the given "
        "folder. Returns the written paths."
    )
    args_schema: Type[BaseModel] = _ExportInput

    def _run(self, out_dir: str = "out", **_kwargs) -> str:
        Path(out_dir).mkdir(parents=True, exist_ok=True)
        slug = _slugify(_CAMPAIGN.offer_name or _CAMPAIGN.merchant_name or "campaign")
        json_path = os.path.join(out_dir, f"campaign_{slug}.json")
        md_path = os.path.join(out_dir, f"campaign_{slug}.md")
        Path(json_path).write_text(_CAMPAIGN.model_dump_json(indent=2), encoding="utf-8")
        Path(md_path).write_text(_CAMPAIGN.render_markdown(_LANG), encoding="utf-8")
        return f"Wrote: {json_path} and {md_path}"


def _deep_merge(base: dict, patch: dict) -> dict:
    out = dict(base)
    for k, v in patch.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def _slugify(text: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9]+", "_", text.lower()).strip("_")
    return text or "campaign"
