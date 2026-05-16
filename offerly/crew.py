"""Crew assembly."""
from __future__ import annotations

import os
from urllib.error import URLError
from urllib.request import urlopen

from crewai import Crew, Process

from .agents import build_agents
from .i18n import normalize
from .tasks import build_tasks
from .tools import campaign as campaign_tool


class OllamaUnavailableError(RuntimeError):
    """Raised when the configured Ollama endpoint is not reachable."""


def _preflight_ollama() -> None:
    """Fail fast with a clear message if Ollama is not reachable.

    CrewAI/LiteLLM otherwise prints a misleading 'Failed to connect to
    OpenAI API' when the configured provider is unreachable.
    """
    model = os.getenv("OLLAMA_MODEL", "ollama/llama3.1:8b")
    if not model.startswith("ollama/"):
        return
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    try:
        with urlopen(f"{base_url}/api/tags", timeout=2) as resp:
            if resp.status >= 400:
                raise OllamaUnavailableError(
                    f"Ollama at {base_url} returned HTTP {resp.status}."
                )
    except (URLError, OSError, ValueError) as e:
        raise OllamaUnavailableError(
            f"Cannot reach Ollama at {base_url}: {e}.\n"
            "Start it with `ollama serve` (or `brew services start ollama`) "
            f"and make sure the model is pulled: `ollama pull {model.removeprefix('ollama/')}`."
        ) from e


def run_onboarding(merchant_input: str, lang: str = "en") -> str:
    lang = normalize(lang)
    _preflight_ollama()
    campaign_tool.reset(lang=lang)
    agents = build_agents(lang)
    tasks = build_tasks(agents, merchant_input, lang)
    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
    )
    result = crew.kickoff()
    return str(result)
