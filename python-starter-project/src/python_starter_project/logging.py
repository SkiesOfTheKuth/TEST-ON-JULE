"""Logging utilities for structured JSON output using the stdlib."""

from __future__ import annotations

import json
import logging
from typing import Any

from .settings import get_settings


class JsonFormatter(logging.Formatter):
    """Minimal JSON formatter without external dependencies."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        for key in ("environment", "app", "sample_result"):
            if key in record.__dict__ and record.__dict__[key] is not None:
                payload[key] = record.__dict__[key]
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def get_logger(name: str = "python_starter_project") -> logging.Logger:
    """Return a configured logger emitting JSON records."""

    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
        logger.propagate = False

    logger.setLevel(get_settings().log_level)
    return logger


__all__ = ["JsonFormatter", "get_logger"]
