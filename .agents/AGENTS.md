# Stichoh Project-Scoped Agent Rules

This file defines rules that the AI coding assistant (Antigravity) MUST always follow when working on the Stichoh (StitchConnect) project.

## Team Configuration
- **Backend Team:** @musharraf, @amankumar
- **Frontend Team:** @sameersam648, @jeelan80

## Rule: Continuous Documentation & Change Tracking
Whenever you perform code changes, package updates, git operations, database modifications, or configuration adjustments, you MUST update the corresponding tracker and changelog files:

1. **Root CHANGELOG.md:**
   * Append human-readable summaries of all additions, changes, bug fixes, or security improvements under the `[Unreleased]` section.
2. **docs/backend-tracker.md:**
   * Update dependencies added via `uv`.
   * Update any new or changed environment variable keys (`.env`).
   * Update database schema, entities, and migrations (including Alembic version IDs, DB lock risks, and description).
   * Document new API endpoints and security logs.
3. **docs/git-tracker.md:**
   * Log any working branches created or PRs opened, mapping them to Jira ticket keys.
4. **docs/architecture-log.md:**
   * Create an ADR entry for any major architectural decision or new technical choice.
5. **Jira Task Documentation (file under docs/):**
   * Just before pushing a feature/bugfix branch, you MUST create a markdown file under the `docs/` directory representing the active Jira task.
   * **Filename structure:** `SCRUM-<number>-<short-description>-<assigned-to>.md` (lowercase description, hyphen-separated, e.g., `SCRUM-25-contact-details-antigravity.md`).
   * **File content structure:**
     1. **Scrum details:** Exact details from Jira including title, summary, description, assignee, date when assigned, and date when PR was raised.
     2. **Implementation details:** The actual implemented changes, files modified, and test verification outcomes.

## Rule: Workspace Cleanliness & File/Folder Organization Standards
To keep the codebase clean, logical, and structured:
1. **No Miscellaneous Files in Root or Sub-directories**: Never create documentation guides, tutorials, or logs in the project root or direct subdirectories (such as `backend/` or `frontend/`).
2. **Consolidated Documentation**: All documentation files (trackers, guides, test results, architecture logs, etc.) MUST be created and organized under the `docs/` directory.
3. **Index Documentation**: Whenever a new documentation file is created under `docs/`, it must be registered and indexed in [docs/README.md](file:///Users/amankumar/Aman/Sticho/docs/README.md).
4. **Follow Folder Conventions**: Ensure files correspond logically to the directory they belong to (e.g., source code in `app/`, schemas in `schemas/`, models in `models/`).

## Rule: Pre-Commit & Pre-Push Validation Checks
To prevent build breaks and failures in CI/CD, the assistant MUST verify the following before committing or pushing changes:
1. **Frontend CI/CD Requirements**:
   - Run `npm run lint` inside the `frontend/` directory. It MUST pass with zero errors and zero warnings.
   - Run `npm run build` inside the `frontend/` directory. The application MUST compile and build successfully.
2. **Backend CI/CD Requirements**:
   - Verify the FastAPI app loads successfully by running `uv run python -c "from app.main import app; print('FastAPI app loaded successfully')"` in the `backend/` directory.
   - Run the integration test suite (e.g. `pytest` or `uv run pytest`) and ensure all backend tests pass without failure.
3. **No Direct Pushes**: Never push commits directly to protected branches like `develop` or `main`. Always raise a Pull Request (PR) targeting `develop`.

Before concluding your turn or declaring a task complete, verify that all modifications are documented in their respective tracking files.

## Rule: No Frontend Modifications
Do not make any changes in the `frontend/` directory, since the scope of work is strictly backend-oriented. If you identify any frontend bugs, issues, or proposed improvements, DO NOT edit the frontend files. Instead, create a GitHub issue in the repository to document and flag the issue.

## Rule: Implementation Plan & Testing Requirements
When starting work on a Scrum task and creating an implementation plan (`implementation_plan.md`), the plan MUST explicitly include:
1. **Technical Scope & Changes:** A detailed breakdown of database schema, model, schema, and API changes.
2. **Post-Implementation Steps:**
   - Transition the active Jira issue to the "In Review" status (using Atlassian MCP tools).
   - Raise a Pull Request (PR) targeting `develop` for the backend changes.
   - Mention/assign the backend team members (@musharraf, @amankumar) in the PR for verification, review, and merging.
   - Raise a GitHub issue to notify/inform the frontend team (@sameersam648, @jeelan80) about their related jobs for the scrum (e.g. hooking up new fields).
3. **Unit/Integration Testing**: Define automated backend test cases and assert expectations in the plan.
4. **Browser/UI Testing**: If frontend features are affected or added, specify browser-based verification steps and recommend or perform browser testing using the `/browser` subagent (UI testing). If no frontend/UI exists for the backend features, explicitly note this in the plan and test documentation.
