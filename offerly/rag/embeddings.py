"""Ollama-backed embedding function for ChromaDB."""
from __future__ import annotations

import json
import os
from urllib import error, request

from chromadb.api.types import Documents, EmbeddingFunction, Embeddings


DEFAULT_MODEL = "nomic-embed-text"


def _ollama_base_url() -> str:
    return os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")


def _ollama_embed_model() -> str:
    return os.getenv("OLLAMA_EMBED_MODEL", DEFAULT_MODEL)


def embed_one(text: str) -> list[float]:
    """Call Ollama's /api/embeddings for a single string."""
    payload = json.dumps({"model": _ollama_embed_model(), "prompt": text}).encode()
    req = request.Request(
        f"{_ollama_base_url()}/api/embeddings",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode())
    except error.URLError as e:
        raise RuntimeError(
            f"Ollama embeddings unreachable at {_ollama_base_url()}: {e}. "
            f"Is the daemon running and was '{_ollama_embed_model()}' pulled?"
        ) from e
    vec = body.get("embedding")
    if not vec:
        raise RuntimeError(f"Ollama returned no embedding: {body}")
    return vec


class OllamaEmbeddingFunction(EmbeddingFunction[Documents]):
    """Chroma-compatible embedding function backed by Ollama HTTP.

    Subclasses Chroma's `EmbeddingFunction[Documents]` Protocol so the default
    `embed_query` (which delegates to `__call__`) is inherited — querying the
    collection would otherwise raise "no attribute 'embed_query'".
    """

    def __call__(self, input: Documents) -> Embeddings:
        # `input` is a list of strings on the add() path; on the query path
        # Chroma may pass a single string — normalise both.
        if isinstance(input, str):
            input = [input]
        return [embed_one(t) for t in input]

    def name(self) -> str:
        return f"ollama:{_ollama_embed_model()}"

    @staticmethod
    def build_from_config(config):
        return OllamaEmbeddingFunction()

    def get_config(self) -> dict:
        return {"model": _ollama_embed_model(), "base_url": _ollama_base_url()}
