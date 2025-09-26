# Contributing to Python Starter Project

Thank you for your interest in contributing to this project! All contributions are welcome.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your forked repository** to your local machine.
3. **Install the development dependencies** using Poetry:
   ```bash
   poetry install
   ```

## Making Changes

1. **Create a new branch** for your changes:
   ```bash
   git checkout -b my-feature-branch
   ```
2. **Make your changes** to the code.
3. **Run the tests** to ensure that your changes haven't broken anything:
   ```bash
   poetry run pytest
   ```
4. **Format your code** using Ruff:
   ```bash
   poetry run ruff format .
   ```
5. **Lint your code** using Ruff:
   ```bash
   poetry run ruff check .
   ```

## Submitting a Pull Request

1. **Commit your changes** with a clear and descriptive commit message.
2. **Push your changes** to your forked repository.
3. **Open a pull request** on the original repository.

Please provide a clear description of the changes you've made in the pull request description.