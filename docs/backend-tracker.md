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
| `SUPABASE_KEY` | Supabase anon/service_role key | 2026-06-23 | Yes |

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
* **Fields:** `id` (UUID, PK), `name` (String), `contact_number` (String), `email` (String), `bio` (Text), `address` (String), `location_id` (UUID, FK), `is_verified` (Boolean), `gradient` (String), `rating` (Numeric), `reviews_count` (Integer), `created_at` (DateTime)
* **Schemas:** 
  * `TailorCreate` (includes all fields)
  * `TailorPublicResponse` (excludes `contact_number`; computes `categories` list from services dynamically)
  * `TailorDetailResponse` (extends public response)
  * `TailorPrivateResponse` (includes `contact_number` unlocked)

### 4. Services (`Service` model)
* **Table:** `public.services`
* **Fields:** `id` (UUID, PK), `tailor_id` (UUID, FK), `category_id` (UUID, FK), `price_estimate` (Numeric), `time_estimate_days` (Integer), `description` (Text), `created_at` (DateTime)
* **Schemas:** `ServiceCreate`, `ServiceResponse`, `ServiceDetailResponse` (includes nested `category`)

### 5. Portfolio Images (`PortfolioImage` model)
* **Table:** `public.portfolio_images`
* **Fields:** `id` (UUID, PK), `tailor_id` (UUID, FK), `image_url` (String), `caption` (Text), `created_at` (DateTime)
* **Schemas:** `PortfolioImageCreate`, `PortfolioImageResponse`

### 6. Leads (`Lead` model)
* **Table:** `public.leads`
* **Fields:** `id` (UUID, PK), `tailor_id` (UUID, FK), `customer_name` (String), `customer_mobile` (String), `requirement_description` (Text), `created_at` (DateTime)
* **Schemas:** `LeadCreate`, `LeadResponse`

---

## 5. Database Migrations Log
Logs database schema migrations (e.g. Alembic) to trace version history:
| Migration ID / Timestamp | Description | Type (Up/Down) | DB Lock Risk (High/Med/Low) | Status |
|---|---|---|---|---|
| `create_initial_schema` | Supabase SQL DDL migration setting up the core 6 tables and indexes | Up | Low | Applied |

---

## 6. API Endpoints Log
| Method | Endpoint | Group | Auth Required | Description | Status |
|---|---|---|---|---|---|
| `GET` | `/` | Meta | No | Root greeting with version details | Active |
| `GET` | `/health` | Meta | No | Server health check endpoint | Active |
| `GET` | `/api/v1/tailors` | Tailors | No | Search tailors with locality/city/pin_code/category filter (contact_number hidden) | Active |
| `GET` | `/api/v1/tailors/{tailor_id}` | Tailors | No | Retrieve detailed tailor profile (contact_number hidden) | Active |
| `POST` | `/api/v1/leads` | Leads | No | Submit a customer lead for a tailor; returns unlocked tailor contact details | Active |

---

## 7. Security Log
Logs security enhancements, fixes, or vulnerability patches:
| Incident / Enhancement | Description | Fixed On | Details / CVE Reference |
|---|---|---|---|
| RLS Disabled Alert | Supabase Row Level Security is currently disabled on all 6 public schema tables. This allows anonymous API read/write access. Needs configuration before staging/production launch. | 2026-06-23 | Supabase Advisory |

---

## 8. Changelog / Activity History
Chronological record of backend modifications:
* **2026-06-23:** Implemented tailor search/filtering (`GET /api/v1/tailors`), tailor details (`GET /api/v1/tailors/{tailor_id}`), and lead capture (`POST /api/v1/leads`) endpoints. Integrated routing in `app/main.py`. Added test dependencies `httpx` and `aiosqlite` and built a self-contained in-memory SQLite integration test suite `app/test_endpoints.py`. Improved DB connection fallback logic for local environments.
* **2026-06-23:** Created SQLAlchemy ORM models (`Location`, `Category`, `Tailor`, `Service`, `PortfolioImage`, `Lead`) in `app/models/` and Pydantic validation schemas in `app/schemas/`. Created import validation test script `app/test_models.py`.
* **2026-06-23:** Applied initial Supabase DDL schema migrations (`create_initial_schema`) and seeded database with 7 tailor profiles, categories, and services matching frontend specifications.
* **2026-06-23:** Set up async connection engine and DB session manager in `app/core/db.py` using SQLAlchemy and asyncpg. Created a database connection test script `app/test_db_conn.py`.
* **2026-06-23:** Bootstrapped the backend project using Python 3.13 and FastAPI. Added CORS middleware, environment configurations, and initial routes. Tested server and health check endpoints.
* **2026-06-23:** Created development tracking system and updated tracker template with migration, environment, and security logs based on industry standard best practices.

