from __future__ import annotations

import json

import pytest

from python_starter_project.healthcheck import main


def test_healthcheck_outputs_json(capsys: pytest.CaptureFixture[str]) -> None:
    main()
    captured = capsys.readouterr().out
    payload = json.loads(captured)
    assert payload["status"] == "ok"
    assert payload["app"] == "python-starter-project"


def test_healthcheck_includes_version(
    capsys: pytest.CaptureFixture[str], monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(
        "python_starter_project.healthcheck.metadata.version",
        lambda package: "1.2.3" if package == "python-starter-project" else "0.0.0",
    )
    main()
    payload = json.loads(capsys.readouterr().out)
    assert payload["version"] == "1.2.3"
