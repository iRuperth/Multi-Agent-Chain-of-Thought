"""Tool: per-category benchmarks."""
from __future__ import annotations

import json
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from ..domain.categories import CATEGORIES
from ..i18n import get_bundle
from . import campaign as campaign_tool


class _Input(BaseModel):
    category: str = Field(description="Category slug (e.g. 'spa_beauty').")


class CategoryBenchmarksTool(BaseTool):
    name: str = "category_benchmarks"
    description: str = (
        "Returns typical discount range (%) and median conversion for a "
        "category. If the category does not exist, returns the list of "
        "supported categories."
    )
    args_schema: Type[BaseModel] = _Input

    def _run(self, category: str = "", **_kwargs) -> str:
        # Fall back to the campaign's current category if the LLM forgot
        # to pass the argument.
        if not category:
            category = campaign_tool.current().category or ""
        cat = CATEGORIES.get(category)
        if not cat:
            return json.dumps({
                "error": f"Unknown category: {category!r}",
                "supported": list(CATEGORIES.keys()),
            })
        labels = get_bundle(campaign_tool.current_lang()).CATEGORY_LABELS
        return json.dumps({
            "category": category,
            "label": labels.get(category, cat["label"]),
            "typical_discount_pct_min": cat["typical_discount"][0],
            "typical_discount_pct_max": cat["typical_discount"][1],
            "median_conversion": cat["median_conversion"],
            "regulated": cat["regulated"],
        })
