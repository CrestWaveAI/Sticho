# Backend Development Tracker

This file logs all backend-specific changes, database models, schemas, API endpoints, and library dependencies added via `uv`.

## 1. Setup & Environment
* **Python Version:** 3.13 (specifically 3.13.7 locally)
* **Framework:** FastAPI
* **Database:** Supabase (PostgreSQL 17)
* **Package Manager:** `uv`
* **Virtual Environment Path:** `backend/.venv`

---

## 2. Dependencies Log (`uv`)
List of packages added via `uv add`:
| Package Name | Purpose | Added On | Commit / Ticket |
|---|---|---|---|
| `fastapi` | API web framework | 2026-06-23 | Initial Setup |
| `uvicorn` | ASGI server implementation | 2026-06-23 | Initial Setup |
| `sqlalchemy` | SQL toolkit & Object Relational Mapper | 2026-06-23 | DB Connection |
| `asyncpg` | Asynchronous PostgreSQL database client | 2026-06-23 | DB Connection |
| `psycopg2-binary` | Synchronous PostgreSQL database adapter | 2026-06-23 | DB Connection |
| `python-dotenv` | Reads key-value pairs from .env files | 2026-06-23 | DB Connection |
| `httpx` | Asynchronous HTTP client for API integration tests | 2026-06-23 | Endpoints Testing |
| `aiosqlite` | Asynchronous SQLite provider for local test environment | 2026-06-23 | Endpoints Testing |
| `aiofiles` | Asynchronous file operations (needed for StaticFiles) | 2026-06-24 | Profile/Portfolio CRUD |
| `python-multipart` | Parser for multipart form-data (needed for File uploads) | 2026-06-24 | Profile/Portfolio CRUD |
| `supabase` | Python client for Supabase REST (PostgREST) API | 2026-06-25 | SCRUM-11 / DB Connection |
| `cloudinary` | Cloudinary Python SDK for image/video upload and transformation CDN integration | 2026-06-29 | SCRUM-22 |

---

## 3. Environment Variables Tracker (`.env`)
Track variables that must be added to `.env` to prevent broken local setups:
| Key | Default / Purpose | Added On | Required |
|---|---|---|---|
| `PORT` | `8000` / server port | 2026-06-23 | No |
| `HOST` | `127.0.0.1` / server host | 2026-06-23 | No |
| `DEBUG` | `True` / debug mode toggle | 2026-06-23 | No |
| `DATABASE_URL` | Supabase connection string (Direct/Transaction Pooler) | 2026-06-23 | Yes |
| `SUPABASE_URL` | Supabase Project API URL | 2026-06-23 | Yes |
| `SUPABASE_KEY` | Supabase anon key | 2026-06-23 | Yes |
| `SUPABASE_SECRET_KEY`| Supabase service_role key to bypass RLS | 2026-06-25 | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Cloud Name | 2026-06-29 | Yes (Production) |
| `CLOUDINARY_API_KEY` | Cloudinary API Key credential | 2026-06-29 | Yes (Production) |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret credential | 2026-06-29 | Yes (Production) |

---

## 4. Database Schema & Entities
Detailed models, columns, and validation schemas implemented:

### 1. Locations (`Location` model)
* **Table:** `public.locations`
* **Fields:** `id` (UUID, PK), `name` (String, e.g. "Indiranagar"), `city` (String), `pin_code` (String), `created_at` (DateTime)
* **Schemas:** `LocationCreate`, `LocationResponse`

### 2. Categories (`Category` model)
* **Table:** `public.categories`
* **Fields:** `id` (UUID, PK), `name` (String, UNIQUE), `description` (Text), `created_at` (DateTime)
* **Schemas:** `CategoryCreate`, `CategoryResponse`

### 3. Tailors (`Tailor` model)
* **Table:** `public.tailors`
* **Fields:** `id` (UUID, PK), `name` (String), `contact_number` (String, NULL), `whatsapp_number` (String, NULL), `email` (String, UNIQUE), `bio` (Text, NULL), `address` (String, NULL), `hashed_password` (String, NULL), `google_id` (String, NULL), `location_id` (UUID, FK), `is_verified` (Boolean), `verification_status` (String), `rejection_reason` (Text, NULL), `gradient` (String), `rating` (Numeric), `reviews_count` (Integer), `experience` (Integer), `latitude` (Numeric), `longitude` (Numeric), `working_hours` (JSONB), `created_at` (DateTime)
* **Schemas:** 
  * `TailorCreate` (includes all fields except password, email is required, address/contact optional)
  * `TailorUpdate` (all fields optional for profile updates)
  * `TailorPublicResponse` (excludes `contact_number` and `whatsapp_number`; computes `categories` list dynamically)
  * `TailorDetailResponse` (extends public response; includes experience, latitude, longitude, working_hours, and portfolio_images)
  * `TailorPrivateResponse` (includes `contact_number` and `whatsapp_number` unlocked)

### 4. Services (`Service` model)
* **Table:** `public.services`
* **Fields:** `id` (UUID, PK), `tailor_id` (UUID, FK), `category_id` (UUID, FK), `price_estimate` (Numeric), `time_estimate_days` (Integer), `description` (Text), `created_at` (DateTime)
* **Schemas:** `ServiceCreate`, `ServiceResponse`, `ServiceDetailResponse` (includes nested `category`)

### 5. Portfolio Images (`PortfolioImage` model)
* **Table:** `public.portfolio_images`
* **Fields:** `id` (UUID, PK), `tailor_id` (UUID, FK), `image_url` (String), `caption` (Text), `position` (Integer, default 0), `created_at` (DateTime)
* **Schemas:** `PortfolioImageCreate`, `PortfolioImageResponse`, `PortfolioImagePositionUpdate` (bulk reordering)

### 6. Leads (`Lead` model)
* **Table:** `public.leads`
* **Fields:** `id` (UUID, PK), `tailor_id` (UUID, FK), `customer_name` (String), `customer_mobile` (String), `requirement_description` (Text), `created_at` (DateTime)
* **Schemas:** `LeadCreate`, `LeadResponse`

### 7. OTP Codes (`OTPCode` model) [DROPPED]
* **Table:** `public.otp_codes` (Dropped/deleted under SCRUM-20)

---

## 5. Database Migrations Log
Logs database schema migrations (e.g. Alembic) to trace version history:
| Migration ID / Timestamp | Description | Type (Up/Down) | DB Lock Risk (High/Med/Low) | Status |
|---|---|---|---|---|
| `create_initial_schema` | Supabase SQL DDL migration setting up the core 6 tables and indexes | Up | Low | Applied |
| `add_tailor_profile_fields` | Adds experience, latitude, longitude, and working_hours to tailors, and position to portfolio_images | Up | Low | Applied |
| `add_otp_codes_table` | Adds otp_codes table to public schema for tracking SMS OTP sessions | Up | Low | Applied |
| `add_tailor_whatsapp_number`| Adds whatsapp_number column to public.tailors table for separate WhatsApp contact | Up | Low | Applied |
| `revert_otp_verification_auth` | Drops otp_codes table, adds hashed_password and google_id, updates email constraint to UNIQUE NOT NULL | Up | Low | Applied |
| `create_customers_table` | Adds public.customers table for customer accounts (SCRUM-10) | Up | Low | Applied |
| `create_reviews_table` | Adds public.reviews table with foreign keys and unique constraints (SCRUM-19) | Up | Low | Applied |
| `add_tailor_click_tracking`| Adds whatsapp_clicks and call_clicks to public.tailors table (SCRUM-26) | Up | Low | Applied |
| `add_tailor_notifications_settings`| Adds notifications_enabled and notification_channel columns to public.tailors table (SCRUM-27) | Up | Low | Applied |

---

## 6. API Endpoints Log
| Method | Endpoint | Group | Auth Required | Description | Status |
|---|---|---|---|---|---|
| `GET` | `/` | Meta | No | Root greeting with version details | Active |
| `GET` | `/health` | Meta | No | Server health check endpoint | Active |
| `GET` | `/api/v1/locations/autocomplete` | Locations | No | Retrieve location autocomplete suggestions matching query term | Active |
| `GET` | `/api/v1/tailors` | Tailors | No | Search tailors with locality/city/pin_code/category filter (contact_number hidden) | Active |
| `GET` | `/api/v1/tailors/{tailor_id}` | Tailors | No | Retrieve detailed tailor profile (gates unverified tailors with 404, contact_number hidden) | Active |
| `PUT` | `/api/v1/tailors/{tailor_id}` | Tailors | No | Edit tailor boutique profile details | Active |
| `POST` | `/api/v1/tailors/{tailor_id}/portfolio` | Portfolio | No | Add portfolio image metadata (URL, caption) | Active |
| `POST` | `/api/v1/tailors/{tailor_id}/portfolio/upload` | Portfolio | No | Upload portfolio image file (max 5MB, JPEG/PNG/WEBP, limit 20) | Active |
| `PUT` | `/api/v1/tailors/{tailor_id}/portfolio/reorder` | Portfolio | No | Reorder portfolio image positions bulk | Active |
| `DELETE` | `/api/v1/tailors/{tailor_id}/portfolio/{image_id}` | Portfolio | No | Delete a portfolio image listing and file | Active |
| `POST` | `/api/v1/services` | Services | No | Create a new service listing for a tailor boutique | Active |
| `PUT` | `/api/v1/services/{service_id}` | Services | No | Edit service estimates/description | Active |
| `DELETE` | `/api/v1/services/{service_id}` | Services | No | Delete a service listing | Active |
| `GET` | `/api/v1/services/tailor/{tailor_id}` | Services | No | Retrieve all services for a specific tailor boutique | Active |
| `POST` | `/api/v1/leads` | Leads | No | Submit a customer lead for a tailor; returns unlocked tailor contact details | Active |
| `GET` | `/api/v1/categories` | Categories | No | Retrieve all tailor specializations / categories | Active |
| `POST` | `/api/v1/auth/register` | Auth | No | Register a new tailor account using email and password | Active |
| `POST` | `/api/v1/auth/login` | Auth | No | Login an existing tailor account using email and password | Active |
| `POST` | `/api/v1/auth/google` | Auth | No | Register or login a tailor using Google OAuth credentials | Active |
| `POST` | `/api/v1/tailors` | Tailors | No | Register a new tailor profile (email uniqueness check, optional phone check) | Active |
| `POST` | `/api/v1/customer-auth/register` | Customer Auth | No | Register a new customer account using email and password | Active |
| `POST` | `/api/v1/customer-auth/login` | Customer Auth | No | Login an existing customer account using email and password | Active |
| `POST` | `/api/v1/customer-auth/google` | Customer Auth | No | Register or login a customer using Google OAuth credentials | Active |
| `POST` | `/api/v1/reviews` | Reviews | Yes (Customer) | Submit star rating and comment for a tailor boutique | Active |
| `GET` | `/api/v1/reviews/tailor/{tailor_id}` | Reviews | No | List approved reviews for a tailor | Active |
| `POST` | `/api/v1/tailors/{tailor_id}/track-click` | Tailors | No | Increment call or whatsapp clicks for a tailor profile | Active |
| `GET` | `/api/v1/tailors/{tailor_id}/dashboard` | Tailors | Yes (Tailor) | Retrieve dashboard metrics (clicks, completeness, recent leads) | Active |

---

## 7. Security Log
Logs security enhancements, fixes, or vulnerability patches:
| Incident / Enhancement | Description | Fixed On | Details / CVE Reference |
|---|---|---|---|
| RLS Disabled Alert | Supabase Row Level Security is currently disabled on all 6 public schema tables. This allows anonymous API read/write access. Needs configuration before staging/production launch. | 2026-06-23 | Supabase Advisory |

---

## 8. Changelog / Activity History
Chronological record of backend modifications:
* **2026-06-29:** Implemented tailor profile working hours validation schema (`SCRUM-24`) and background lead notifications preferences and delivery simulation service (`SCRUM-27`). Updated `Tailor` SQLAlchemy ORM models with server defaults for `notifications_enabled` and `notification_channel` columns, updated validation schemas to enforce strict formatting for daily opening/closing times via Pydantic `WorkingHourDay`, built an asynchronous `NotificationService` simulating alerts to `docs/mock_notifications.log`, and integrated `BackgroundTasks` across profile views, click tracks, and lead capture submissions. Added Test 17 to integration tests checking the full settings update and event tracking logs.
* **2026-06-29:** Configured Cloudinary CDN for portfolio image uploads under task `SCRUM-22`. Added `cloudinary` dependency, configured `.env` and `.env.example` placeholder variables, and refactored the backend endpoint `POST /api/v1/tailors/{tailor_id}/portfolio/upload` to upload incoming assets directly to Cloudinary. Implemented local filesystem fallback for offline/test environments to ensure all integration tests continue passing.
* **2026-06-28:** Implemented Customer Auth (SCRUM-10), Ratings & Reviews (SCRUM-19), and Tailor Profile Dashboard (SCRUM-26). Created `Customer` and `Review` ORM models and schemas. Created customer auth endpoints (register, login, Google OAuth). Created reviews endpoints (submit with duplicate reviews blocking, list reviews by tailor, and auto-aggregate tailor ratings). Updated the `Tailor` model/database with `whatsapp_clicks` and `call_clicks` columns, created click tracking endpoints, and built a secure tailor dashboard statistics endpoint. Updated the SQLite mock PostgREST client and test suites, adding Tests 14, 15, and 16.
* **2026-06-28:** Redesigned tailor authentication under `SCRUM-20` to support Email + password registration/login and Google OAuth registration/login. Dropped OTP codes verification flow and `public.otp_codes` table. Added `hashed_password` and `google_id` columns to `public.tailors` table, set email to NOT NULL and UNIQUE, and made address and contact_number optional. Built cryptographic hashing and session token utilities, updated schemas, updated Auth and Tailor API endpoints, and replaced OTP tests with email/google integration tests (Tests 11-13, 13b).
* **2026-06-28:** Implemented separate WhatsApp and Call number fields under task `SCRUM-25`. Added `whatsapp_number` to `public.tailors` model, validation schemas (`TailorCreate`, `TailorUpdate`, `TailorPrivateResponse`), API mapper responses (in profile creation, profile updates, and lead submission unlocks), and updated integration tests (Test 5 and Test 12) with verification checks.
* **2026-06-27:** Implemented tailor registration via phone OTP (`SCRUM-20`), tailor profile creation (`SCRUM-21`), and multi-category filtering (`SCRUM-12`). Created `OTPCode` model/schemas, endpoints for sending/verifying OTP codes, categories listing, and a create tailor profile route gated on OTP verification. Updated the SQLite mock PostgREST client and test seeds, adding Tests 10-13 to the integration test suite.
* **2026-06-25:** Implemented detailed tailor profile fields and view page endpoints under task `SCRUM-15`. Expanded `tailors` database schema on Supabase with `experience`, `latitude`, `longitude`, `working_hours`, and `portfolio_images.position`. Enforced verification gate on `GET /api/v1/tailors/{tailor_id}`. Updated integration test suite `test_endpoints.py` to verify all updates.
* **2026-06-25:** Implemented search autocomplete locations endpoint (`GET /api/v1/locations/autocomplete`) matching locality name, city, or pin code with limit of 10. Added Test 9 to `test_endpoints.py` to verify locations autocomplete querying.
* **2026-06-24:** Implemented tailor profile CRUD (`PUT /api/v1/tailors/{tailor_id}`), Services CRUD (`POST/PUT/DELETE /api/v1/services` and `GET /services/tailor/{tailor_id}`), and Portfolio Management APIs (`POST/PUT/DELETE` portfolio images, reordering endpoints, and file upload size/type validation with local storage fallback). Added dependencies `aiofiles` and `python-multipart`. Mounted `StaticFiles` middleware in `app/main.py`. Updated `test_endpoints.py` to cover all new CRUD APIs.
* **2026-06-23:** Implemented tailor search/filtering (`GET /api/v1/tailors`), tailor details (`GET /api/v1/tailors/{tailor_id}`), and lead capture (`POST /api/v1/leads`) endpoints. Integrated routing in `app/main.py`. Added test dependencies `httpx` and `aiosqlite` and built a self-contained in-memory SQLite integration test suite `app/test_endpoints.py`. Improved DB connection fallback logic for local environments.
* **2026-06-23:** Created SQLAlchemy ORM models (`Location`, `Category`, `Tailor`, `Service`, `PortfolioImage`, `Lead`) in `app/models/` and Pydantic validation schemas in `app/schemas/`. Created import validation test script `app/test_models.py`.
* **2026-06-23:** Applied initial Supabase DDL schema migrations (`create_initial_schema`) and seeded database with 7 tailor profiles, categories, and services matching frontend specifications.
* **2026-06-23:** Set up async connection engine and DB session manager in `app/core/db.py` using SQLAlchemy and asyncpg. Created a database connection test script `app/test_db_conn.py`.
* **2026-06-23:** Bootstrapped the backend project using Python 3.13 and FastAPI. Added CORS middleware, environment configurations, and initial routes. Tested server and health check endpoints.
* **2026-06-23:** Created development tracking system and updated tracker template with migration, environment, and security logs based on industry standard best practices.

