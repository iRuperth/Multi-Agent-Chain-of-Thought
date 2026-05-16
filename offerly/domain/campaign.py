"""Campaign sheet model."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field

from ..i18n import get_bundle


class Pricing(BaseModel):
    pvp_eur: Optional[float] = None
    offerly_price_eur: Optional[float] = None
    variable_cost_eur: Optional[float] = None
    commission_pct: float = 40.0

    @property
    def discount_pct(self) -> Optional[float]:
        if not self.pvp_eur or not self.offerly_price_eur:
            return None
        return round((1 - self.offerly_price_eur / self.pvp_eur) * 100, 1)

    @property
    def merchant_revenue_per_unit(self) -> Optional[float]:
        if self.offerly_price_eur is None:
            return None
        return round(self.offerly_price_eur * (1 - self.commission_pct / 100), 2)

    @property
    def margin_per_unit(self) -> Optional[float]:
        if self.merchant_revenue_per_unit is None or self.variable_cost_eur is None:
            return None
        return round(self.merchant_revenue_per_unit - self.variable_cost_eur, 2)


class SimulationResult(BaseModel):
    """Monte Carlo simulation result."""
    units_p10: int = 0
    units_p50: int = 0
    units_p90: int = 0
    profit_p10_eur: float = 0.0
    profit_p50_eur: float = 0.0
    profit_p90_eur: float = 0.0
    probability_profitable: float = 0.0


class Campaign(BaseModel):
    merchant_name: Optional[str] = None
    business_type: Optional[str] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None

    category: Optional[str] = None
    offer_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    fine_print: list[str] = Field(default_factory=list)

    pricing: Pricing = Field(default_factory=Pricing)

    weekly_capacity: Optional[int] = None
    weekly_slots: list[str] = Field(default_factory=list)
    voucher_validity_days: Optional[int] = None
    stock: Optional[int] = None

    target_audience: Optional[str] = None
    goal: Optional[str] = None

    simulation: Optional[SimulationResult] = None

    def render_markdown(self, lang: str = "en") -> str:
        md = get_bundle(lang).MD
        p = self.pricing
        pricing_block = (
            f"- {md['rrp']}: {p.pvp_eur} EUR\n"
            f"- {md['offerly_price']}: {p.offerly_price_eur} EUR\n"
            f"- {md['discount']}: {p.discount_pct}%\n"
            f"- {md['variable_cost']}: {p.variable_cost_eur} EUR\n"
            f"- {md['commission']}: {p.commission_pct}%\n"
            f"- {md['merchant_revenue_unit']}: {p.merchant_revenue_per_unit} EUR\n"
            f"- {md['margin_unit']}: {p.margin_per_unit} EUR"
        )
        fine = "\n".join(f"  - {f}" for f in self.fine_print) or f"  - {md['none']}"
        slots = ", ".join(self.weekly_slots) or md["undefined"]
        sim = self.simulation
        if not sim:
            sim_block = md["pending"]
        else:
            stock_note = ""
            if self.stock is not None and sim.units_p50 >= self.stock:
                note_body = md["stock_saturated"].format(stock=self.stock)
                stock_note = f"\n- *{md['note']}:* {note_body}"
            sim_block = (
                f"- {md['units_sold']}: {sim.units_p10} / {sim.units_p50} / {sim.units_p90}\n"
                f"- {md['profit_eur']}: {sim.profit_p10_eur} / {sim.profit_p50_eur} / {sim.profit_p90_eur}\n"
                f"- {md['probability_profitable']}: {sim.probability_profitable*100:.1f}%"
                + stock_note
            )
        return f"""# {md['campaign']} — {self.offer_name or md['unnamed']}

**{md['merchant']}:** {self.merchant_name or '?'} ({self.business_type or '?'})
**{md['location']}:** {self.neighborhood or '?'}, {self.city or '?'}
**{md['category']}:** {self.category or '?'}
**{md['goal']}:** {self.goal or '?'}
**{md['target_audience']}:** {self.target_audience or '?'}

## {md['copy']}
**{md['title']}:** {self.title or md['pending']}

**{md['description']}:**
{self.description or md['pending']}

## {md['conditions']}
- {md['voucher_validity']}: {self.voucher_validity_days} {md['days']}
- {md['stock']}: {self.stock}
- {md['weekly_capacity']}: {self.weekly_capacity}
- {md['weekly_slots']}: {slots}

### {md['fine_print']}
{fine}

## {md['pricing_margin']}
{pricing_block}

## {md['demand_simulation']}
{sim_block}
"""
