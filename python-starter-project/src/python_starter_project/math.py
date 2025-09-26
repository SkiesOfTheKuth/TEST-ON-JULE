def add(a: int, b: int) -> int:
    """Adds two integers together."""
    return a + b


def subtract(a: int, b: int) -> int:
    """Subtracts two integers."""
    return a - b


def multiply(a: int, b: int) -> int:
    """Multiplies two integers."""
    return a * b


def divide(a: int, b: int) -> float:
    """Divides two integers."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b


def power(a: int, b: int) -> int:
    """Calculates the power of a number."""
    return a**b
