"""Platform policies as constants. Single source of truth.

Numeric thresholds live here; locale-dependent banned-claim patterns live
in offerly/i18n/<lang>.py so they can match the language the LLM is
generating copy in.
"""
from __future__ import annotations

DISCOUNT_MIN_PCT = 30
DISCOUNT_MAX_PCT = 70
DISCOUNT_HARD_CAP_PCT = 80

VOUCHER_MIN_DAYS = 60
VOUCHER_MAX_DAYS = 365

MIN_WEEKLY_SLOTS = 3

TITLE_MAX_LEN = 70
DESC_MIN_LEN = 150
DESC_MAX_LEN = 600

STOCK_MIN = 20
STOCK_PER_WEEKLY_CAPACITY_MAX = 10

DEFAULT_COMMISSION_PCT = 40
NEGOTIATED_COMMISSION_PCT = 30
