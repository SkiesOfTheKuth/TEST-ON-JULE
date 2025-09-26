import pytest
from python_starter_project.math import add, subtract, multiply, divide


@pytest.mark.parametrize(
    "a, b, expected",
    [
        (2, 3, 5),
        (-1, 1, 0),
        (0, 0, 0),
        (-1, -1, -2),
    ],
)
def test_add(a, b, expected):
    """Tests the add function with various inputs."""
    assert add(a, b) == expected


@pytest.mark.parametrize(
    "a, b, expected",
    [
        (3, 2, 1),
        (1, 1, 0),
        (0, 0, 0),
        (-1, -1, 0),
        (5, 10, -5),
    ],
)
def test_subtract(a, b, expected):
    """Tests the subtract function with various inputs."""
    assert subtract(a, b) == expected


@pytest.mark.parametrize(
    "a, b, expected",
    [
        (2, 3, 6),
        (-1, 1, -1),
        (0, 5, 0),
        (-2, -3, 6),
    ],
)
def test_multiply(a, b, expected):
    """Tests the multiply function with various inputs."""
    assert multiply(a, b) == expected


@pytest.mark.parametrize(
    "a, b, expected",
    [
        (6, 3, 2.0),
        (-4, 2, -2.0),
        (5, 2, 2.5),
        (0, 5, 0.0),
    ],
)
def test_divide(a, b, expected):
    """Tests the divide function with various inputs."""
    assert divide(a, b) == expected


def test_divide_by_zero():
    """Tests that dividing by zero raises a ValueError."""
    with pytest.raises(ValueError, match="Cannot divide by zero."):
        divide(1, 0)
