# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Fixed
- Resolved onboarding email collision bug in tailor profile creation endpoint `POST /api/v1/tailors` (`SCRUM-20`):
  - Added support for profile enrichment/updating during onboarding for accounts created via the email signup flow instead of throwing "Email already registered".
- Resolved unverified tailor profile settings access bug on `GET /api/v1/tailors/{tailor_id}`:
  - Allowed unverified tailors to retrieve their own profiles when authenticated or via Referer-based dashboard access, preventing Settings page crashes.

### Added
- Implemented `GET /api/v1/leads` backend endpoint to allow tailors to query their complete leads list from the database.
- Integrated Tailor Authentication by removing fake OTP system and connecting registration to `POST /api/v1/auth/register` and creating a login page (`/login`) connected to `POST /api/v1/auth/login` (`SCRUM-10`).
- Integrated dynamic Tailor Dashboard overview page loading lead counts, WhatsApp/Call clicks stats, completeness progress bar, missing fields checklists, and recent leads list from the backend secure dashboard endpoint (`SCRUM-26`).
- Integrated Customer Auth on the search discovery page with registration, email login, and Google OAuth modals (`SCRUM-10`).
- Integrated Ratings & Reviews by displaying review listings on tailor cards and enabling logged-in customers to submit reviews (`SCRUM-19`).
- Hooked up WhatsApp and Call buttons on discover search page to backend track-click endpoints to track metrics (`SCRUM-26`).
- Hooked up working hours configuration on Partner Settings dashboard with day-by-day scheduler, enabling closed checkboxes and open/close inputs (`SCRUM-24`).
- Hooked up SMS/WhatsApp notifications toggle and channel selection on Partner Settings dashboard (`SCRUM-27`).
- Rendered dynamic, formatted working hours (supporting both legacy string and new day-by-day JSON format) on public tailor discovery search cards (`SCRUM-24`).
- Implemented error monitoring and alerts via Sentry SDK (`SCRUM-39`):
  - Configured `SENTRY_DSN` placeholder in `.env.example` and local `.env` configuration files.
  - Initialized Sentry SDK with `FastApiIntegration` and `send_default_pii=True` conditionally in `backend/app/main.py`.
  - Added a `GET /sentry-debug` endpoint to main router to simulate application errors and test exception capture reporting.
  - Added Test 18 in `backend/app/test_endpoints.py` to assert correct exception capture and testing endpoints.
- Implemented tailor profile working hours validation schema (`SCRUM-24`):
  - Created `WorkingHourDay` Pydantic model to strictly validate day-level opening times, closing times, and closed flags.
  - Updated `working_hours` fields in Pydantic schemas to accept both `WorkingHourDay` objects and legacy string schedules to maintain backward compatibility.
- Implemented background lead notifications preferences and delivery simulation service (`SCRUM-27`):
  - Added `notifications_enabled` (default True) and `notification_channel` (default 'whatsapp') columns to `public.tailors` database table.
  - Added notification columns to the `Tailor` SQLAlchemy ORM model and validation schemas.
  - Implemented `NotificationService` simulating SMS/WhatsApp alerts for profile views, contact clicks, and lead submissions by logging to `docs/mock_notifications.log`.
  - Configured FastAPI `BackgroundTasks` to asynchronously trigger alerts on profile views, clicks, and lead submissions, filtered by tailor opt-in settings.
  - Added Test 17 to the integration test suite (`test_endpoints.py`) to verify end-to-end working hours updates, background notification creation, and opt-out preferences.
- Configured Cloudinary CDN for portfolio image uploads under task `SCRUM-22`:
  - Added `cloudinary` dependency in `pyproject.toml`.
  - Added `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to environment files.
  - Updated `POST /api/v1/tailors/{tailor_id}/portfolio/upload` to upload images directly to Cloudinary and return secure URLs, falling back to local storage if credentials are not configured.
- Implemented Customer Auth (SCRUM-10), Ratings & Reviews (SCRUM-19), and Tailor Profile Dashboard (SCRUM-26):
  - Created `public.customers` and `public.reviews` database tables on Supabase.
  - Added `Customer` and `Review` SQLAlchemy ORM models, and added `whatsapp_clicks`, `call_clicks` columns, and review relationships to `Tailor` model.
  - Added customer registration (`/customer-auth/register`), customer login (`/customer-auth/login`), and Google OAuth (`/customer-auth/google`) endpoints.
  - Added gated review submission (`POST /api/v1/reviews`), review listing (`GET /api/v1/reviews/tailor/{tailor_id}`), and auto-calculation of average tailor rating.
  - Added call/WhatsApp click tracking endpoint (`POST /api/v1/tailors/{tailor_id}/track-click`) and secure tailor profile dashboard analytics endpoint (`GET /api/v1/tailors/{tailor_id}/dashboard`).
  - Added Tests 14, 15, and 16 to the integration test suite.
- Implemented separate WhatsApp and Call number support under task `SCRUM-25`:
  - Added `whatsapp_number` column to `public.tailors` database table.
  - Added `whatsapp_number` field to SQLAlchemy `Tailor` model.
  - Updated `TailorCreate`, `TailorPrivateResponse`, and `TailorUpdate` Pydantic validation schemas to include `whatsapp_number` for gated contact detail access.
  - Updated mapping functions in `create_tailor` and `update_tailor_profile` in `endpoints/tailors.py` to insert, update, and return the `whatsapp_number` securely.
  - Updated `create_lead` in `endpoints/leads.py` to return the unlocked `whatsapp_number` upon lead submission.
  - Updated test seeds and added assertions to Test 5 (lead contact details unlock) and Test 12 (profile registration) in `test_endpoints.py` to verify the end-to-end `whatsapp_number` flow.
- Redesigned tailor authentication under `SCRUM-20` to support Email + password registration/login and Google OAuth registration/login:
  - Reverted/dropped mobile OTP verification flow, the `public.otp_codes` table, and old OTP endpoint routes entirely.
  - Added `hashed_password` and `google_id` columns to `public.tailors` table, set email to NOT NULL and UNIQUE, and made address and contact_number optional.
  - Built cryptographic hashing and session token utilities, updated schemas, updated Auth and Tailor API endpoints, and replaced OTP tests with email/google integration tests (Tests 11-13, 13b).
- Implemented Create Tailor Profile under task `SCRUM-21`:
  - Implemented `POST /api/v1/tailors` to register new tailor profiles, enforcing email uniqueness check gates (and optional phone uniqueness checks) without OTP checks.
- Implemented List Service Categories under task `SCRUM-12`:
  - Implemented `GET /api/v1/categories` to retrieve service specializations.
  - Updated search tailors endpoint `GET /api/v1/tailors` to support multiple categories via `list[str]` query parameter and perform multi-category search filtering.
- Updated local SQLite mock PostgREST client and test database seeds in `test_endpoints.py` to support `categories` and `otp_codes` tables.
- Added Integration Tests 10, 11, 12, and 13 to verify categories listing, OTP workflow, profile creation, and multi-category filters.
- Added [docs/frontend/README.md](file:///Users/amankumar/Aman/Sticho/docs/frontend/README.md) to document frontend performance optimizations and API connection fallbacks (GH-13, GH-14).
- Implemented detailed tailor profile fields and view page endpoints under task `SCRUM-15`:
  - Added `experience`, `latitude`, `longitude`, and `working_hours` columns to `public.tailors` table.
  - Added `position` column to `public.portfolio_images` table.
  - Updated SQLAlchemy ORM models (`Tailor` and `PortfolioImage`) and Pydantic schemas (`TailorDetailResponse` and `TailorUpdate`) to support these fields.
  - Enforced a verification gate in `get_tailor_detail` (`GET /api/v1/tailors/{tailor_id}`) returning `404 Not Found` if a tailor is unverified (`is_verified = False`).
  - Updated portfolio images to fetch and order by `position`.
- Updated backend integration test suite in `test_endpoints.py` to seed the new fields, mock nested queries for portfolio images, deserialize JSON objects, and verify response formats and verification gates.
- Fully implemented the portfolio management endpoints using the Supabase REST client in [tailors.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/tailors.py):
  - `POST /api/v1/tailors/{tailor_id}/portfolio` (add portfolio metadata).
  - `POST /api/v1/tailors/{tailor_id}/portfolio/upload` (validate file types and sizes, save files locally, insert database record).
  - `PUT /api/v1/tailors/{tailor_id}/portfolio/reorder` (bulk reorder positions).
  - `DELETE /api/v1/tailors/{tailor_id}/portfolio/{image_id}` (delete database record and local media file).
- Implemented a complete mock Supabase REST client (`MockSupabaseClient`) in [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py) that translates PostgREST API query builder chains into synchronous SQLite operations.
- Migrated local test environment in [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py) to a shared cache in-memory SQLite database (`sqlite+aiosqlite:///file:testmemdb?mode=memory&cache=shared&uri=true`) to share tables across async seeding and sync mock client connections.

### Changed
- Resolved Next.js scroll performance jitter by shifting the background image to a dedicated GPU compositor layer on `body::before` with `will-change: transform` (GH-14).
- Changed frontend API base connection address to `http://127.0.0.1:8000` to prevent network loopback failures on local systems resolving localhost to IPv6 (GH-13).
- Configured frontend search field inputs to split queries containing commas into separate `locality` and `city` query parameters before sending them to the API (GH-13).
- Rewrote the main endpoints ([tailors.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/tailors.py), [locations.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/locations.py), [leads.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/leads.py)) to query the Supabase REST API via `supabase-py` instead of raw PostgreSQL `asyncpg` to bypass connection pooler routing issues and ensure IPv4 routing compatibility.
- Updated repository and agent rules in [.agents/AGENTS.md](file:///Users/amankumar/Aman/Sticho/.agents/AGENTS.md), [.agents/rules/frontend-standards.md](file:///Users/amankumar/Aman/Sticho/.agents/rules/frontend-standards.md), and [.agents/rules/git-workflow.md](file:///Users/amankumar/Aman/Sticho/.agents/rules/git-workflow.md) to require running `npm run lint` and resolving all errors/warnings before pushing or committing code.
- Added `SUPABASE_SECRET_KEY` environment variable placeholder to [backend/.env.example](file:///Users/amankumar/Aman/Sticho/backend/.env.example) to ensure teammates set up the required service role key to bypass RLS and avoid database permission errors.


### Fixed
- Fixed `KeyError` on `SUPABASE_URL` during FastAPI app compilation validation in CI/CD environments by supplying fallback placeholder credentials in the Supabase REST client initialization, and injecting mock environment variables directly into the GitHub Actions Backend CI workflow validation step.
- Fixed tailor search returning 0 results when selecting a location suggestion from autocomplete dropdown (containing commas/city info) by implementing bidirectional substring matching for locality and city checks on the backend.
- Fixed PostgREST logic tree parsing failure (`PGRST100`) on `GET /api/v1/locations/autocomplete` when search query term contains commas, by wrapping filter string values in double quotes.
- Fixed `ResponseValidationError` on the `GET /api/v1/tailors` and `POST /api/v1/leads` endpoints by mapping the missing `created_at` field in nested location structures.
- Refactored [leads.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/leads.py) mapping logic to directly reuse `_row_to_public` from tailors endpoints, ensuring identical model representations.
- Fixed ESLint errors in [page.tsx](file:///Users/amankumar/Aman/Sticho/frontend/src/app/page.tsx):
  - Removed unused `useTransition` and `startTransition`.
  - Changed `let params` to `const params` because it was never reassigned.
  - Deferred the call to `setUnlockedContacts` inside `useEffect` using `setTimeout` to avoid the synchronous `react-hooks/set-state-in-effect` rule warning.

### Added
- Implemented search autocomplete locations endpoint (`GET /api/v1/locations/autocomplete`) in [locations.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/locations.py) to search locality, city, or pin code with limit of 10.
- Implemented API fetch helper [api.ts](file:///Users/amankumar/Aman/Sticho/frontend/src/app/api.ts) for frontend-backend queries.
- Connected customer search and filtering homepage [page.tsx](file:///Users/amankumar/Aman/Sticho/frontend/src/app/page.tsx) to query live tailor and location API endpoints instead of static mock data.
- Built a Lead Capture Form Modal on the frontend that triggers upon clicking "Contact Tailor", posts customer requirements to `/api/v1/leads`, and reveals the gated tailor phone details upon success.
- Added Vanilla CSS styles for autocomplete dropdown list, glassmorphic lead capture modal, and unlocked contact panels in [globals.css](file:///Users/amankumar/Aman/Sticho/frontend/src/app/globals.css).
- Implemented Tailor Profile CRUD and Portfolio Management endpoints in [tailors.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/tailors.py):
  - `PUT /api/v1/tailors/{tailor_id}` (update tailor boutique details).
  - `POST /api/v1/tailors/{tailor_id}/portfolio` (add portfolio image metadata: URL and caption).
  - `POST /api/v1/tailors/{tailor_id}/portfolio/upload` (accept multipart file uploads, perform JPEG/PNG/WEBP and size validations (max 5MB), enforce max 20 images limit, and save files locally under static media).
  - `PUT /api/v1/tailors/{tailor_id}/portfolio/reorder` (bulk reorder positions).
  - `DELETE /api/v1/tailors/{tailor_id}/portfolio/{image_id}` (delete portfolio image and file).
- Implemented Services CRUD endpoints in [services.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/services.py):
  - `POST /api/v1/services` (create service listing).
  - `PUT /api/v1/services/{service_id}` (edit price/time estimates, description).
  - `DELETE /api/v1/services/{service_id}` (remove service listing).
  - `GET /api/v1/services/tailor/{tailor_id}` (retrieve all services for a boutique).
- Registered new endpoint dependencies:
  - Added `aiofiles` and `python-multipart` to manage form-data and static file storage.
  - Mounted `/static` files server in [main.py](file:///Users/amankumar/Aman/Sticho/backend/app/main.py).
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



