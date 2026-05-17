"""Locale selection and bundle loading.

Two supported locales: 'en' and 'es'. The active locale drives:
- Agent role/goal/backstory strings
- Task description bodies (the CoT preamble is also localized)
- CLI welcome and error messages
- Markdown labels in the final campaign sheet
- Banned-claim patterns used by the policy validator
"""
from __future__ import annotations

from typing import Literal

from . import en, es

Lang = Literal["en", "es"]

_BUNDLES = {"en": en, "es": es}

DEFAULT_LANG: Lang = "en"


def get_bundle(lang: str):
    """Return the module containing strings for the requested locale.

    Falls back to the default locale if the requested one is unknown.
    """
    return _BUNDLES.get(lang, _BUNDLES[DEFAULT_LANG])


def normalize(lang: str | None) -> Lang:
    if not lang:
        return DEFAULT_LANG
    lang = lang.lower().strip()
    if lang in _BUNDLES:
        return lang  # type: ignore[return-value]
    return DEFAULT_LANG
