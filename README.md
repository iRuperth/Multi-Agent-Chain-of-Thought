<p align="center">
  <img src="offerly/web/static/Offerly.png" alt="Offerly" width="320" />
</p>

<h1 align="center">Offerly</h1>

<p align="center">
  <b>Multi-Agent Chain-of-Thought · Merchant Onboarding</b><br/>
  Turn a one-paragraph merchant pitch into a ready-to-publish promotional campaign.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/CrewAI-1.14-FF6B35" alt="CrewAI" />
  <img src="https://img.shields.io/badge/LiteLLM-1.83-7C3AED" alt="LiteLLM" />
  <img src="https://img.shields.io/badge/Ollama-qwen2.5:14b-000000?logo=ollama&logoColor=white" alt="Ollama" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

---

## What it is

Offerly is a **multi-agent system** that automates merchant onboarding for a deals
platform. The merchant types a free-form description of their business and the
offer they want to launch. Six AI agents collaborate over a shared campaign
state and produce a complete, validated campaign sheet:

- Catches the merchant's intent and structures it.
- Recommends a discount and price based on category benchmarks.
- Writes the marketing copy.
- Runs a Monte Carlo demand simulation.
- Validates everything against platform policies.
- Exports the final sheet to JSON and Markdown.

Every agent reasons explicitly with a **Chain-of-Thought** scaffold and writes
to a single Pydantic-typed state object. Each writer agent is wrapped in a
CrewAI `Task` with a **guardrail** that re-prompts the agent if it didn't
persist its required fields (up to 2 retries).

Stack: **CrewAI + LiteLLM + Ollama** (local LLM, default `qwen2.5:14b`) on a
Python 3.11 backend served by **FastAPI** (Server-Sent Events for live
progress), with a **Next.js 15 + TypeScript + Tailwind** frontend.

---

## How it works

```
   ┌────────────────────────┐
   │  Merchant pitch (text) │
   └───────────┬────────────┘
               ▼
   ┌────────────────────────┐
   │ 01 · Interviewer       │  extracts merchant_name, category,
   │    → update_campaign   │  city, goal, audience, pricing inputs
   └───────────┬────────────┘
               ▼
   ┌────────────────────────┐
   │ 02 · Market Analyst    │  decides discount, offerly_price,
   │    → benchmarks        │  stock, voucher validity, weekly slots
   │    → update_campaign   │
   └───────────┬────────────┘
               ▼
   ┌────────────────────────┐
   │ 03 · Copywriter        │  writes title, description, fine print
   │    → update_campaign   │  (anchored to real merchant data)
   └───────────┬────────────┘
               ▼
   ┌────────────────────────┐
   │ 04 · Demand Simulator  │  Monte Carlo: units p10/p50/p90,
   │    → simulate_demand   │  profit forecast, probability profitable
   └───────────┬────────────┘
               ▼
   ┌────────────────────────┐
   │ 05 · Policy Validator  │  banned terms, margin floor,
   │    → validate_policies │  voucher window, stock cap
   └───────────┬────────────┘
               ▼
   ┌────────────────────────┐
   │ 06 · Archivist         │  campaign_<slug>.json + .md
   │    → export_campaign   │  to ./out/
   └────────────────────────┘
```

All six agents share a single Pydantic **Campaign** model. Guardrails verify the
shared state after each writer agent and trigger a re-prompt if a required
field is still empty. The frontend streams progress and tool calls live over
Server-Sent Events.

---

## Quickstart

### Requirements

- Python 3.11+ and [`uv`](https://docs.astral.sh/uv/)
- Node 18+
- [Ollama](https://ollama.com) running locally

### 1. Pull the default model

```bash
ollama pull qwen2.5:14b
```

### 2. Install Python dependencies

```bash
uv sync
```

### 3. Install frontend dependencies (first time only)

```bash
cd frontend && npm install && cd ..
```

### 4. Start everything (backend + frontend)

```bash
make dev
```

### 5. Open the platform

```bash
open http://localhost:3000
```

### Alternative — run pieces separately

Start only the FastAPI backend (port 8000):

```bash
make web
```

Start only the Next.js frontend (port 3000):

```bash
make frontend
```

Run the legacy interactive CLI (no web UI):

```bash
make dev-cli
```

Smoke-test the pure-logic tools (no LLM required):

```bash
make smoke
```

### Override the model

```bash
OLLAMA_MODEL=llama3.1:8b make dev
```

---

## Project structure

```
.
├── Makefile                       # dev / web / frontend / dev-cli / smoke
├── pyproject.toml                 # python deps via uv
├── offerly/                       # Python package
│   ├── cli.py                     # legacy conversational CLI
│   ├── crew.py                    # crew assembly entrypoint
│   ├── agents.py                  # 6 CrewAI agents + LiteLLM routing
│   ├── tasks.py                   # tasks + guardrails + retries
│   ├── reasoning.py               # CoT helper wrappers
│   ├── domain/
│   │   ├── campaign.py            # Pydantic Campaign model
│   │   ├── categories.py          # category benchmarks
│   │   └── policies.py            # numeric platform thresholds
│   ├── tools/
│   │   ├── campaign.py            # update_/get_/export_campaign
│   │   ├── benchmarks.py          # category_benchmarks tool
│   │   ├── demand.py              # Monte Carlo simulator
│   │   └── policies.py            # validate_policies tool
│   ├── i18n/                      # EN + ES bundles
│   └── web/                       # FastAPI app
│       ├── app.py                 # endpoints + CORS + static
│       ├── jobs.py                # job registry + SSE format
│       ├── runner.py              # orchestrator + context wiring + fd capture
│       └── static/Offerly.png
├── frontend/                      # Next.js 15 + TS + Tailwind
│   └── src/
│       ├── app/{layout,page}.tsx
│       ├── components/*.tsx       # Navbar, Landing, PromptCard,
│       │                          # AgentTimeline, ResultPanel,
│       │                          # Console, HowItWorks, Pricing,
│       │                          # ApiSection, Contact, Footer …
│       └── lib/                   # i18n, types, format, useOnboarding
└── out/                           # campaign exports (gitignored)
```

---

## API endpoints

| Method | Path                       | Purpose |
|--------|----------------------------|---------|
| POST   | `/api/onboard`             | Create a new onboarding job. |
| GET    | `/api/stream/{job_id}`     | Server-Sent Events stream of progress + live logs. |
| GET    | `/api/job/{job_id}`        | Final snapshot once the run is done. |
| GET    | `/healthz`                 | Liveness probe. |
| GET    | `/docs`                    | Swagger UI generated by FastAPI. |

---

## Environment variables

| Variable               | Purpose                                             | Default                        |
|------------------------|-----------------------------------------------------|--------------------------------|
| `OLLAMA_MODEL`         | Model name (no prefix, runner adds `ollama_chat/`)  | `qwen2.5:14b`                  |
| `OLLAMA_BASE_URL`      | Ollama HTTP endpoint                                | `http://localhost:11434`       |
| `OFFERLY_LANG`         | Default language (`en` or `es`)                     | `en`                           |
| `OFFERLY_WEB_HOST`     | Backend host                                        | `127.0.0.1`                    |
| `OFFERLY_WEB_PORT`     | Backend port                                        | `8000`                         |
| `OFFERLY_WEB_RELOAD`   | uvicorn auto-reload (`1` to enable)                 | `0`                            |

