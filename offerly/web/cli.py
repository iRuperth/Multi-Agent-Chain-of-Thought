"""Entrypoint to launch the FastAPI server with uvicorn."""
from __future__ import annotations

import os


def main() -> None:
    import uvicorn

    host = os.getenv("OFFERLY_WEB_HOST", "127.0.0.1")
    port = int(os.getenv("OFFERLY_WEB_PORT", "8000"))
    reload = os.getenv("OFFERLY_WEB_RELOAD", "0") == "1"

    uvicorn.run(
        "offerly.web.app:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
    )


if __name__ == "__main__":
    main()
