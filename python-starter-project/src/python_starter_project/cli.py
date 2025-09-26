import argparse

from python_starter_project.math import add, divide, multiply, power, subtract


def main():
    """Command-line interface for the math functions."""
    parser = argparse.ArgumentParser(description="A simple command-line calculator.")
    parser.add_argument("operation", choices=["add", "subtract", "multiply", "divide", "power"])
    parser.add_argument("a", type=int, help="The first number.")
    parser.add_argument("b", type=int, help="The second number.")

    args = parser.parse_args()

    if args.operation == "add":
        result = add(args.a, args.b)
    elif args.operation == "subtract":
        result = subtract(args.a, args.b)
    elif args.operation == "multiply":
        result = multiply(args.a, args.b)
    elif args.operation == "divide":
        result = divide(args.a, args.b)
    elif args.operation == "power":
        result = power(args.a, args.b)

    print(f"Result: {result}")


if __name__ == "__main__":
    main()