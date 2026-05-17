"""Supported categories and their discount/conversion benchmarks."""
from __future__ import annotations

CATEGORIES = {
    "spa_beauty": {
        "label": "Spa & beauty",
        "typical_discount": (45, 60),
        "median_conversion": 0.035,
        "regulated": False,
        "price_band": (40, 120),
    },
    "food_drink": {
        "label": "Food & drink",
        "typical_discount": (30, 50),
        "median_conversion": 0.025,
        "regulated": False,
        "price_band": (25, 90),
    },
    "leisure_activities": {
        "label": "Leisure & activities",
        "typical_discount": (35, 55),
        "median_conversion": 0.030,
        "regulated": False,
        "price_band": (20, 80),
    },
    "health": {
        "label": "Health",
        "typical_discount": (30, 50),
        "median_conversion": 0.020,
        "regulated": True,
        "price_band": (50, 200),
    },
    "fitness": {
        "label": "Fitness",
        "typical_discount": (40, 65),
        "median_conversion": 0.028,
        "regulated": False,
        "price_band": (30, 120),
    },
    "home_services": {
        "label": "Home & services",
        "typical_discount": (25, 45),
        "median_conversion": 0.018,
        "regulated": False,
        "price_band": (40, 200),
    },
    "travel_getaways": {
        "label": "Travel & getaways",
        "typical_discount": (30, 50),
        "median_conversion": 0.022,
        "regulated": False,
        "price_band": (80, 400),
    },
}
