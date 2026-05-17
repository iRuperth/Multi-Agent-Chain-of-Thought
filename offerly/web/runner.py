"""Background runner that drives the Crew and emits SSE events.

Two execution modes:

- Real: build agents/tasks/crew exactly like the CLI, but execute each task
  individually via ``task.execute_sync()`` so we can emit per-agent events.
- Demo: replay a canned campaign with realistic pacing — useful when Ollama
  is not running or for showcasing the UI.
"""
from __future__ import annotations

import io
import json
import logging
import os
import re
import sys
import threading
import time
from pathlib import Path
from typing import Any

from .jobs import AGENT_ORDER, Job


_ANSI_RE = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")
_BOX_CHARS = "─━│┃┄┅┆┇┈┉┊┋┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋╌╍╎╏═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬╭╮╯╰╱╲╳╴╵╶╷╸╹╺╻╼╽╾╿"


def _clean(line: str) -> str:
    """Strip ANSI codes and Rich box-drawing chars so the UI console is clean."""
    line = _ANSI_RE.sub("", line)
    return "".join(ch for ch in line if ch not in _BOX_CHARS).rstrip()


class _LogStream(io.TextIOBase):
    """File-like that forwards writes to the job's SSE log channel."""

    def __init__(self, job: Job, stream: str, mirror: Any = None) -> None:
        self.job = job
        self.stream = stream
        self.mirror = mirror
        self._buf = ""

    def writable(self) -> bool:  # pragma: no cover
        return True

    def write(self, s: str) -> int:
        if self.mirror is not None:
            try:
                self.mirror.write(s)
            except Exception:
                pass
        self._buf += s
        while "\n" in self._buf:
            line, self._buf = self._buf.split("\n", 1)
            self._emit(line)
        return len(s)

    def flush(self) -> None:  # pragma: no cover
        if self._buf:
            self._emit(self._buf)
            self._buf = ""
        if self.mirror is not None:
            try:
                self.mirror.flush()
            except Exception:
                pass

    def _emit(self, line: str) -> None:
        clean = _clean(line)
        if not clean.strip():
            return
        self.job.emit("log", {"stream": self.stream, "line": clean})


class _FdCapture:
    """Capture writes to a real file descriptor (1=stdout, 2=stderr) and
    forward each line to the job's SSE log channel. This is the only way
    to intercept output from libraries that write directly to the TTY
    (Rich, CrewAI's Console, LiteLLM banners) instead of going through
    Python's ``sys.stdout``."""

    def __init__(self, job: Job, fd: int, stream: str) -> None:
        self.job = job
        self.fd = fd
        self.stream = stream
        self._saved_fd: int | None = None
        self._read_fd: int | None = None
        self._write_fd: int | None = None
        self._thread: threading.Thread | None = None
        self._buf = b""

    def start(self) -> None:
        # Duplicate the original fd so we can restore it later.
        self._saved_fd = os.dup(self.fd)
        # Build a pipe and redirect the real fd to the write side.
        r, w = os.pipe()
        self._read_fd, self._write_fd = r, w
        os.dup2(w, self.fd)
        # We don't need the original write end now that the real fd points
        # to the same kernel object via dup2.
        os.close(w)
        self._write_fd = None
        self._thread = threading.Thread(
            target=self._pump, name=f"fd-capture-{self.stream}", daemon=True
        )
        self._thread.start()

    def _pump(self) -> None:
        assert self._read_fd is not None
        try:
            while True:
                try:
                    chunk = os.read(self._read_fd, 4096)
                except OSError:
                    return
                if not chunk:
                    return
                self._buf += chunk
                while b"\n" in self._buf:
                    line, self._buf = self._buf.split(b"\n", 1)
                    self._emit_bytes(line)
        finally:
            if self._buf:
                self._emit_bytes(self._buf)
                self._buf = b""

    def _emit_bytes(self, raw: bytes) -> None:
        try:
            text = raw.decode("utf-8", errors="replace")
        except Exception:
            return
        clean = _clean(text)
        if not clean.strip():
            return
        self.job.emit("log", {"stream": self.stream, "line": clean})

    def stop(self) -> None:
        # Restore the real fd; closing the read side breaks the pump loop.
        try:
            if self._saved_fd is not None:
                os.dup2(self._saved_fd, self.fd)
                os.close(self._saved_fd)
                self._saved_fd = None
        except OSError:
            pass
        try:
            if self._read_fd is not None:
                os.close(self._read_fd)
                self._read_fd = None
        except OSError:
            pass
        if self._thread is not None:
            self._thread.join(timeout=1.0)
            self._thread = None


class _JobLogHandler(logging.Handler):
    """Forward Python logging records to the job's SSE log channel.
    CrewAI, LiteLLM, httpx, etc. use the logging module — capturing it
    here is more reliable than only redirecting stdout."""

    def __init__(self, job: Job) -> None:
        super().__init__(level=logging.INFO)
        self.job = job
        self.setFormatter(
            logging.Formatter("%(name)s: %(message)s")
        )

    def emit(self, record: logging.LogRecord) -> None:
        try:
            line = _clean(self.format(record))
            if not line.strip():
                return
            stream = "stderr" if record.levelno >= logging.WARNING else "stdout"
            self.job.emit("log", {"stream": stream, "line": line})
        except Exception:
            pass


DEMO_CAMPAIGN: dict[str, Any] = {
    "merchant_name": "Trattoria Buona Sera",
    "business_type": "Italian restaurant",
    "city": "Madrid",
    "neighborhood": "Malasaña",
    "category": "food_drink",
    "offer_name": "Buona Sera Tasting Menu",
    "title": "4-course Italian tasting menu for two in Malasaña",
    "description": (
        "Enjoy an intimate weeknight dinner with a 4-course Italian "
        "tasting menu for two, plus a glass of wine. Pasta made in "
        "house, friendly service and a cozy dining room in the heart "
        "of Malasaña. Perfect for Wednesday or Thursday evenings."
    ),
    "fine_print": [
        "Prior booking required",
        "Not stackable with other offers",
        "Not valid on public holidays",
    ],
    "pricing": {
        "pvp_eur": 65.0,
        "offerly_price_eur": 39.0,
        "variable_cost_eur": 22.0,
        "commission_pct": 40.0,
    },
    "weekly_capacity": 50,
    "weekly_slots": ["Wed 19-22", "Thu 19-22", "Fri 19-22"],
    "voucher_validity_days": 120,
    "stock": 120,
    "target_audience": "Couples 30–55 looking for an intimate weeknight dinner",
    "goal": "Fill slow Wednesday and Thursday dinner slots",
    "simulation": {
        "units_p10": 58,
        "units_p50": 96,
        "units_p90": 120,
        "profit_p10_eur": 92.8,
        "profit_p50_eur": 153.6,
        "profit_p90_eur": 192.0,
        "probability_profitable": 0.97,
    },
}


def _emit_started(job: Job, agent: str) -> None:
    job.current_agent = agent
    job.emit(
        "agent_started",
        {"agent": agent, "completed": list(job.completed_agents)},
    )


def _emit_completed(job: Job, agent: str) -> None:
    if agent not in job.completed_agents:
        job.completed_agents.append(agent)
    job.current_agent = None
    job.emit(
        "agent_completed",
        {"agent": agent, "completed": list(job.completed_agents)},
    )


def _run_demo(job: Job) -> None:
    job.status = "running"
    job.emit("status", {"status": "running", "demo": True})
    timings = {
        "interviewer": 1.6,
        "market_analyst": 1.2,
        "copywriter": 1.8,
        "demand_simulator": 1.4,
        "policy_validator": 1.0,
        "archivist": 0.7,
    }
    for agent in AGENT_ORDER:
        _emit_started(job, agent)
        time.sleep(timings.get(agent, 1.0))
        _emit_completed(job, agent)
    job.campaign = DEMO_CAMPAIGN
    job.summary = (
        "Demo campaign generated. Six agents ran sequentially and produced "
        "a campaign sheet for Spa Aurora with a 50% discount, "
        "Mon–Wed afternoon slots, and a 94% probability of profitability."
    )
    job.status = "done"
    job.emit(
        "done",
        {
            "campaign": job.campaign,
            "summary": job.summary,
            "completed": list(job.completed_agents),
        },
    )


_CAMPAIGN_KEYS = {
    "merchant_name", "business_type", "city", "neighborhood",
    "category", "offer_name", "title", "description", "fine_print",
    "pricing", "weekly_capacity", "weekly_slots",
    "voucher_validity_days", "stock", "target_audience", "goal",
}


def _harvest_candidates(raw: str) -> list[dict[str, Any]]:
    """Pull every dict-shaped JSON blob out of a string, biggest first."""
    found: list[dict[str, Any]] = []
    # Fenced ```json blocks
    for m in re.finditer(r"```(?:json)?\s*(\{[\s\S]+?\})\s*```", raw):
        try:
            obj = json.loads(m.group(1))
            if isinstance(obj, dict):
                found.append(obj)
        except (json.JSONDecodeError, ValueError):
            pass
    # Bracketed scan: every balanced {...} substring.
    depth = 0
    start = -1
    for i, ch in enumerate(raw):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start != -1:
                blob = raw[start : i + 1]
                try:
                    obj = json.loads(blob)
                    if isinstance(obj, dict):
                        found.append(obj)
                except (json.JSONDecodeError, ValueError):
                    pass
                start = -1
    return found


def _looks_like_campaign(d: dict) -> bool:
    return any(k in d for k in _CAMPAIGN_KEYS)


def _backfill_campaign(
    current: dict[str, Any], outputs: list[str]
) -> tuple[dict[str, Any], list[str]]:
    """Backfill any nulls in *current* using JSON blobs found in the agent
    outputs. Returns (new_campaign_dict, list_of_filled_keys).

    Important: we ONLY fill keys that are currently null/empty. We never
    overwrite something an agent legitimately wrote via update_campaign."""
    from ..domain.campaign import Campaign

    filled: list[str] = []

    def is_empty(v: Any) -> bool:
        if v in (None, "", []):
            return True
        if isinstance(v, dict):
            return all(is_empty(sv) for sv in v.values())
        return False

    # Walk outputs newest-first so the most-recent agent's view wins.
    for raw in reversed(outputs):
        if not isinstance(raw, str):
            continue
        for cand in _harvest_candidates(raw):
            if not _looks_like_campaign(cand):
                continue
            # Explode dot-notation just like the tool does.
            from ..tools.campaign import _explode_dot_keys
            exploded = _explode_dot_keys(cand)

            def merge_missing(into: dict, src: dict, path: str = "") -> None:
                for k, v in src.items():
                    p = f"{path}.{k}" if path else k
                    if k not in into:
                        if k not in _CAMPAIGN_KEYS and not path:
                            continue
                        into[k] = v
                        filled.append(p)
                    elif isinstance(into[k], dict) and isinstance(v, dict):
                        merge_missing(into[k], v, p)
                    elif is_empty(into[k]) and not is_empty(v):
                        into[k] = v
                        filled.append(p)

            merge_missing(current, exploded)

    try:
        validated = Campaign.model_validate(current).model_dump()
        return validated, filled
    except Exception:
        return current, filled


def _try_recover_campaign(outputs: list[str]) -> dict[str, Any] | None:
    """Backward-compatible wrapper for the runner's "campaign-completely-empty"
    fallback path. Builds an empty campaign and backfills it from outputs."""
    from ..domain.campaign import Campaign

    empty = Campaign().model_dump()
    filled, _ = _backfill_campaign(empty, outputs)
    if any(filled.get(k) for k in _CAMPAIGN_KEYS):
        return filled
    return None


def _run_real(job: Job) -> None:
    """Run the real Crew, executing each task synchronously so we can
    emit per-agent events. Captures stdout/stderr from CrewAI/LiteLLM/etc.
    and forwards every line to the SSE ``log`` channel so the UI console
    can display it instead of the terminal."""
    from ..agents import build_agents
    from ..i18n import normalize
    from ..tasks import build_tasks
    from ..tools import campaign as campaign_tool

    lang = normalize(job.lang)
    campaign_tool.reset(lang=lang)
    agents = build_agents(lang, creative=job.creative)
    tasks = build_tasks(agents, job.merchant_input, lang)

    task_agent_keys = [
        "interviewer",
        "market_analyst",
        "copywriter",
        "demand_simulator",
        "policy_validator",
        "archivist",
    ]

    job.status = "running"
    job.emit("status", {"status": "running", "demo": False})

    # CrewAI/Rich/LiteLLM write directly to the real file descriptors 1 and 2,
    # bypassing Python's sys.stdout. The only reliable way to capture that is
    # to dup2 the fds into a pipe we own and pump the bytes into SSE.
    real_out, real_err = sys.stdout, sys.stderr
    fd_out = _FdCapture(job, fd=1, stream="stdout")
    fd_err = _FdCapture(job, fd=2, stream="stderr")
    fd_out.start()
    fd_err.start()
    # After dup2, sys.stdout/stderr still point to the original wrappers but
    # the underlying fd is now the pipe; refresh sys.stdout/stderr to fresh
    # text wrappers so flushing them doesn't write to closed fds.
    sys.stdout = io.TextIOWrapper(
        os.fdopen(os.dup(1), "wb", buffering=0), encoding="utf-8", write_through=True
    )
    sys.stderr = io.TextIOWrapper(
        os.fdopen(os.dup(2), "wb", buffering=0), encoding="utf-8", write_through=True
    )

    log_handler = _JobLogHandler(job)
    root_logger = logging.getLogger()
    root_logger.addHandler(log_handler)

    # Bump verbosity on libraries that drive the LLM so the platform terminal
    # shows what would otherwise only live in the Ollama process logs:
    # - litellm: prints model + request payload summary
    # - httpx: prints HTTP POST /v1/chat/completions calls
    # - crewai: prints agent task lifecycle
    _previous_levels: dict[str, int] = {}
    for name in ("litellm", "httpx", "httpcore", "crewai", "LiteLLM"):
        lg = logging.getLogger(name)
        _previous_levels[name] = lg.level
        lg.setLevel(logging.INFO)

    # Heartbeat: print a tick every 4s so the UI shows something even when the
    # LLM is silent for a long stretch (Ollama can be quiet for 20+ seconds).
    stop_heartbeat = threading.Event()

    def _heartbeat() -> None:
        ticks = 0
        while not stop_heartbeat.wait(4.0):
            ticks += 1
            agent = job.current_agent or "—"
            job.emit(
                "log",
                {"stream": "stdout", "line": f"… still working ({agent}, {ticks * 4}s)"},
            )

    hb_thread = threading.Thread(target=_heartbeat, daemon=True)
    hb_thread.start()

    outputs: list[str] = []
    try:
        for task, agent_key in zip(tasks, task_agent_keys):
            _emit_started(job, agent_key)
            job.emit(
                "log",
                {"stream": "stdout", "line": f"▶ starting agent: {agent_key}"},
            )
            # CrewAI does NOT auto-resolve `task.context=[prior_task]` when
            # you call execute_sync() outside of Crew.kickoff(). We have to
            # materialise the context string ourselves from the prior tasks'
            # outputs and pass it explicitly. Without this, the Market
            # Analyst and Copywriter ask "what is the category from context?"
            # because they receive an empty context.
            context_str: str | None = None
            ctx_tasks = task.context if isinstance(task.context, list) else []
            if ctx_tasks:
                pieces: list[str] = []
                for ct in ctx_tasks:
                    if getattr(ct, "output", None) is not None:
                        raw = getattr(ct.output, "raw", None) or str(ct.output)
                        if raw:
                            pieces.append(str(raw))
                if pieces:
                    context_str = (
                        "Context from previous tasks (use these values "
                        "verbatim — do not ask for them):\n\n"
                        + "\n\n---\n\n".join(pieces)
                    )

            # Copywriter has been observed to ignore the upstream context
            # text and write copy about a default "spa" prior. Hard-anchor
            # the real merchant_name / business_type / category at the top
            # of its context so the LLM cannot drift toward a generic prior.
            if agent_key == "copywriter":
                snap = campaign_tool.current()
                if snap.merchant_name and snap.business_type:
                    anchor = (
                        "YOU MUST WRITE COPY FOR THIS EXACT BUSINESS:\n"
                        f"- merchant_name: {snap.merchant_name}\n"
                        f"- business_type: {snap.business_type}\n"
                        f"- category: {snap.category}\n"
                        f"- city / neighborhood: "
                        f"{snap.city or '(unknown)'} / "
                        f"{snap.neighborhood or '(unknown)'}\n\n"
                        "Do NOT write about any other business type. "
                        "The service you describe MUST match "
                        f"'{snap.business_type}' literally — not a spa, "
                        "not a salon, not anything else.\n\n"
                    )
                    context_str = anchor + (context_str or "")

            try:
                if context_str:
                    result = task.execute_sync(context=context_str)
                else:
                    result = task.execute_sync()
            except Exception as exc:  # pragma: no cover - depends on LLM
                job.status = "error"
                job.error = f"{agent_key} failed: {exc}"
                job.emit("error", {"message": job.error, "agent": agent_key})
                return
            outputs.append(str(result))

            # Snapshot the shared state after each agent so we can see in the
            # platform terminal whether the LLM actually called update_campaign.
            try:
                snap = campaign_tool.current().model_dump()
                filled = {
                    k: v
                    for k, v in snap.items()
                    if v not in (None, [], "", 0.0)
                    and not (isinstance(v, dict) and all(
                        sv in (None, [], "", 0.0, 40.0) for sv in v.values()
                    ))
                }
                job.emit(
                    "log",
                    {
                        "stream": "stdout",
                        "line": f"  state after {agent_key}: {len(filled)} fields populated",
                    },
                )
                if not filled:
                    job.emit(
                        "log",
                        {
                            "stream": "stderr",
                            "line": f"  ⚠ {agent_key} did not update the campaign — output: {str(result)[:200]}",
                        },
                    )
            except Exception as snap_exc:
                job.emit(
                    "log",
                    {"stream": "stderr", "line": f"  snapshot error: {snap_exc}"},
                )

            job.emit(
                "log",
                {"stream": "stdout", "line": f"✓ completed agent: {agent_key}"},
            )
            _emit_completed(job, agent_key)
        sys.stdout.flush()
        sys.stderr.flush()
    finally:
        stop_heartbeat.set()
        # Restore real fds first, then swap sys.stdout/stderr back to the
        # originals so any leftover writes go to the real terminal again.
        fd_out.stop()
        fd_err.stop()
        try:
            sys.stdout.close()
        except Exception:
            pass
        try:
            sys.stderr.close()
        except Exception:
            pass
        sys.stdout = real_out
        sys.stderr = real_err
        root_logger.removeHandler(log_handler)
        for name, lvl in _previous_levels.items():
            logging.getLogger(name).setLevel(lvl)

    final = campaign_tool.current().model_dump()

    # The backfill is intentionally DISABLED for partial states. It used to
    # scan agent output text for JSON blobs and fill any remaining holes,
    # but in practice this combined blobs from DIFFERENT agents (each
    # narrating about different examples or guesses), producing Frankenstein
    # campaigns that mixed e.g. merchant_name from one agent with
    # target_audience from another. Honest empty fields + the amber
    # "missing data" banner is preferable to invented composites.

    job.campaign = final
    job.summary = outputs[-1] if outputs else ""
    job.status = "done"
    job.emit(
        "done",
        {
            "campaign": job.campaign,
            "summary": job.summary,
            "completed": list(job.completed_agents),
        },
    )


def start_job(job: Job) -> None:
    """Spawn a daemon thread to drive the job. Auto-falls back to demo if
    the real run raises an import-time error (e.g. CrewAI not installed)."""
    def _target() -> None:
        try:
            if job.demo:
                _run_demo(job)
            else:
                _run_real(job)
        except Exception as exc:  # pragma: no cover
            job.status = "error"
            job.error = str(exc)
            job.emit("error", {"message": str(exc)})

    threading.Thread(target=_target, name=f"job-{job.id}", daemon=True).start()


def write_campaign_to_disk(campaign: dict[str, Any], out_dir: str = "out") -> str:
    """Persist a campaign dict to JSON for parity with the CLI flow."""
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    slug = (campaign.get("offer_name") or campaign.get("merchant_name") or "campaign")
    slug = "".join(c if c.isalnum() else "_" for c in slug.lower()).strip("_") or "campaign"
    path = Path(out_dir) / f"campaign_{slug}.json"
    path.write_text(json.dumps(campaign, indent=2, ensure_ascii=False), encoding="utf-8")
    return str(path)
