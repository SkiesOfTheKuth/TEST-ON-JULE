"""Simple healthcheck module for container probes."""

from __future__ import annotations

import json
import sys
from importlib import metadata

from .settings import get_settings


def _resolve_version() -> str:
    try:
        return metadata.version("python-starter-project")
    except metadata.PackageNotFoundError:
        return "0.0.0"


def main() -> None:
    settings = get_settings()
    payload = {
        "status": "ok",
        "environment": settings.environment,
        "app": settings.app_name,
        "version": _resolve_version(),
    }
    sys.stdout.write(json.dumps(payload))


if __name__ == "__main__":
    main()
