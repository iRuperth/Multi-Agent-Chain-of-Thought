"""Definition of the 6 onboarding agents."""
from __future__ import annotations

import os

from crewai import Agent, LLM

from .i18n import get_bundle
from .reasoning import with_cot_backstory
from .tools.benchmarks import CategoryBenchmarksTool
from .tools.campaign import (
    ExportCampaignTool,
    GetCampaignTool,
    UpdateCampaignTool,
)
from .tools.demand import SimulateDemandTool
from .tools.policies import ValidatePoliciesTool


def _llm(creative: bool = False) -> LLM:
    """Build the LLM used by every agent.

    ``creative=False`` (default) → temperature 0.0: the agents only act on
    facts already in the campaign state. Reduces hallucination — same input
    yields near-identical output. Copy reads flatter but truthful.

    ``creative=True`` → temperature 0.6: the agents are allowed to
    experiment with copy angles, slot choices, etc. More vivid output,
    higher risk of inventing data.

    Note on the prefix: we force ``ollama_chat/`` (not ``ollama/``).
    LiteLLM routes ``ollama/`` to /api/generate which does NOT support
    native tool-calling — the LLM ends up emitting tool-call JSON as text
    that CrewAI cannot parse, so update_campaign never fires and the
    shared state stays empty. ``ollama_chat/`` routes to /api/chat which
    speaks Ollama's native tool protocol.
    """
    raw_model = os.getenv("OLLAMA_MODEL", "ollama/llama3.1:8b")
    # Strip any prefix; CrewAI's LLM only honours the prefix when we pass it
    # via the explicit `provider=` kwarg. Without that, the model string gets
    # mangled (the prefix is silently dropped and the base_url falls back to
    # /v1, the OpenAI-compatibility endpoint, which DOES NOT support Ollama's
    # native tool-call protocol).
    for pfx in ("ollama_chat/", "ollama/"):
        if raw_model.startswith(pfx):
            raw_model = raw_model[len(pfx):]
            break
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    temperature = 0.6 if creative else 0.0
    # We MUST force is_litellm=True. CrewAI's native OpenAICompatibleCompletion
    # provider for ollama_chat is broken with CrewAI BaseTool objects — it
    # raises "Tool must be a dictionary" when serialising tools for the
    # request, so update_campaign etc. never actually fire and the LLM is
    # left to write tool-call JSON as plain text in <thinking>. LiteLLM does
    # accept BaseTool correctly. Pass the prefix as part of the model name
    # so LiteLLM routes to /api/chat (native tool-calling endpoint).
    model_for_litellm = f"ollama_chat/{raw_model}"
    return LLM(
        model=model_for_litellm,
        is_litellm=True,
        base_url=base_url,
        temperature=temperature,
    )


def _agent(spec: dict, lang: str, tools: list, llm: LLM, max_iter: int = 5) -> Agent:
    return Agent(
        role=spec["role"],
        goal=spec["goal"],
        backstory=with_cot_backstory(spec["backstory"], lang),
        tools=tools,
        llm=llm,
        allow_delegation=False,
        verbose=True,
        max_iter=max_iter,
    )


# Per-agent iteration budgets. Creative agents that have to write multiple
# fields in one task (title + description + fine_print, or four pricing
# numbers) need more attempts before declaring the task done; deterministic
# agents (policy check, file export) finish in 1–2 iterations.
_MAX_ITER = {
    "interviewer":      8,   # extracts 7 fields from free text
    "market_analyst":   8,   # writes 4 pricing numbers + must call benchmarks
    "copywriter":      10,   # title + description + fine_print, hardest task
    "demand_simulator": 5,   # one tool call, straightforward
    "policy_validator": 5,   # rule-based, fast
    "archivist":        4,   # two tool calls, deterministic
}


def build_agents(lang: str, creative: bool = False) -> dict[str, Agent]:
    llm = _llm(creative=creative)
    specs = get_bundle(lang).AGENTS

    update_tool = UpdateCampaignTool()
    get_tool = GetCampaignTool()

    # Tool philosophy: each agent gets the MINIMUM tools it needs.
    # Small LLMs get confused when given many tools — they tend to call
    # get_campaign 17 times in a row instead of writing. CrewAI already
    # passes the previous task's text output as context, so write-agents
    # do NOT need get_campaign — the data they need is in the prompt.
    return {
        # WRITES the campaign — no need to read it (it's empty at start).
        "interviewer": _agent(
            specs["interviewer"], lang, [update_tool], llm,
            max_iter=_MAX_ITER["interviewer"],
        ),
        # WRITES copy — gets intake+pricing as context text via task wiring.
        "copywriter": _agent(
            specs["copywriter"], lang, [update_tool], llm,
            max_iter=_MAX_ITER["copywriter"],
        ),
        # NEEDS benchmarks tool, writes pricing — gets intake as context.
        "market_analyst": _agent(
            specs["market_analyst"],
            lang,
            [CategoryBenchmarksTool(), update_tool],
            llm,
            max_iter=_MAX_ITER["market_analyst"],
        ),
        # One tool, one job.
        "demand_simulator": _agent(
            specs["demand_simulator"],
            lang,
            [SimulateDemandTool()],
            llm,
            max_iter=_MAX_ITER["demand_simulator"],
        ),
        # READS state to validate against policies.
        "policy_validator": _agent(
            specs["policy_validator"],
            lang,
            [ValidatePoliciesTool(), get_tool],
            llm,
            max_iter=_MAX_ITER["policy_validator"],
        ),
        # READS final state to export it.
        "archivist": _agent(
            specs["archivist"], lang, [get_tool, ExportCampaignTool()], llm,
            max_iter=_MAX_ITER["archivist"],
        ),
    }
