"""End-to-end self-test for the whole Offerly platform.

Run with:  make test

Covers, in order, stopping at the first failure:

  1.  Imports + i18n bundles (en, es) parse cleanly.
  2.  Domain — Pydantic Campaign model + categories + policies constants.
  3.  Tools (no LLM, no Ollama) — update/get/export/benchmarks/demand/policies.
  4.  Policy validator catches a deliberately broken campaign.
  5.  Web layer (FastAPI) — app boots, /healthz, /api/onboard, /api/job.
  6.  Demo mode — _run_demo populates the campaign without invoking the LLM.
  7.  Agent wiring — build_agents() returns 6 agents with the expected tools.
  8.  RAG — Ollama reachable, embed model pulled, ingest works, retrieval is
      accurate on known queries, RetrievePolicyClausesTool returns clauses.

Sections 1–7 do NOT require Ollama. Section 8 does. If Ollama is unreachable,
section 8 fails with a clear message but everything before still runs.
"""
from __future__ import annotations

import json
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path


PASS = "\033[32mOK  \033[0m"
FAIL = "\033[31mFAIL\033[0m"
SKIP = "\033[33mSKIP\033[0m"
HEAD = "\033[1;36m"
DIM = "\033[2m"
END = "\033[0m"

FAILURES: list[str] = []


def section(title: str) -> None:
    print(f"\n{HEAD}== {title} =={END}")


def check(label: str, ok: bool, detail: str = "") -> bool:
    tag = PASS if ok else FAIL
    extra = f" {DIM}— {detail}{END}" if detail else ""
    print(f"  [{tag}] {label}{extra}")
    if not ok:
        FAILURES.append(label)
    return ok


def skip(label: str, reason: str) -> None:
    print(f"  [{SKIP}] {label} {DIM}— {reason}{END}")


# ----------------------------------------------------------------------------
# 1. Imports + i18n
# ----------------------------------------------------------------------------
def test_imports() -> None:
    section("1. Imports + i18n bundles")
    import offerly  # noqa: F401
    check("import offerly", True)

    from offerly.i18n import get_bundle
    en = get_bundle("en")
    es = get_bundle("es")
    check("i18n.get_bundle('en')", hasattr(en, "AGENTS"))
    check("i18n.get_bundle('es')", hasattr(es, "AGENTS"))

    agent_keys = {
        "interviewer", "market_analyst", "copywriter",
        "demand_simulator", "policy_validator", "archivist",
    }
    check("en.AGENTS has all 6 agents", set(en.AGENTS.keys()) == agent_keys)
    check("es.AGENTS has all 6 agents", set(es.AGENTS.keys()) == agent_keys)

    desc_en, _ = en.task_validate()
    desc_es, _ = es.task_validate()
    check(
        "en.task_validate mentions retrieve_policy_clauses",
        "retrieve_policy_clauses" in desc_en,
    )
    check(
        "es.task_validate mentions retrieve_policy_clauses",
        "retrieve_policy_clauses" in desc_es,
    )


# ----------------------------------------------------------------------------
# 2. Domain
# ----------------------------------------------------------------------------
def test_domain() -> None:
    section("2. Domain (Pydantic Campaign + constants)")
    from offerly.domain.campaign import Campaign
    from offerly.domain.categories import CATEGORIES
    from offerly.domain import policies as P

    c = Campaign()
    check("empty Campaign() instantiates", c is not None)

    c2 = Campaign(merchant_name="X", category="spa_beauty")
    c2.pricing.pvp_eur = 100.0
    c2.pricing.offerly_price_eur = 50.0
    pct = c2.pricing.discount_pct
    check(
        "pricing.discount_pct computes (50€ on 100€ → 50%)",
        pct == 50.0,
        f"got {pct}",
    )

    check(
        "CATEGORIES has 7 supported verticals",
        len(CATEGORIES) == 7,
        f"got {len(CATEGORIES)}",
    )
    check(
        "spa_beauty benchmark has typical_discount tuple",
        isinstance(CATEGORIES["spa_beauty"]["typical_discount"], tuple),
    )

    check("policies.DISCOUNT_MIN_PCT exists", hasattr(P, "DISCOUNT_MIN_PCT"))
    check("policies.VOUCHER_MIN_DAYS exists", hasattr(P, "VOUCHER_MIN_DAYS"))


# ----------------------------------------------------------------------------
# 3. Tools (no LLM)
# ----------------------------------------------------------------------------
def _seed_valid_campaign() -> None:
    """Populate the shared singleton with a publishable campaign."""
    from offerly.tools.campaign import UpdateCampaignTool, reset
    reset(lang="en")
    UpdateCampaignTool()._run(
        json.dumps(
            {
                "merchant_name": "Spa Aurora",
                "category": "spa_beauty",
                "pricing": {
                    "pvp_eur": 70.0,
                    "variable_cost_eur": 18.0,
                    "offerly_price_eur": 35.0,
                    "commission_pct": 40.0,
                },
                "stock": 80,
                "voucher_validity_days": 120,
                "weekly_slots": ["Tue", "Wed", "Thu"],
                "weekly_capacity": 40,
                "title": "60-min massage in Soho",
                "description": (
                    "Enjoy a 60-minute relaxing massage in the heart of "
                    "Soho. Swedish techniques and aromatherapy included. "
                    "Easy online booking. Ideal to unwind after work. "
                    "Private cabins and natural oils."
                ),
                "fine_print": ["Prior booking", "Not stackable", "No holidays"],
            }
        )
    )


def test_tools() -> None:
    section("3. Tools (no LLM)")
    from offerly.tools.benchmarks import CategoryBenchmarksTool
    from offerly.tools.campaign import (
        ExportCampaignTool,
        GetCampaignTool,
        UpdateCampaignTool,
        current,
        reset,
    )
    from offerly.tools.demand import SimulateDemandTool
    from offerly.tools.policies import ValidatePoliciesTool

    reset(lang="en")
    out = UpdateCampaignTool()._run(json.dumps({"merchant_name": "X"}))
    check(
        "update_campaign accepts JSON string + returns campaign JSON",
        json.loads(out).get("merchant_name") == "X",
    )
    check("singleton stores merchant_name", current().merchant_name == "X")

    # Deep-merge: nested pricing object should not be wiped.
    UpdateCampaignTool()._run(json.dumps({"pricing": {"pvp_eur": 99.0}}))
    UpdateCampaignTool()._run(json.dumps({"pricing": {"offerly_price_eur": 49.5}}))
    snap = current()
    check(
        "update_campaign deep-merges nested pricing",
        snap.pricing.pvp_eur == 99.0 and snap.pricing.offerly_price_eur == 49.5,
    )

    got = json.loads(GetCampaignTool()._run())
    check("get_campaign returns dict with merchant_name", got.get("merchant_name") == "X")

    bench = json.loads(CategoryBenchmarksTool()._run(category="spa_beauty"))
    check(
        "benchmarks for spa_beauty returns discount range",
        "typical_discount_pct_min" in bench and "typical_discount_pct_max" in bench,
    )

    _seed_valid_campaign()
    sim = json.loads(
        SimulateDemandTool()._run(impressions=20000, runs=500, seed=42)
    )
    check(
        "simulate_demand returns p50 + probability_profitable",
        "units_p50" in sim and "probability_profitable" in sim,
    )

    verdict = json.loads(ValidatePoliciesTool()._run())
    check(
        "validate_policies on a clean campaign → ok=true",
        verdict.get("ok") is True,
        f"errors: {verdict.get('errors')}",
    )

    with tempfile.TemporaryDirectory() as tmp:
        ExportCampaignTool()._run(out_dir=tmp)
        files = sorted(p.name for p in Path(tmp).iterdir())
        check(
            "export_campaign writes JSON + Markdown files",
            any(f.endswith(".json") for f in files)
            and any(f.endswith(".md") for f in files),
            f"wrote {files}",
        )


# ----------------------------------------------------------------------------
# 4. Policy validator catches a broken campaign
# ----------------------------------------------------------------------------
def test_validator_negative() -> None:
    section("4. Policy validator on a deliberately broken campaign")
    from offerly.tools.campaign import UpdateCampaignTool, reset
    from offerly.tools.policies import ValidatePoliciesTool

    reset(lang="en")
    UpdateCampaignTool()._run(
        json.dumps(
            {
                "merchant_name": "Bad",
                "category": "health",
                "pricing": {
                    "pvp_eur": 100.0,
                    "offerly_price_eur": 95.0,    # 5% discount → below 30%
                    "variable_cost_eur": 10.0,
                    "commission_pct": 40.0,
                },
                "stock": 5,                        # below STOCK_MIN
                "voucher_validity_days": 10,       # below VOUCHER_MIN_DAYS
                "weekly_slots": ["Mon"],           # below MIN_WEEKLY_SLOTS
                "title": "Cure your back pain in 7 days",  # banned health claim
                "description": "ok " * 50,
                "fine_print": [],
            }
        )
    )
    verdict = json.loads(ValidatePoliciesTool()._run())
    check(
        "validator flags ok=false",
        verdict.get("ok") is False,
    )
    errors = " ".join(verdict.get("errors", [])).lower()
    check("error mentions discount", "discount" in errors)
    check("error mentions voucher", "voucher" in errors)
    check("error mentions slot", "slot" in errors)
    check("error mentions stock", "stock" in errors)


# ----------------------------------------------------------------------------
# 5. Web layer
# ----------------------------------------------------------------------------
def test_web() -> None:
    section("5. Web layer (FastAPI TestClient)")
    from fastapi.testclient import TestClient
    from offerly.web.app import app

    client = TestClient(app)

    r = client.get("/healthz")
    check("GET /healthz → 200", r.status_code == 200 and r.json() == {"status": "ok"})

    r = client.post(
        "/api/onboard",
        json={"merchant_input": "Spa Aurora in Soho", "lang": "en", "demo": True},
    )
    check("POST /api/onboard {demo:true} → 200", r.status_code == 200)
    job_id = r.json().get("job_id")
    check("response includes job_id", bool(job_id))

    r = client.get(f"/api/job/{job_id}")
    check("GET /api/job/{id} → 200", r.status_code == 200)

    r = client.get("/api/job/nope-not-real")
    check("GET /api/job/<missing> → 404", r.status_code == 404)


# ----------------------------------------------------------------------------
# 6. Demo mode populates the campaign
# ----------------------------------------------------------------------------
def test_demo_mode() -> None:
    section("6. Demo mode (no LLM, no Ollama)")
    import offerly.web.runner as runner
    from offerly.web.jobs import Job

    # Monkeypatch sleep to make the test instant (real demo takes ~7.7s).
    real_sleep = runner.time.sleep
    runner.time.sleep = lambda _s: None
    try:
        job = Job(id="t", lang="en", merchant_input="demo", demo=True)
        runner._run_demo(job)
    finally:
        runner.time.sleep = real_sleep

    check("demo run sets status=done", job.status == "done")
    check("demo run populates campaign", bool(job.campaign))
    check(
        "demo run completed all 6 agents",
        len(job.completed_agents) == 6,
        f"got {job.completed_agents}",
    )


# ----------------------------------------------------------------------------
# 7. Agent wiring
# ----------------------------------------------------------------------------
def test_agents() -> None:
    section("7. Agent wiring (build_agents)")
    from offerly.agents import build_agents

    agents = build_agents(lang="en")
    expected = {
        "interviewer", "market_analyst", "copywriter",
        "demand_simulator", "policy_validator", "archivist",
    }
    check("build_agents returns all 6 keys", set(agents.keys()) == expected)

    tool_sets = {
        "interviewer":      {"update_campaign"},
        "market_analyst":   {"category_benchmarks", "update_campaign"},
        "copywriter":       {"update_campaign"},
        "demand_simulator": {"simulate_demand"},
        "policy_validator": {"retrieve_policy_clauses", "validate_policies", "get_campaign"},
        "archivist":        {"get_campaign", "export_campaign"},
    }
    for name, expected_tools in tool_sets.items():
        actual = {t.name for t in agents[name].tools}
        check(
            f"{name} has tools {sorted(expected_tools)}",
            actual == expected_tools,
            f"got {sorted(actual)}",
        )


# ----------------------------------------------------------------------------
# 8. RAG layer (needs Ollama)
# ----------------------------------------------------------------------------
def test_rag() -> None:
    section("8. RAG layer (Ollama + Chroma)")
    from offerly.rag.embeddings import _ollama_base_url, _ollama_embed_model

    base = _ollama_base_url()
    try:
        with urllib.request.urlopen(f"{base}/api/tags", timeout=3) as r:
            tags = json.load(r)
    except urllib.error.URLError as e:
        check(f"reach {base}", False, str(e))
        return

    check(f"reach Ollama at {base}", True)

    model = _ollama_embed_model()
    names = [m["name"] for m in tags.get("models", [])]
    present = any(n == model or n.startswith(f"{model}:") for n in names)
    if not present:
        check(f"embedding model `{model}` pulled", False, f"run: ollama pull {model}")
        return
    check(f"embedding model `{model}` pulled", True)

    from offerly.rag.ingest import POLICIES_PATH, chunk_policies_md, ingest
    chunks = chunk_policies_md(POLICIES_PATH)
    check(f"chunk {POLICIES_PATH} → 7 sections", len(chunks) == 7)

    n = ingest()
    check(f"ingest indexed {n} chunks", n == 7)

    from offerly.tools.rag_policies import RetrievePolicyClausesTool
    tool = RetrievePolicyClausesTool()
    cases = [
        ("health disclaimer regulated", "3. Regulated categories"),
        ("voucher validity expiry days", "2. Voucher expiry & redemption"),
        ("title length characters copy", "4. Copy"),
        ("minimum discount percentage", "1. Discounts"),
    ]
    for query, expected_section in cases:
        out = json.loads(tool._run(query=query, top_k=2))
        sections = [c["section_title"] for c in out.get("clauses", [])]
        check(
            f"query={query!r} returns {expected_section!r}",
            expected_section in sections,
            f"got {sections}",
        )


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
def main() -> None:
    started = time.time()
    print(f"{HEAD}Offerly platform self-test{END}")

    try:
        test_imports()
        test_domain()
        test_tools()
        test_validator_negative()
        test_web()
        test_demo_mode()
        test_agents()
        test_rag()
    except Exception as e:
        print(f"\n{FAIL} unexpected exception: {e!r}")
        FAILURES.append(f"crash: {e!r}")

    elapsed = time.time() - started
    print(f"\n{HEAD}== Summary =={END}")
    if FAILURES:
        print(f"  {FAIL}  {len(FAILURES)} failed in {elapsed:.1f}s:")
        for f in FAILURES:
            print(f"        - {f}")
        sys.exit(1)
    print(f"  {PASS}  all checks passed in {elapsed:.1f}s")


if __name__ == "__main__":
    main()
