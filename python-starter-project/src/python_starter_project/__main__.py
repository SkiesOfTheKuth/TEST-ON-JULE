"""CLI entrypoint for the starter service."""

from __future__ import annotations

from .logging import get_logger
from .math import add
from .settings import get_settings


def main() -> None:
    settings = get_settings()
    logger = get_logger(__name__)
    logger.info(
        "Service boot complete",
        extra={
            "environment": settings.environment,
            "app": settings.app_name,
            "sample_result": add(2, 3),
        },
    )


if __name__ == "__main__":
    main()
