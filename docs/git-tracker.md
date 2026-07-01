# Git & Branch Tracker

This document logs git branches, commit logs, pull requests, and how they map to Jira tickets for the StitchConnect repository.

## 1. Active Working Branches
| Branch Name | Base Branch | Purpose | Author | Status |
|---|---|---|---|---|
| `develop` | `main` | Integration branch | - | Active |
| `feature/backend-auth-SCRUM-20` | `develop` | Redesign tailor registration to email + google oauth & revert OTP | Antigravity | Active (Tests Pass) |
| `feature/frontend-integration-SCRUM-11` | `develop` | Integrate customer search/filtering page, search autocomplete, and lead capture modal | Antigravity | Active (Lint, Build, & Tests Pass) |
| `feature/backend-customer-auth-reviews-dashboard-SCRUM-10-19-26` | `develop` | Implement customer registration & login, ratings/reviews, and tailor dashboard | Antigravity | Active (Tests Pass) |
| `feature/frontend-portfolio-upload-SCRUM-22` | `develop` | Upload portfolio images with dynamic dashboard UI, constraints, and backend Cloudinary CDN support | Jeelan / Antigravity | Active (Lint, Build, & Tests Pass) |
| `feature/frontend-settings-SCRUM-24-SCRUM-27` | `develop` | Hook up working hours and SMS/WhatsApp notification alert preferences | Jeelan / Antigravity | Active (Lint & Build Pass) |
| `feature/frontend-integration-SCRUM-10-19-26` | `develop` | Hook up Customer Auth, Reviews, Tailor Dashboard, Leads Management, Sentry Error Monitoring, and Hydration Fixes | Jeelan / Antigravity | Active (Lint & Build Pass) |


---

## 2. Completed / Merged Pull Requests
| PR # | Source Branch | Target Branch | Approved By | Date Merged | Description / Ticket Key |
|---|---|---|---|---|---|
| [#35](https://github.com/CrestWaveAI/Stichoh/pull/35) | `feature/backend-auth-SCRUM-20` | `develop` | User (via MCP merge) | 2026-06-28 | Redesign tailor registration to email + google oauth & revert OTP (SCRUM-20) |
| [#27](https://github.com/CrestWaveAI/Stichoh/pull/27) | `docs/scrum-25-task-doc` | `develop` | User (via MCP merge) | 2026-06-28 | docs: add SCRUM-25 task details and index it |
| [#26](https://github.com/CrestWaveAI/Stichoh/pull/26) | `docs/index-SCRUM-21-doc` | `develop` | User (via MCP merge) | 2026-06-28 | docs: index SCRUM-21 profile creation doc in README |
| [#25](https://github.com/CrestWaveAI/Stichoh/pull/25) | `feature/frontend-profile-SCRUM-21` | `develop` | User (via MCP merge) | 2026-06-28 | feat(frontend): implement tailor profile creation (SCRUM-21) |
| [#23](https://github.com/CrestWaveAI/Stichoh/pull/23) | `feature/backend-contact-details-SCRUM-25` | `develop` | User (via MCP merge) | 2026-06-28 | feat(backend): support separate WhatsApp and call number fields (SCRUM-25) |
| [#18](https://github.com/CrestWaveAI/Stichoh/pull/18) | `bugfix/frontend-issues-13-14` | `develop` | User (approved via chat) | 2026-06-27 | Resolve scroll jitter and autocomplete loopback (GH-13, GH-14) |
| [#17](https://github.com/CrestWaveAI/Stichoh/pull/17) | `feature/backend-tailor-otp-registration-SCRUM-20` | `develop` | User (approved via chat) | 2026-06-27 | Implement OTP verification, categories list, and gated profile creation (SCRUM-20, SCRUM-21, SCRUM-12) |
| [#16](https://github.com/CrestWaveAI/Stichoh/pull/16) | `bugfix/backend-env-setup-SCRUM-40` | `develop` | User (via MCP merge) | 2026-06-26 | fix(backend): add SUPABASE_SECRET_KEY to env template (SCRUM-40) |
| [#15](https://github.com/CrestWaveAI/Stichoh/pull/15) | `feature/backend-profile-details-SCRUM-15` | `develop` | User (via MCP merge) | 2026-06-25 | Implement detailed tailor profile fields and view page endpoints (SCRUM-15) |
| [#11](https://github.com/CrestWaveAI/Stichoh/pull/11) | `feature/backend-profile-SCRUM-21` | `develop` | User (approved via chat) | 2026-06-25 | Implemented tailor profile CRUD, services CRUD, and portfolio upload/reordering (SCRUM-21) |
| [#8](https://github.com/CrestWaveAI/Stichoh/pull/8) | `feature/backend-setup` | `develop` | User (approved via chat) | 2026-06-24 | Bootstrapped FastAPI, Supabase schema migration & seeding, ORM models, and validation schemas setup |
| [#9](https://github.com/CrestWaveAI/Stichoh/pull/9) | `feature/backend-endpoints` | `develop` | User (approved via chat) | 2026-06-24 | Implemented tailor search, detail routing, lead registration, and sqlite integration tests (KAN-4) |

---

## 3. Git Workflow Checklist (per `git-workflow.md`)
Before merging a branch into `develop`:
- [x] Code compiles successfully.
- [x] No lint errors.
- [x] Unit tests pass (if any).
- [x] Self-review completed.
- [x] Conventional Commit format used.
- [ ] 1 approving review obtained.

---

## 4. Log of Key Commits
| Commit Hash | Author | Message | Description |
|---|---|---|---|
| `04320e6` | Antigravity | `feat(backend): redesign tailor authentication to email and google oauth (SCRUM-20)` | Rewrote auth system, dropped OTP, set up email registration/login & Google OAuth, updated tests |
| `faa8485` | Antigravity | `fix(frontend): split search queries containing commas into separate locality/city params (SCRUM-11)` | Split autocomplete selections into separate parameters before sending them to the API. |
| `5fe2651` | Antigravity | `fix(backend): support bidirectional substring search for locality and city (SCRUM-11)` | Enabled checking of both query in location-name and location-name in query. |
| `01a96a8` | Antigravity | `fix(backend): escape PostgREST or query values with double quotes to support commas (SCRUM-11)` | Wrapped search values in double quotes to handle values with commas. |
| `71579ee` | Antigravity | `fix(frontend): change default fallback API URL to 127.0.0.1 to avoid loopback resolution issues (SCRUM-11)` | Changed default fallback NEXT_PUBLIC_API_URL to 127.0.0.1. |
| `c6fb412` | Antigravity | `feat(backend): migrate endpoints to supabase-py and implement local mock client (SCRUM-11)` | Switched FastAPI routes to Supabase REST client, built postgREST mock client, and configured shared memory sqlite. |
| `230c857` | Antigravity | `fix(frontend): resolve page.tsx ESLint errors & update pre-commit validation rules (SCRUM-11)` | Fixed startTransition/isPending, params declaration, setUnlockedContacts cascading render warning; updated agent/project rules. |
| `3a40c77` | Antigravity | `feat(backend): implement tailor search discovery and lead capture endpoints (KAN-4)` | Implemented tailors search, details routing, lead registration, and sqlite integration tests |
| `a84bb3f` | Antigravity | `feat(backend): bootstrap FastAPI setup, Supabase DB connection, and ORM models` | Initial boilerplate backend commit including models and validation schemas |


