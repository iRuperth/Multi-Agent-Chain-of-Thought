"""Tasks that compose the onboarding flow."""
from __future__ import annotations

from typing import Any, Callable

from crewai import Task

from .domain.categories import CATEGORIES
from .i18n import get_bundle
from .reasoning import with_cot
from .tools import campaign as campaign_tool


# Fields each agent is REQUIRED to have written to the shared state by the
# end of its task. If any are still missing the guardrail returns
# (False, feedback) and CrewAI re-executes the agent automatically.
EXPECTED_AFTER: dict[str, list[str]] = {
    "intake":   ["merchant_name", "business_type", "category"],
    "pricing":  ["pricing.offerly_price_eur", "stock", "weekly_slots"],
    "copy":     ["title", "description"],
}


def _get_path(state: dict, path: str) -> Any:
    """Resolve a dotted path inside a campaign state dict."""
    cursor: Any = state
    for part in path.split("."):
        if not isinstance(cursor, dict):
            return None
        cursor = cursor.get(part)
    return cursor


def _make_guardrail(agent_key: str) -> Callable:
    """Build a guardrail callable for the given agent.

    The guardrail inspects the SHARED CAMPAIGN STATE (not the task's text
    output) to confirm that the agent actually called update_campaign for
    the fields it was responsible for. If any required field is still
    empty, return (False, feedback) — CrewAI re-prompts the agent with
    that feedback up to guardrail_max_retries times.

    Note: we deliberately leave `guard` without a return annotation.
    CrewAI's validator inspects ``inspect.signature(...).return_annotation``
    and expects the literal ``Tuple[bool, Any]`` type object, but with
    ``from __future__ import annotations`` enabled the annotation arrives
    as a string and the runtime check fails. Omitting the annotation
    skips that check (CrewAI documents it as optional).
    """
    required = EXPECTED_AFTER.get(agent_key, [])

    def guard(task_output):
        snap = campaign_tool.current().model_dump()
        missing: list[str] = []
        for path in required:
            v = _get_path(snap, path)
            if v in (None, "", []):
                missing.append(path)
        if missing:
            feedback = (
                "You did not call update_campaign properly. The shared "
                "campaign state is still missing these fields: "
                f"{', '.join(missing)}. "
                "Call update_campaign now with a patch_json that fills "
                "those fields. Do not write a Final Answer until "
                "update_campaign has returned successfully."
            )
            return (False, feedback)
        return (True, task_output)

    return guard


def _make(
    agent,
    description: str,
    expected: str,
    lang: str,
    context=None,
    guardrail_key: str | None = None,
) -> Task:
    kwargs: dict[str, Any] = dict(
        description=with_cot(description, lang),
        expected_output=expected,
        agent=agent,
    )
    if context is not None:
        kwargs["context"] = context
    if guardrail_key is not None and guardrail_key in EXPECTED_AFTER:
        kwargs["guardrail"] = _make_guardrail(guardrail_key)
        kwargs["guardrail_max_retries"] = 2
    return Task(**kwargs)


def build_tasks(agents: dict, merchant_input: str, lang: str) -> list[Task]:
    b = get_bundle(lang)
    cat_list = ", ".join(CATEGORIES.keys())

    desc, exp = b.task_intake(merchant_input, cat_list)
    intake = _make(
        agents["interviewer"], desc, exp, lang,
        guardrail_key="intake",
    )

    desc, exp = b.task_pricing()
    pricing = _make(
        agents["market_analyst"], desc, exp, lang,
        context=[intake],
        guardrail_key="pricing",
    )

    desc, exp = b.task_copy()
    copy = _make(
        agents["copywriter"], desc, exp, lang,
        context=[intake, pricing],
        guardrail_key="copy",
    )

    desc, exp = b.task_simulate()
    simulate = _make(agents["demand_simulator"], desc, exp, lang, context=[pricing])

    desc, exp = b.task_validate()
    validate = _make(
        agents["policy_validator"], desc, exp, lang, context=[copy, simulate]
    )

    desc, exp = b.task_archive()
    archive = _make(agents["archivist"], desc, exp, lang, context=[validate])

    return [intake, pricing, copy, simulate, validate, archive]
