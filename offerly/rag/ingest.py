"""Ingest docs/POLICIES.md into the ChromaDB policy collection.

Run with:  uv run python -m offerly.rag.ingest
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from .store import COLLECTION_NAME, get_or_create_collection, reset_collection


POLICIES_PATH = Path("docs/POLICIES.md")
SECTION_RE = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)


@dataclass
class Chunk:
    chunk_id: str
    section_title: str
    text: str


def chunk_policies_md(path: Path) -> list[Chunk]:
    """Split a markdown doc into chunks, one per H2 section.

    Each chunk keeps the heading inside its body so the LLM sees the section
    label when citing. We tolerate any preamble before the first H2.
    """
    raw = path.read_text(encoding="utf-8")
    matches = list(SECTION_RE.finditer(raw))
    if not matches:
        return [Chunk(chunk_id="full", section_title="POLICIES", text=raw.strip())]

    chunks: list[Chunk] = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(raw)
        section_title = m.group(1).strip()
        body = raw[start:end].strip()
        chunks.append(
            Chunk(
                chunk_id=f"section-{i + 1:02d}",
                section_title=section_title,
                text=body,
            )
        )
    return chunks


def ingest() -> int:
    if not POLICIES_PATH.exists():
        raise FileNotFoundError(
            f"Policy doc not found at {POLICIES_PATH.resolve()}. "
            "Run this from the project root."
        )

    chunks = chunk_policies_md(POLICIES_PATH)
    reset_collection()
    coll = get_or_create_collection()

    coll.add(
        ids=[c.chunk_id for c in chunks],
        documents=[c.text for c in chunks],
        metadatas=[
            {"section_title": c.section_title, "source": str(POLICIES_PATH)}
            for c in chunks
        ],
    )
    print(
        f"Indexed {len(chunks)} chunks from {POLICIES_PATH} "
        f"into collection '{COLLECTION_NAME}'."
    )
    return len(chunks)


if __name__ == "__main__":
    ingest()
