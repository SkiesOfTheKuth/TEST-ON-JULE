from __future__ import annotations

import logging

import pytest

from python_starter_project.logging import get_logger
from python_starter_project.settings import reset_settings_cache


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


def test_get_logger_updates_level(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_LOG_LEVEL", "WARNING")
    logger = get_logger("changing")
    assert logger.level == logging.WARNING

    reset_settings_cache()
    monkeypatch.setenv("APP_LOG_LEVEL", "ERROR")
    logger = get_logger("changing")
    assert logger.level == logging.ERROR
