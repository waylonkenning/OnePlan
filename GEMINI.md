# OnePlan Development Standards

This document defines the foundational mandates for all automated engineering tasks within the **OnePlan** repository.

## 1. CI/CD Development Lifecycle
All feature development and bug fixes must follow this strict sequence:

1.  **Define Requirements:** Create a User Story with clear Acceptance Criteria.
2.  **Test-Driven Development (TDD):** 
    *   Write a **Playwright E2E test** in the `e2e/` directory that reproduces the bug or validates the new feature.
    *   Confirm the test fails (Red).
3.  **Implementation:** 
    *   Write the minimal code necessary to fulfill the requirements.
    *   Adhere to established patterns (React, Tailwind, IndexedDB).
4.  **Verification:** 
    *   Run the specific test to confirm it passes (Green).
    *   Run the full suite (`npx playwright test`) to ensure no regressions.
5.  **Documentation:** Update `PLAYWRIGHT_TODO.md` and any relevant README sections.
6.  **Deployment:** Commit and push to `main`. Google Cloud Build is configured with a 1st Gen GitHub trigger that automatically detects the push and executes the `cloudbuild.yaml` pipeline. No manual deployment steps or direct interaction with the GCP console are required.

## 2. Technical Stack
- **Frontend:** React (TypeScript) + Vite
- **Styling:** Tailwind CSS
- **State/Persistence:** IndexedDB (via `idb` library)
- **Testing:** Playwright
- **Deployment:** Docker + Google Cloud Run + Google Cloud Build

## 3. Deployment Targets
- **Production URL:** https://oneplan.website
- **CI/CD Configuration:** `cloudbuild.yaml`
- **Environment:** Containerized via `Dockerfile` (Nginx on port 8080)
