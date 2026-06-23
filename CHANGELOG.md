# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Implemented core Phase 1 API endpoints in `backend/app/api/v1/endpoints/`:
  - Created [tailors.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/tailors.py) containing:
    - `GET /api/v1/tailors` (Search and discover tailors with optional filters: category, locality, city, pin code; returns `TailorPublicResponse` which gates contact info).
    - `GET /api/v1/tailors/{tailor_id}` (Retrieve detailed tailor profile; returns `TailorDetailResponse` which gates contact info).
  - Created [leads.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/leads.py) containing:
    - `POST /api/v1/leads` (Captures a customer lead and unlocks the tailor's contact details, returning `TailorPrivateResponse` which includes the contact number).
- Integrated endpoints:
  - Created combined router in [backend/app/api/v1/router.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/router.py).
  - Registered router under `/api/v1` in [backend/app/main.py](file:///Users/amankumar/Aman/Sticho/backend/app/main.py).
- Improved local connection resilience:
  - Modified [backend/app/core/db.py](file:///Users/amankumar/Aman/Sticho/backend/app/core/db.py) to gracefully handle database URL password placeholders and parse `sslmode` query parameters for `asyncpg`.
- Added test dependencies and integration test suite:
  - Added `httpx` and `aiosqlite` via `uv add`.
  - Created [backend/app/test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py) utilizing an in-memory SQLite database, mock seeding, and custom metadata events to bypass PostgreSQL-specific schema constraints.
  - Created [docs/testing.md](file:///Users/amankumar/Aman/Sticho/docs/testing.md) to serve as a unified testing guide and log containing instructions, environment setup commands, and recent execution outputs.
- Configured frontend environment:
  - Created [frontend/.env.local](file:///Users/amankumar/Aman/Sticho/frontend/.env.local) with Supabase credentials.
- Created a centralized documentation and development tracking system inside `/docs`.
  - Added [docs/README.md](file:///Users/amankumar/Aman/Sticho/docs/README.md) as the central index.
  - Added [docs/backend-tracker.md](file:///Users/amankumar/Aman/Sticho/docs/backend-tracker.md) to log backend endpoints, DB models, and dependencies.
  - Added [docs/git-tracker.md](file:///Users/amankumar/Aman/Sticho/docs/git-tracker.md) to track git operations, workflows, and branches.
  - Added [docs/architecture-log.md](file:///Users/amankumar/Aman/Sticho/docs/architecture-log.md) to track Architectural Decision Records (ADRs).
- Bootstrapped the FastAPI backend under `backend/`:
  - Initialized `backend/pyproject.toml` with Python 3.13 configuration using `uv init`.
  - Added backend dependencies: `fastapi` and `uvicorn`.
  - Created application files: [backend/app/__init__.py](file:///Users/amankumar/Aman/Sticho/backend/app/__init__.py) and [backend/app/main.py](file:///Users/amankumar/Aman/Sticho/backend/app/main.py) with CORS middleware, root greeting endpoint (`/`), and health check endpoint (`/health`).
  - Added configuration template file [backend/.env.example](file:///Users/amankumar/Aman/Sticho/backend/.env.example).
  - Added [backend/README.md](file:///Users/amankumar/Aman/Sticho/backend/README.md) with local setup and execution instructions.
- Adopted Supabase as the official database:
  - Documented decision as ADR 2 in [docs/architecture-log.md](file:///Users/amankumar/Aman/Sticho/docs/architecture-log.md).
  - Updated [docs/backend-tracker.md](file:///Users/amankumar/Aman/Sticho/docs/backend-tracker.md) and [.agents/rules/backend-standards.md](file:///Users/amankumar/Aman/Sticho/.agents/rules/backend-standards.md) with Supabase settings and credentials requirements.
  - Updated database configuration template in [backend/.env.example](file:///Users/amankumar/Aman/Sticho/backend/.env.example) with Supabase-specific variables (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY`).
  - Applied the initial database schema migration to Supabase creating `locations`, `categories`, `tailors`, `services`, `portfolio_images`, and `leads` tables.
  - Seeded the database with 7 premium mock tailors and their services matching the frontend data model.
  - Added package dependencies: `sqlalchemy`, `asyncpg`, `psycopg2-binary`, and `python-dotenv`.
  - Implemented async database connection management in [backend/app/core/db.py](file:///Users/amankumar/Aman/Sticho/backend/app/core/db.py) and a test script [backend/app/test_db_conn.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_db_conn.py).
  - Created [backend/.gitignore](file:///Users/amankumar/Aman/Sticho/backend/.gitignore) for python project file ignoring.
  - Documented a critical security notice regarding disabled Row Level Security (RLS) on new database tables in the trackers.
- Created database object models and serialization schemas:
  - Implemented SQLAlchemy ORM models: [base.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/base.py), [location.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/location.py), [category.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/category.py), [tailor.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/tailor.py), [service.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/service.py), [portfolio.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/portfolio.py), and [lead.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/lead.py).
  - Implemented Pydantic v2 validation schemas: [location.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/location.py), [category.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/category.py), [tailor.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/tailor.py), [service.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/service.py), [portfolio.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/portfolio.py), and [lead.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/lead.py) with gated profile details supporting data privacy rules.
  - Created verification test script [backend/app/test_models.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_models.py).



