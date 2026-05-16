# Offerly — Frontend

Next.js 15 + TypeScript + Tailwind. Renders the conversational onboarding UI and
streams agent progress over Server-Sent Events from the FastAPI backend.

## Run

```bash
# 1. Backend (in repo root)
make web                # FastAPI on http://localhost:8000

# 2. Frontend (this folder, separate terminal)
npm install
npm run dev             # Next.js on http://localhost:3000
```

The frontend rewrites `/api/*` and `/static/*` to the backend, so there's no
CORS plumbing in production paths. Override the backend URL with
`NEXT_PUBLIC_API_BASE`.

## Modes

- **Real**: clicks **Create my campaign**. Requires Ollama running and a
  pulled model (default `llama3.1:8b`). Takes 30–90s.
- **Demo**: clicks **Try demo**. Replays a canned campaign with realistic
  pacing — no LLM required. Useful for showcasing the UI.

## Structure

```
src/
  app/
    layout.tsx           # root layout
    page.tsx             # single-page app, orchestrates state
    globals.css
  components/
    Navbar.tsx           # logo center + ES/EN toggle
    Hero.tsx
    PromptCard.tsx       # textarea + CTA + example chips
    AgentTimeline.tsx    # 6-step progress with hover tooltip + expandable detail
    ResultPanel.tsx      # campaign cards (copy, pricing, simulation, summary)
    ErrorBanner.tsx
    Footer.tsx
  lib/
    i18n.ts              # EN/ES strings, agent descriptions & reasoning loop
    types.ts             # Campaign/Simulation/SSE types
    format.ts            # eur / pct / discount helpers
    useOnboarding.ts     # SSE client hook
```
