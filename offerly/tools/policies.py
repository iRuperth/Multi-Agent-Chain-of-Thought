"""Tool: platform policy validator."""
from __future__ import annotations

import json
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel

from ..domain import policies as P
from ..domain.categories import CATEGORIES
from ..i18n import get_bundle
from . import campaign as campaign_tool


class _Input(BaseModel):
    pass


class ValidatePoliciesTool(BaseTool):
    name: str = "validate_policies"
    description: str = (
        "Validates the current campaign against platform policies. "
        "Returns {ok, errors, warnings}. Errors block publishing; warnings "
        "are recommendations."
    )
    args_schema: Type[BaseModel] = _Input

    def _run(self, **_kwargs) -> str:
        c = campaign_tool.current()
        lang = campaign_tool.current_lang()
        b = get_bundle(lang)
        v = b.VALIDATOR

        errors: list[str] = []
        warnings: list[str] = []

        if c.category and c.category not in CATEGORIES:
            errors.append(v["unknown_category"].format(category=c.category))

        p = c.pricing
        if p.pvp_eur is not None and p.offerly_price_eur is not None:
            d = p.discount_pct
            if d is None or d < P.DISCOUNT_MIN_PCT:
                errors.append(
                    v["discount_below_min"].format(d=d, min=P.DISCOUNT_MIN_PCT)
                )
            elif d > P.DISCOUNT_HARD_CAP_PCT:
                errors.append(
                    v["discount_above_hard_cap"].format(d=d, cap=P.DISCOUNT_HARD_CAP_PCT)
                )
            elif d > P.DISCOUNT_MAX_PCT:
                warnings.append(
                    v["discount_above_recommended"].format(d=d, max=P.DISCOUNT_MAX_PCT)
                )

        if p.margin_per_unit is not None and p.margin_per_unit < 0:
            errors.append(v["negative_margin"].format(m=p.margin_per_unit))

        if c.voucher_validity_days is not None:
            if c.voucher_validity_days < P.VOUCHER_MIN_DAYS:
                errors.append(
                    v["voucher_below_min"].format(
                        v=c.voucher_validity_days, min=P.VOUCHER_MIN_DAYS
                    )
                )
            if c.voucher_validity_days > P.VOUCHER_MAX_DAYS:
                errors.append(
                    v["voucher_above_max"].format(
                        v=c.voucher_validity_days, max=P.VOUCHER_MAX_DAYS
                    )
                )

        if c.weekly_slots is not None and len(c.weekly_slots) < P.MIN_WEEKLY_SLOTS:
            errors.append(
                v["few_slots"].format(n=len(c.weekly_slots), min=P.MIN_WEEKLY_SLOTS)
            )

        if c.title:
            if len(c.title) > P.TITLE_MAX_LEN:
                errors.append(
                    v["title_too_long"].format(n=len(c.title), max=P.TITLE_MAX_LEN)
                )
            if c.title == c.title.upper() and len(c.title) > 6:
                errors.append(v["title_all_caps"])
            if "!!!" in c.title or "!!" in c.title:
                warnings.append(v["multi_exclamations"])
            low = c.title.lower()
            for bad in b.BANNED_SUPERLATIVES:
                if bad in low:
                    errors.append(v["banned_claim_title"].format(bad=bad))

        if c.description:
            n = len(c.description)
            if n < P.DESC_MIN_LEN:
                errors.append(v["desc_too_short"].format(n=n, min=P.DESC_MIN_LEN))
            if n > P.DESC_MAX_LEN:
                errors.append(v["desc_too_long"].format(n=n, max=P.DESC_MAX_LEN))

        if c.category and CATEGORIES.get(c.category, {}).get("regulated"):
            text = " ".join([c.title or "", c.description or ""]).lower()
            for bad in b.BANNED_CLAIMS_HEALTH:
                if bad in text:
                    errors.append(v["banned_claim_health"].format(bad=bad))
            disclaimer_markers = ("result", "medic", "guarant", "garant")
            if not any(
                any(m in fp.lower() for m in disclaimer_markers)
                for fp in c.fine_print
            ):
                warnings.append(v["regulated_disclaimer_missing"])

        if c.stock is not None:
            if c.stock < P.STOCK_MIN:
                errors.append(v["stock_below_min"].format(s=c.stock, min=P.STOCK_MIN))
            if c.weekly_capacity:
                cap = c.weekly_capacity * P.STOCK_PER_WEEKLY_CAPACITY_MAX
                if c.stock > cap:
                    errors.append(
                        v["stock_overbooking"].format(s=c.stock, cap=cap)
                    )

        if p.commission_pct not in (P.DEFAULT_COMMISSION_PCT, P.NEGOTIATED_COMMISSION_PCT):
            warnings.append(
                v["non_standard_commission"].format(
                    c=p.commission_pct,
                    default=P.DEFAULT_COMMISSION_PCT,
                    negotiated=P.NEGOTIATED_COMMISSION_PCT,
                )
            )

        return json.dumps({"ok": not errors, "errors": errors, "warnings": warnings})
