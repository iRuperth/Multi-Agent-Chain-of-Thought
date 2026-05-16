"""Conversational CLI. The merchant describes the business and the Crew responds."""
from __future__ import annotations

import argparse
import os
import sys

from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel

from .crew import run_onboarding
from .i18n import get_bundle, normalize
from .tools import campaign as campaign_tool


def _read_multiline() -> str:
    lines: list[str] = []
    while True:
        try:
            line = input()
        except EOFError:
            break
        if line.strip() == "" and lines:
            break
        if line.strip() == "" and not lines:
            continue
        lines.append(line)
    return "\n".join(lines).strip()


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(prog="offerly")
    parser.add_argument(
        "--lang",
        choices=["en", "es"],
        default=os.getenv("OFFERLY_LANG", "en"),
        help="Interface and output language (default: en, env: OFFERLY_LANG).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv if argv is not None else sys.argv[1:])
    lang = normalize(args.lang)
    cli = get_bundle(lang).CLI

    console = Console()
    console.print(
        Panel(
            Markdown(cli["welcome"]),
            title=cli["panel_title"],
            border_style="cyan",
        )
    )

    merchant_input = _read_multiline()
    if not merchant_input:
        console.print(f"[red]{cli['no_input']}[/red]")
        return 1

    console.rule(f"[bold]{cli['launching']}[/bold]")
    try:
        final = run_onboarding(merchant_input, lang=lang)
    except Exception as e:
        console.print(f"[red]{cli['crew_error']}[/red] {e}")
        return 2

    console.rule(f"[bold green]{cli['final_sheet']}[/bold green]")
    camp = campaign_tool.current()
    console.print(Markdown(camp.render_markdown(lang)))

    console.rule(f"[bold]{cli['crew_summary']}[/bold]")
    console.print(final)
    return 0


if __name__ == "__main__":
    sys.exit(main())
