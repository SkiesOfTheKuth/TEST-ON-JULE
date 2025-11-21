from python_starter_project.math import add


def test_add() -> None:
    """Tests the add function."""
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

def test_add_float_inputs():
    """Tests that add returns an int even with float inputs."""
    assert isinstance(add(2.5, 3.5), int)
