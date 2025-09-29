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
