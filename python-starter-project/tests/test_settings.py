from __future__ import annotations

import pytest

from python_starter_project.settings import Settings, get_settings


def test_settings_defaults() -> None:
    config = Settings.from_env()
    assert config.environment == "local"
    assert config.log_level == "INFO"
    assert config.app_name == "python-starter-project"
    assert config.database_url is None


def test_settings_reads_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENVIRONMENT", "staging")
    monkeypatch.setenv("APP_LOG_LEVEL", "debug")
    monkeypatch.setenv("APP_NAME", "custom-app")
    monkeypatch.setenv("APP_DATABASE_URL", "postgresql://localhost/db")

    loaded = get_settings()
    assert loaded.environment == "staging"
    assert loaded.log_level == "DEBUG"
    assert loaded.app_name == "custom-app"
    assert loaded.database_url == "postgresql://localhost/db"


def test_get_settings_cached(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENVIRONMENT", "test")
    first = get_settings()
    monkeypatch.setenv("APP_ENVIRONMENT", "production")
    second = get_settings()
    assert first is second
    assert second.environment == "test"


def test_invalid_environment_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENVIRONMENT", "invalid")
    with pytest.raises(ValueError):
        Settings.from_env()


def test_invalid_log_level_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_LOG_LEVEL", "verbose")
    with pytest.raises(ValueError):
        Settings.from_env()
