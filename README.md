# Offerly — Multi-Agent Merchant Onboarding

Multi-agent system that talks to a **merchant** who wants to launch an offer,
helps them define it, and delivers a **campaign sheet** consistent with
platform policies and economically viable.

Built with **CrewAI** + **Ollama** (local LLM). Bilingual: English / Spanish.

## The case

Today every new merchant goes through a human *Merchant Success Manager*
who, by phone, defines:

- Which service / product to promote
- Discount and final price
- Copy (title, description, terms)
- Restrictions (slots, expiry, exclusions)
- Margin and volume estimate

It is expensive, slow and hardly scalable. Offerly automates it with six
agents that collaborate, validate real platform policies and simulate demand
before publishing.

## Architecture

Six agents in a `Crew` with a directed flow:

| Agent | Role | Tools |
|---|---|---|
| **Interviewer** | Drives the conversation, extracts merchant intent | — |
| **Copy Creative** | Proposes title, hook and attractive description | — |
| **Market Analyst** | Recommends optimal discount per category / area | `category_benchmarks` |
| **Demand Simulator** | "Rolls the dice": Monte Carlo of units sold and margin | `simulate_demand` |
| **Policy Validator** | Checks the platform T&Cs (legality, expiries, etc.) | `validate_policies` |
| **Archivist** | Maintains and serializes the campaign sheet | `update_campaign`, `get_campaign`, `export_campaign` |

Flow: `understand → propose copy → analyze market → simulate demand → validate policies → archive`.

Every agent uses **Chain-of-Thought**: before acting it writes a `<thinking>`
block with 7 steps (observe, gaps, options, criteria, choose, act, self-critique).
The CoT scaffolding is localized — it runs in the active language so the
final copy is generated in the same language.

## Web platform (Next.js + FastAPI)

A polished web frontend ships in `frontend/`, backed by a FastAPI server in
`offerly/web/`. The same six agents run, and progress streams to the browser
over Server-Sent Events.

```bash
# Terminal 1 — backend (FastAPI on :8000)
make web

# Terminal 2 — frontend (Next.js on :3000)
make frontend-install   # first time only
make frontend
# open http://localhost:3000
```

The UI has:

- A clean off-white interface with the **Offerly** logo centered in the navbar.
- An **EN / ES** toggle.
- A textarea where the merchant describes the business in free text.
- A live **agent timeline** with the six steps — hover a step for a quick
  tooltip, click to expand the goal, reasoning loop and tools.
- A final **campaign sheet** rendered as cards: copy, pricing & margin, Monte
  Carlo simulation, and the crew's summary.
- A **demo** mode that does not require Ollama — handy to showcase the UI.

## Installation

The environment is managed with [`uv`](https://docs.astral.sh/uv/).

```bash
# 1. Ollama running locally with a capable model
ollama pull llama3.1:8b

# 2. Create venv and install dependencies (uv reads pyproject.toml)
uv sync

# 3. Launch the CLI (English by default)
uv run offerly

# Spanish:
uv run offerly --lang es
# or
OFFERLY_LANG=es uv run offerly
```

Optional environment variables:
- `OLLAMA_MODEL` (default `ollama/llama3.1:8b`)
- `OLLAMA_BASE_URL` (default `http://localhost:11434`)
- `OFFERLY_LANG` (`en` or `es`, default `en`)

## Usage

```
> I run a spa in Soho, I want to fill Tuesday and Wednesday afternoons.
```

The system interprets the intent, asks follow-ups, proposes copy, recommends
a discount, simulates demand with Monte Carlo, validates policies and
exports to `out/campaign_<slug>.json` + Markdown.

## Structure

```
offerly/
  cli.py                # conversational loop + --lang flag
  crew.py               # crew assembly
  agents.py             # the 6 agents (built per locale)
  tasks.py              # tasks per turn (built per locale)
  reasoning.py          # CoT wrappers
  i18n/
    __init__.py         # locale selector
    en.py               # English bundle (prompts, CLI, MD labels, banned lists)
    es.py               # Spanish bundle
  tools/
    demand.py           # Monte Carlo simulation
    policies.py         # T&Cs validator (uses bundle for messages + bans)
    benchmarks.py       # per-category benchmarks
    campaign.py         # campaign state (carries active lang)
  domain/
    policies.py         # numeric thresholds (single source of truth)
    categories.py       # categories and benchmarks
    campaign.py         # campaign sheet model (pydantic)
docs/
  POLICIES.md           # human-readable policies
out/
  campaign_*.json
```
