# Contributing to Kavach

Thank you for your interest in contributing to Kavach! We are building the standard for privacy in the age of AI, and we need your help.

## Code of Conduct
Please be respectful and kind to other contributors. We value a welcoming and inclusive community.

## How to Contribute

### 1. Reporting Bugs
If you find a bug, please create a GitHub Issue with:
- A clear title.
- Steps to reproduce the bug.
- Expected vs. actual behavior.
- Your environment (Node version, OS).

### 2. Suggesting Features
Have an idea? Open an Issue tagged "Enhancement" and describe:
- The problem you are solving.
- Your proposed solution.

### 3. Pull Requests (PRs)
1.  **Fork** the repo.
2.  **Clone** it locally.
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Create a branch** (e.g., `fix/redis-connection` or `feat/german-language-support`).
5.  **Write code and tests**.
6.  **Run tests** (Make sure everything passes!).
    ```bash
    npm test
    ```
7.  **Push** to your fork and submit a **Pull Request**.

## Monorepo Structure
Kavach is a monorepo.
- `packages/core`: The main library logic.
- `services/gateway`: The API service.

Please make sure your changes are in the correct workspace.

## License
By contributing, you agree that your contributions will be licensed under the MIT License.
