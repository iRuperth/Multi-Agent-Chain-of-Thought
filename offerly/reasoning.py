"""Chain-of-Thought helpers that wrap task descriptions and agent backstories.

The reasoning scaffolding itself lives in the i18n bundle so that agents
think in the active language. This module just provides thin wrappers.
"""
from __future__ import annotations

from .i18n import get_bundle


def with_cot(description: str, lang: str) -> str:
    """Prepend the localized language note to a task description.

    Note: the CoT preamble itself is now disabled. CrewAI injects its own
    ReAct scaffold that handles tool invocation natively. Our custom CoT
    preamble was confusing small LLMs (llama3.1:8b) into roleplaying the
    entire ReAct loop as text, including faking tool-call JSON, instead of
    actually invoking tools through the function-calling protocol.
    Removing it makes tool calls reliable."""
    b = get_bundle(lang)
    return f"{b.OUTPUT_LANGUAGE_NOTE}\n\n{description}"


def with_cot_backstory(backstory: str, lang: str) -> str:
    """Append the localized working-method suffix to an agent's backstory."""
    b = get_bundle(lang)
    return backstory + b.COT_BACKSTORY_SUFFIX
