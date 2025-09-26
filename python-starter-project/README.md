# Python Starter Project

This is a starter project for a Python application. It includes a basic project structure, a simple math function, and tools for development and testing.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/python-starter-project.git
   cd python-starter-project
   ```

2. **Install dependencies using Poetry:**
   ```bash
   poetry install
   ```

## Usage

The project provides several math functions, including `add`, `subtract`, `multiply`, `divide`, and `power`.

```python
from python_starter_project.math import power

result = power(2, 3)
print(result)  # Output: 8
```

### Command-Line Interface

This project includes a command-line interface (CLI) that allows you to perform calculations directly from the terminal.

```bash
poetry run calculator <operation> <a> <b>
```

For example, to add 5 and 3, you would run:

```bash
poetry run calculator add 5 3
# Result: 8
```

To calculate 2 to the power of 8:
```bash
poetry run calculator power 2 8
# Result: 256
```

To run the tests:
```bash
poetry run pytest
```

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.