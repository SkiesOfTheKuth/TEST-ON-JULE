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

The project includes a simple `add` function that adds two integers.

```python
from python_starter_project.math import add

result = add(2, 3)
print(result)  # Output: 5
```

To run the tests:
```bash
poetry run pytest
```

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.