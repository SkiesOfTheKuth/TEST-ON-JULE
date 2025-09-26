def add(a: int, b: int) -> int:
    """Adds two integers together.

    Args:
        a: The first integer.
        b: The second integer.

    Returns:
        The sum of the two integers.
    """
    return a + b


def subtract(a: int, b: int) -> int:
    """Subtracts two integers.

    Args:
        a: The first integer.
        b: The second integer.

    Returns:
        The difference of the two integers.
    """
    return a - b


def multiply(a: int, b: int) -> int:
    """Multiplies two integers.

    Args:
        a: The first integer.
        b: The second integer.

    Returns:
        The product of the two integers.
    """
    return a * b


def divide(a: int, b: int) -> float:
    """Divides two integers.

    Args:
        a: The first integer.
        b: The second integer.

    Returns:
        The quotient of the two integers.

    Raises:
        ZeroDivisionError: If the second integer is zero.
    """
    if b == 0:
        raise ZeroDivisionError("division by zero")
    return a / b
