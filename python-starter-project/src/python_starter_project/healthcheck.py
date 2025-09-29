"""Simple healthcheck module for container probes."""

from __future__ import annotations

import json
import sys

from .settings import get_settings


def main() -> None:
    settings = get_settings()
    payload = {
        "status": "ok",
        "environment": settings.environment,
        "app": settings.app_name,
    }
    sys.stdout.write(json.dumps(payload))


if __name__ == "__main__":
    main()
