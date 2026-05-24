"""English locale bundle for Offerly."""
from __future__ import annotations

CODE = "en"
NAME = "English"

# ---------------------------------------------------------------------------
# Chain-of-Thought scaffolding
# ---------------------------------------------------------------------------

COT_PREAMBLE = ""

COT_BACKSTORY_SUFFIX = ""

OUTPUT_LANGUAGE_NOTE = "Language: respond in English."

# ---------------------------------------------------------------------------
# Agents
# ---------------------------------------------------------------------------

AGENTS = {
    "interviewer": {
        "role": "Offerly merchant interviewer",
        "goal": (
            "Understand what the merchant wants to promote: business type, "
            "location, service, target audience and campaign objective. "
            "Ask clarifying questions when something critical is missing, "
            "and persist what you learn into the campaign."
        ),
        "backstory": (
            "Veteran of the Merchant Success team. Knows that merchants "
            "arrive with vague ideas and must be landed on concrete data: "
            "category, public price, weekly capacity, exclusions."
        ),
    },
    "copywriter": {
        "role": "Offer copy creative",
        "goal": (
            "Write a title (<=70 chars) and a description (150-600 chars) "
            "that are attractive, honest and compliant with Offerly "
            "policies. Save them into the campaign."
        ),
        "backstory": (
            "Copywriter specialized in local offers. Avoids fake "
            "superlatives and all-caps; favors concrete hook + clear benefit."
        ),
    },
    "market_analyst": {
        "role": "Offerly market analyst",
        "goal": (
            "Recommend a reasonable discount, Offerly price and stock based "
            "on category benchmarks and the merchant's capacity. Update "
            "pricing and stock in the campaign."
        ),
        "backstory": (
            "Analyst with historical data from thousands of campaigns by "
            "category and city. Knows that a discount too low does not "
            "convert and one too high destroys margin."
        ),
    },
    "demand_simulator": {
        "role": "Demand simulator (Monte Carlo)",
        "goal": (
            "Run the simulation over the current campaign and record "
            "p10/p50/p90 of units and profit, plus the probability of "
            "being profitable."
        ),
        "backstory": (
            "Modern equivalent of 'rolling the dice': thousands of "
            "scenarios with noise on conversion to bound the realistic "
            "range of outcomes."
        ),
    },
    "policy_validator": {
        "role": "Offerly policy validator",
        "goal": (
            "Check that the campaign complies with every policy: "
            "discounts, voucher validity, copy, stock, regulated "
            "categories. Return explicit errors and warnings."
        ),
        "backstory": (
            "Former compliance lead. A no is a no: if the campaign has "
            "errors, it does not ship until they are fixed."
        ),
    },
    "archivist": {
        "role": "Campaign archivist",
        "goal": (
            "Ensure the campaign is complete, export it to JSON and "
            "Markdown, and return the file paths."
        ),
        "backstory": (
            "Closes the loop: reviews that every critical field is filled "
            "and persists the final sheet."
        ),
    },
}

# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------


def task_intake(merchant_input: str, cat_list: str) -> tuple[str, str]:
    description = (
        "REQUIRED: you MUST invoke the update_campaign tool. Do not produce "
        "a Final Answer until update_campaign has returned successfully.\n\n"
        "Call update_campaign exactly once with the merchant data from this "
        "pitch. Include these fields when the merchant mentions them: "
        "merchant_name (business name), business_type (kind of business), "
        "city, neighborhood, category (one of: "
        f"{cat_list}), goal, target_audience, weekly_capacity (int), "
        "pricing.pvp_eur (full price, number), "
        "pricing.variable_cost_eur (number). "
        "If a field is not in the pitch, leave it out — do not invent.\n\n"
        f"Pitch: {merchant_input}"
    )
    expected = (
        "The JSON object returned by update_campaign after a successful "
        "call, showing the saved fields. If you did not call "
        "update_campaign, the task has failed."
    )
    return description, expected


def task_pricing() -> tuple[str, str]:
    description = (
        "REQUIRED: you MUST invoke the update_campaign tool. Do not produce "
        "a Final Answer until update_campaign has returned successfully.\n\n"
        "Step 1: call category_benchmarks with the category from context.\n"
        "Step 2: call update_campaign exactly once with patch_json "
        "containing: offerly_price_eur (less than pvp_eur, use a discount "
        "within the benchmark range), stock (20 to 10x weekly_capacity), "
        "voucher_validity_days (60 to 365, default 120), weekly_slots (a "
        "list of at least 3 strings like 'Tue 17-20'). Keep "
        "pricing.commission_pct at 40."
    )
    expected = (
        "The JSON object returned by update_campaign confirming the new "
        "pricing/stock/slots are saved. If update_campaign was not called, "
        "the task has failed."
    )
    return description, expected


def task_copy() -> tuple[str, str]:
    description = (
        "REQUIRED: you MUST invoke the update_campaign tool. Do not produce "
        "a Final Answer until update_campaign has returned successfully.\n\n"
        "The merchant_name and business_type are pinned at the top of your "
        "context — write copy ONLY about that exact business. Match the "
        "service you describe to business_type literally.\n\n"
        "Call update_campaign exactly once with patch_json containing: "
        "offer_name (short, includes merchant_name), title (max 70 chars), "
        "description (150-600 chars), fine_print (list of 2-4 short strings)."
    )
    expected = (
        "The JSON object returned by update_campaign confirming the new "
        "offer_name/title/description/fine_print are saved. If "
        "update_campaign was not called, the task has failed."
    )
    return description, expected


def task_simulate() -> tuple[str, str]:
    description = (
        "Run simulate_demand with impressions=20000, runs=2000, seed=42. "
        "Summarize the result in bullets (p10/p50/p90 of units and profit, "
        "and probability of being profitable)."
    )
    expected = "Bullets with percentiles and probability."
    return description, expected


def task_validate() -> tuple[str, str]:
    description = (
        "First call retrieve_policy_clauses with a short query summarising "
        "the campaign (category, headline angle, anything regulated). Then "
        "call validate_policies. If ok=true, state that the campaign is "
        "publishable. If ok=false, list the errors as-is, suggest a concrete "
        "fix for each one, and cite the matching clause's section_title "
        "from the retrieved policy text. Do not fix them yourself: only report."
    )
    expected = (
        "Verdict (ok/no) + list of errors and warnings + suggestions, "
        "each error citing the policy section_title it violates."
    )
    return description, expected


def task_archive() -> tuple[str, str]:
    description = (
        "Invoke export_campaign with out_dir='out'. That's it. The tool will "
        "read the current state and write the JSON and Markdown files for "
        "you. Do not describe what you will do — just call the tool."
    )
    expected = (
        "The exact file paths returned by export_campaign, followed by one "
        "line: 'Campaign saved.'"
    )
    return description, expected


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

CLI = {
    "panel_title": "Offerly",
    "welcome": (
        "# Offerly — Campaign Onboarding\n\n"
        "Hello, I am the onboarding assistant. Describe your business and "
        "what offer you would like to launch. Include the business name, "
        "type of business, city, full price, your variable cost per unit, "
        "weekly capacity, target audience, and what you want the campaign "
        "to achieve.\n\n"
        "Type your request (multi-line; finish with a blank line):"
    ),
    "no_input": "No input. Exiting.",
    "launching": "Launching the Crew...",
    "crew_error": "Error running the Crew:",
    "final_sheet": "Final sheet",
    "crew_summary": "Crew summary",
}

# ---------------------------------------------------------------------------
# Markdown labels for Campaign.render_markdown
# ---------------------------------------------------------------------------

MD = {
    "campaign": "Campaign",
    "unnamed": "(unnamed)",
    "merchant": "Merchant",
    "location": "Location",
    "category": "Category",
    "goal": "Goal",
    "target_audience": "Target audience",
    "copy": "Copy",
    "title": "Title",
    "description": "Description",
    "pending": "(pending)",
    "conditions": "Conditions",
    "voucher_validity": "Voucher validity",
    "days": "days",
    "stock": "Stock",
    "weekly_capacity": "Weekly capacity",
    "weekly_slots": "Weekly slots",
    "undefined": "(undefined)",
    "fine_print": "Fine print",
    "none": "(none)",
    "pricing_margin": "Pricing & margin",
    "rrp": "RRP",
    "offerly_price": "Offerly price",
    "discount": "Discount",
    "variable_cost": "Variable cost",
    "commission": "Offerly commission",
    "merchant_revenue_unit": "Merchant revenue / unit",
    "margin_unit": "Margin / unit",
    "demand_simulation": "Demand simulation",
    "units_sold": "Units sold (p10/p50/p90)",
    "profit_eur": "Profit EUR (p10/p50/p90)",
    "probability_profitable": "Probability of being profitable",
    "note": "Note",
    "stock_saturated": (
        "median demand saturates the stock ({stock}); consider raising "
        "inventory to capture more revenue."
    ),
}

# ---------------------------------------------------------------------------
# Validator messages (used inside ValidatePoliciesTool)
# ---------------------------------------------------------------------------

VALIDATOR = {
    "unknown_category": "Unknown category: {category!r}.",
    "discount_below_min": "Discount {d}% < minimum {min}%.",
    "discount_above_hard_cap": "Discount {d}% > hard cap {cap}%.",
    "discount_above_recommended": "Discount {d}% above recommended {max}%.",
    "negative_margin": "Negative margin per unit ({m} EUR): the campaign destroys value.",
    "voucher_below_min": "Voucher validity {v}d < minimum {min}d.",
    "voucher_above_max": "Voucher validity {v}d > maximum {max}d.",
    "few_slots": "Only {n} weekly slots declared; minimum {min}.",
    "title_too_long": "Title {n} chars > maximum {max}.",
    "title_all_caps": "All-caps title not allowed.",
    "multi_exclamations": "Avoid multiple exclamations in the title.",
    "banned_claim_title": "Banned claim in title: {bad!r}.",
    "desc_too_short": "Description {n} chars < minimum {min}.",
    "desc_too_long": "Description {n} chars > maximum {max}.",
    "banned_claim_health": "Banned health claim: {bad!r}.",
    "regulated_disclaimer_missing": (
        "Regulated category: add a disclaimer about results / no medical guarantee."
    ),
    "stock_below_min": "Stock {s} < publishable minimum {min}.",
    "stock_overbooking": "Stock {s} > 10x weekly capacity ({cap}). Overbooking risk.",
    "non_standard_commission": (
        "Commission {c}% outside the standard tiers ({default}% or {negotiated}%)."
    ),
}

# ---------------------------------------------------------------------------
# Banned-claim patterns (matched against generated copy)
# ---------------------------------------------------------------------------

BANNED_CLAIMS_HEALTH = [
    "cure",
    "guaranteed",
    "100% effective",
    "lose weight fast",
    "eliminates all fat",
    "miraculous",
]

BANNED_SUPERLATIVES = [
    "the best",
    "unique in",
    "number 1",
    "#1",
]

# ---------------------------------------------------------------------------
# Category labels (slugs are language-agnostic IDs)
# ---------------------------------------------------------------------------

CATEGORY_LABELS = {
    "spa_beauty": "Spa & beauty",
    "food_drink": "Food & drink",
    "leisure_activities": "Leisure & activities",
    "health": "Health",
    "fitness": "Fitness",
    "home_services": "Home & services",
    "travel_getaways": "Travel & getaways",
}
