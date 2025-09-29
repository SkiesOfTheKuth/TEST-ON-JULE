from __future__ import annotations

import logging

import pytest

from python_starter_project.logging import get_logger


def test_get_logger_returns_configured_logger(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_LOG_LEVEL", "DEBUG")
    logger = get_logger("test")
    assert logger.name == "test"
    assert logger.level == logging.DEBUG
    assert logger.handlers


def test_get_logger_idempotent(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_LOG_LEVEL", "INFO")
    logger1 = get_logger("idempotent")
    handler_count = len(logger1.handlers)
    logger2 = get_logger("idempotent")
    assert logger1 is logger2
    assert len(logger2.handlers) == handler_count
