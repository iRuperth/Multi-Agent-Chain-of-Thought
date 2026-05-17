"""ChromaDB persistent client + collection accessors."""
from __future__ import annotations

import os
from pathlib import Path

import chromadb

from .embeddings import OllamaEmbeddingFunction


COLLECTION_NAME = "policies"


def _persist_path() -> Path:
    return Path(os.getenv("OFFERLY_RAG_DIR", ".rag/chroma"))


def _client() -> chromadb.PersistentClient:
    path = _persist_path()
    path.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(path))


def get_or_create_collection():
    return _client().get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=OllamaEmbeddingFunction(),
    )


def get_collection_or_none():
    """Open the collection only if it already exists. Used by the tool at
    query time so a missing index returns a clean error instead of triggering
    Chroma to create an empty collection on disk."""
    try:
        return _client().get_collection(
            name=COLLECTION_NAME,
            embedding_function=OllamaEmbeddingFunction(),
        )
    except Exception:
        return None


def reset_collection() -> None:
    """Drop and recreate. Used by the ingest CLI for idempotency."""
    c = _client()
    try:
        c.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
    c.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=OllamaEmbeddingFunction(),
    )
