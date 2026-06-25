# Git & Branch Tracker

This document logs git branches, commit logs, pull requests, and how they map to Jira tickets for the StitchConnect repository.

## 1. Active Working Branches
| Branch Name | Base Branch | Purpose | Author | Status |
|---|---|---|---|---|
| `develop` | `main` | Integration branch | - | Active |
| `feature/frontend-integration-SCRUM-11` | `develop` | Integrate customer search/filtering page, search autocomplete, and lead capture modal | Antigravity | Active (Lint, Build, & Tests Pass) |

---

## 2. Completed / Merged Pull Requests
| PR # | Source Branch | Target Branch | Approved By | Date Merged | Description / Ticket Key |
|---|---|---|---|---|---|
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
| (Pending) | Antigravity | `fix(frontend): resolve page.tsx ESLint errors & update pre-commit validation rules (SCRUM-11)` | Fixed startTransition/isPending, params declaration, setUnlockedContacts cascading render warning; updated agent/project rules. |
| `3a40c77` | Antigravity | `feat(backend): implement tailor search discovery and lead capture endpoints (KAN-4)` | Implemented tailors search, details routing, lead registration, and sqlite integration tests |
| `a84bb3f` | Antigravity | `feat(backend): bootstrap FastAPI setup, Supabase DB connection, and ORM models` | Initial boilerplate backend commit including models and validation schemas |

