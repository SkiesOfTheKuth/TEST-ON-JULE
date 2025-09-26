import pytest
from python_starter_project.math import add, subtract, multiply, divide

def test_add():
    """Tests the add function."""
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

def test_subtract():
    """Tests the subtract function."""
    assert subtract(5, 3) == 2
    assert subtract(-1, 1) == -2
    assert subtract(0, 0) == 0

def test_multiply():
    """Tests the multiply function."""
    assert multiply(2, 3) == 6
    assert multiply(-1, 5) == -5
    assert multiply(0, 5) == 0

def test_divide():
    """Tests the divide function."""
    assert divide(6, 3) == 2
    assert divide(-5, 5) == -1
    assert divide(0, 5) == 0

def test_divide_by_zero():
    """Tests that division by zero raises a ZeroDivisionError."""
    with pytest.raises(ZeroDivisionError):
        divide(1, 0)
