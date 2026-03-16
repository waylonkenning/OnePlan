# Contributing to OnePlan

Thank you for your interest in contributing to **OnePlan**! We welcome contributions from the community to help make this roadmap visualiser even better.

## 🚀 How to Contribute

1.  **Fork the Repository:** Create your own fork of the project.
2.  **Create a Branch:** Create a feature branch for your changes (`git checkout -b feat/your-feature`).
3.  **Implement Changes:** 
    *   Fulfill the requirements of your chosen task.
    *   Adhere to the existing code style (TypeScript, React, Tailwind CSS).
4.  **Test Your Changes:** 
    *   We use **Playwright** for end-to-end testing.
    *   Add a new test in the `e2e/` directory if you are adding a feature or fixing a bug.
    *   Run all tests using `npm test` before submitting.
5.  **Submit a Pull Request:** Open a PR against the `main` branch with a clear description of your changes.

## 🧪 Development Methodology

We follow a strict **Research -> Strategy -> Execution** lifecycle.
- **TDD:** We prioritse writing a Playwright E2E test that reproduces a bug or validates a new feature *before* implementation.
- **Verification:** A change is only complete when the behavioral correctness is verified by an automated test.

## 🛠 Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## 📜 Code of Conduct

Please be respectful and professional in all interactions. We aim to foster an inclusive and welcoming environment for everyone.

---
*By contributing to OnePlan, you agree that your contributions will be licensed under the Apache License 2.0.*
