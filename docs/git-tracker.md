# Git & Branch Tracker

This document logs git branches, commit logs, pull requests, and how they map to Jira tickets for the StitchConnect repository.

## 1. Active Working Branches
| Branch Name | Base Branch | Purpose | Author | Status |
|---|---|---|---|---|
| `develop` | `main` | Integration branch | - | Active |
| `feature/backend-setup` | `develop` | Backend initial scaffolding & setup | Antigravity | PR Opened (#8) |
| `feature/backend-endpoints` | `feature/backend-setup` | Implement Phase 1 API endpoints & integration tests | Antigravity | Active |

---

## 2. Completed / Merged Pull Requests
| PR # | Source Branch | Target Branch | Approved By | Date Merged | Description / Ticket Key |
|---|---|---|---|---|---|
| [#8](https://github.com/CrestWaveAI/Stichoh/pull/8) | `feature/backend-setup` | `develop` | *Pending* | - | Bootstrapped FastAPI, Supabase schema migration & seeding, ORM models, and validation schemas setup |

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
| `3a40c77` | Antigravity | `feat(backend): implement tailor search discovery and lead capture endpoints (KAN-4)` | Implemented tailors search, details routing, lead registration, and sqlite integration tests |
| `a84bb3f` | Antigravity | `feat(backend): bootstrap FastAPI setup, Supabase DB connection, and ORM models` | Initial boilerplate backend commit including models and validation schemas |

