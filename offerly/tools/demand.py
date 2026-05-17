"""Tool: Monte Carlo simulation of demand and margin (the 'dice roll')."""
from __future__ import annotations

import json
import random
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from ..domain.campaign import SimulationResult
from ..domain.categories import CATEGORIES
from . import campaign as campaign_tool


class _Input(BaseModel):
    impressions: int = Field(
        default=20000,
        description="Expected impressions on the platform during the campaign.",
    )
    runs: int = Field(default=2000, description="Number of Monte Carlo runs.")
    seed: int | None = Field(default=None, description="Optional RNG seed.")


class SimulateDemandTool(BaseTool):
    name: str = "simulate_demand"
    description: str = (
        "Monte Carlo simulation of the current campaign. Reads price, cost, "
        "stock, category and discount from state, and returns p10/p50/p90 "
        "percentiles of units sold and profit, plus the probability of "
        "being profitable. Also updates the 'simulation' field of the campaign."
    )
    args_schema: Type[BaseModel] = _Input

    def _run(self, impressions: int = 20000, runs: int = 2000, seed: int | None = None, **_kwargs) -> str:
        camp = campaign_tool.current()
        p = camp.pricing

        # REFUSE to simulate when pricing is incomplete. Otherwise we end up
        # with a fake forecast based on category benchmark midpoints, which
        # then ships to the merchant looking like real numbers. Better to
        # leave simulation empty and let the missing-data banner explain
        # what's needed.
        pvp = p.pvp_eur if isinstance(p.pvp_eur, (int, float)) and p.pvp_eur > 0 else None
        offerly = (
            p.offerly_price_eur
            if isinstance(p.offerly_price_eur, (int, float)) and p.offerly_price_eur > 0
            else None
        )
        cost = (
            p.variable_cost_eur
            if isinstance(p.variable_cost_eur, (int, float)) and p.variable_cost_eur >= 0
            else None
        )
        if pvp is None or offerly is None or cost is None:
            return json.dumps({
                "skipped": True,
                "reason": "Simulation skipped — pricing.pvp_eur, "
                          "pricing.offerly_price_eur and "
                          "pricing.variable_cost_eur are all required.",
            })
        if camp.category not in CATEGORIES:
            return json.dumps({
                "skipped": True,
                "reason": f"Unknown category '{camp.category}'. Run intake first.",
            })

        cat = CATEGORIES[camp.category]
        bench_disc_lo, bench_disc_hi = cat["typical_discount"]
        bench_disc = (bench_disc_lo + bench_disc_hi) / 2
        notes: list[str] = []

        # Effective discount (clamp negatives to 0 so the lift is sane).
        discount = max(0.0, round((1 - offerly / pvp) * 100, 1))
        commission = p.commission_pct or 40.0
        merchant_revenue = offerly * (1 - commission / 100)
        per_unit_margin = round(merchant_revenue - cost, 2)

        rng = random.Random(seed)
        base_conv = cat["median_conversion"]
        typical_mid = bench_disc
        discount_lift = 1.0 + max(0.0, (discount - typical_mid)) / 100 * 1.5
        stock = camp.stock or 10**9

        units, profits = [], []
        for _ in range(runs):
            conv = max(0.0, rng.gauss(base_conv * discount_lift, base_conv * 0.35))
            sold = int(min(stock, rng.gauss(impressions * conv, impressions * conv * 0.25)))
            sold = max(0, sold)
            units.append(sold)
            profits.append(sold * per_unit_margin)

        units.sort()
        profits.sort()

        def pct(arr, q):
            return arr[min(len(arr) - 1, max(0, int(len(arr) * q)))]

        sim = SimulationResult(
            units_p10=pct(units, 0.10),
            units_p50=pct(units, 0.50),
            units_p90=pct(units, 0.90),
            profit_p10_eur=round(pct(profits, 0.10), 2),
            profit_p50_eur=round(pct(profits, 0.50), 2),
            profit_p90_eur=round(pct(profits, 0.90), 2),
            probability_profitable=round(sum(1 for x in profits if x > 0) / len(profits), 3),
        )

        campaign_tool._CAMPAIGN.simulation = sim
        out = sim.model_dump()
        if notes:
            out["notes"] = notes
        return json.dumps(out)
