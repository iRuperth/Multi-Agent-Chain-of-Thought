"""Tool: retrieve policy clauses via RAG (ChromaDB + Ollama embeddings)."""
from __future__ import annotations

import json
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from ..rag.store import get_collection_or_none


class _Input(BaseModel):
    query: str = Field(
        ...,
        description=(
            "Free-text query describing what aspect of the campaign you want "
            "policy guidance on (e.g. 'health disclaimer', 'discount cap', "
            "'voucher validity', 'title formatting')."
        ),
    )
    top_k: int = Field(3, ge=1, le=7)


class RetrievePolicyClausesTool(BaseTool):
    name: str = "retrieve_policy_clauses"
    description: str = (
        "Retrieves the most relevant clauses from the official platform "
        "policy document for a given query. Returns a JSON list of "
        "{section_title, text} objects. Use this BEFORE calling "
        "validate_policies so you can cite the exact clause when reporting "
        "any violation."
    )
    args_schema: Type[BaseModel] = _Input

    def _run(self, query: str, top_k: int = 3) -> str:
        coll = get_collection_or_none()
        if coll is None:
            return json.dumps(
                {
                    "error": (
                        "Policy index not built yet. Run `make rag-index` "
                        "(or `python -m offerly.rag.ingest`) once to "
                        "populate it. Falling back to validate_policies "
                        "alone is fine."
                    ),
                    "clauses": [],
                }
            )

        try:
            result = coll.query(query_texts=[query], n_results=top_k)
        except Exception as e:
            return json.dumps({"error": str(e), "clauses": []})

        docs = (result.get("documents") or [[]])[0]
        metas = (result.get("metadatas") or [[]])[0]
        clauses = [
            {
                "section_title": (m or {}).get("section_title", "?"),
                "text": doc,
            }
            for doc, m in zip(docs, metas)
        ]
        return json.dumps({"clauses": clauses})
