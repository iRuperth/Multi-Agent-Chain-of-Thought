"""FastAPI entrypoint serving the Offerly platform API.

Endpoints:
- ``POST /api/onboard``      — create a job, return its id.
- ``GET  /api/stream/{id}``  — Server-Sent Events stream of progress.
- ``GET  /api/job/{id}``     — final snapshot (campaign + summary) once done.
- ``GET  /static/*``         — logo and static assets.
- ``GET  /healthz``          — liveness probe.
"""
from __future__ import annotations

import asyncio
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .jobs import registry, sse_format
from .runner import start_job, write_campaign_to_disk

app = FastAPI(title="Offerly API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_STATIC_DIR = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(_STATIC_DIR)), name="static")


class OnboardRequest(BaseModel):
    merchant_input: str = Field(..., min_length=3)
    lang: str = Field(default="en")
    demo: bool = Field(default=False)
    creative: bool = Field(default=False)


class OnboardResponse(BaseModel):
    job_id: str
    demo: bool


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/onboard", response_model=OnboardResponse)
async def onboard(req: OnboardRequest) -> OnboardResponse:
    job = registry.create(
        req.merchant_input.strip(),
        req.lang,
        req.demo,
        creative=req.creative,
    )
    # Attach the running loop so background threads can push SSE events.
    job.attach_loop(asyncio.get_running_loop())
    start_job(job)
    return OnboardResponse(job_id=job.id, demo=job.demo)


@app.get("/api/stream/{job_id}")
async def stream(job_id: str) -> StreamingResponse:
    job = registry.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="job not found")
    job.attach_loop(asyncio.get_running_loop())

    async def event_source():
        # Immediate snapshot so the client can render initial state.
        yield sse_format(
            {
                "event": "snapshot",
                "data": {
                    "status": job.status,
                    "current_agent": job.current_agent,
                    "completed": list(job.completed_agents),
                    "demo": job.demo,
                },
            }
        )
        async for payload in job.events():
            yield sse_format(payload)
            if payload["event"] == "done" and job.campaign:
                try:
                    write_campaign_to_disk(job.campaign)
                except Exception:
                    pass

    return StreamingResponse(
        event_source(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/job/{job_id}")
def get_job(job_id: str) -> dict:
    job = registry.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="job not found")
    return {
        "id": job.id,
        "status": job.status,
        "current_agent": job.current_agent,
        "completed": list(job.completed_agents),
        "campaign": job.campaign,
        "summary": job.summary,
        "error": job.error,
        "demo": job.demo,
    }
