"""A collection of basic arithmetic operations."""


def add(a: int, b: int) -> int:
    """
    Adds two integers and returns the sum.

    Args:
        a: The first integer.
        b: The second integer.

    Returns:
        The sum of the two integers.
    """
    return a + b


def subtract(a: int, b: int) -> int:
    """
    Subtracts the second integer from the first and returns the difference.

    Args:
        a: The integer to be subtracted from.
        b: The integer to subtract.

    Returns:
        The difference between the two integers.
    """
    return a - b


def multiply(a: int, b: int) -> int:
    """
    Multiplies two integers and returns the product.

    Args:
        a: The first integer.
        b: The second integer.

    Returns:
        The product of the two integers.
    """
    return a * b


def divide(a: int, b: int) -> float:
    """
    Divides the first integer by the second and returns the quotient.

    Args:
        a: The dividend.
        b: The divisor.

    Returns:
        The quotient of the two integers as a float.

    Raises:
        ValueError: If the divisor `b` is zero.
    """
    if b == 0:
        raise ValueError("Cannot divide by zero.")
    return a / b
