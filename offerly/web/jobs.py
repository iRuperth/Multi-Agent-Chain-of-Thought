"""In-memory job registry for onboarding runs.

Each job tracks the progress of the six agents and the final campaign
payload once the Crew finishes. Events are streamed over SSE.
"""
from __future__ import annotations

import asyncio
import json
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Optional

AGENT_ORDER = [
    "interviewer",
    "market_analyst",
    "copywriter",
    "demand_simulator",
    "policy_validator",
    "archivist",
]


@dataclass
class Job:
    id: str
    lang: str
    merchant_input: str
    demo: bool = False
    creative: bool = False
    created_at: float = field(default_factory=time.time)
    status: str = "pending"  # pending | running | done | error
    current_agent: Optional[str] = None
    completed_agents: list[str] = field(default_factory=list)
    error: Optional[str] = None
    campaign: Optional[dict[str, Any]] = None
    summary: Optional[str] = None
    _queue: "asyncio.Queue[dict[str, Any]]" = field(default_factory=asyncio.Queue)
    _loop: Optional[asyncio.AbstractEventLoop] = None
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def attach_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    def emit(self, event: str, data: dict[str, Any]) -> None:
        payload = {"event": event, "data": data, "ts": time.time()}
        if self._loop is None:
            return
        try:
            self._loop.call_soon_threadsafe(self._queue.put_nowait, payload)
        except RuntimeError:
            # Loop might be closed if client disconnected; drop the event.
            pass

    async def events(self):
        while True:
            payload = await self._queue.get()
            yield payload
            if payload["event"] in {"done", "error"}:
                return


class JobRegistry:
    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()

    def create(
        self,
        merchant_input: str,
        lang: str,
        demo: bool,
        creative: bool = False,
    ) -> Job:
        jid = uuid.uuid4().hex[:12]
        job = Job(
            id=jid,
            lang=lang,
            merchant_input=merchant_input,
            demo=demo,
            creative=creative,
        )
        with self._lock:
            self._jobs[jid] = job
        return job

    def get(self, jid: str) -> Optional[Job]:
        with self._lock:
            return self._jobs.get(jid)


registry = JobRegistry()


def sse_format(payload: dict[str, Any]) -> str:
    """Serialize a payload into SSE wire format."""
    return f"event: {payload['event']}\ndata: {json.dumps(payload['data'])}\n\n"
