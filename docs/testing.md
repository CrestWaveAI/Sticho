# Backend Testing Guide & Test Results

This document provides instructions on how to set up the local backend testing environment, execute the test suites, and lists the latest execution results.

---

## 1. Overview of the Testing Strategy

To make development fast and reliable, the backend utilizes a **zero-config local testing strategy**:
* **SQLite In-Memory Database**: Tests run against a local in-memory SQLite database (`sqlite+aiosqlite:///:memory:`). This means you do not need a working Supabase connection or password to run the tests.
* **Schema Stripping Event Hooks**: Since SQLite does not support PostgreSQL schemas (like the `public.` schema used in our production models), the tests hook into SQLAlchemy's `before_create` metadata events to dynamically strip schema prefixes (`public.`) from tables and foreign keys during database creation.
* **Dependency Overrides**: The integration tests override the FastAPI `get_db` session manager to automatically route requests to the transient local SQLite database.

---

## 2. Setup Instructions

To prepare your environment and dependencies for running tests:

1. **Install Python 3.13** (if not already installed).
2. **Install the `uv` Package Manager** (if not already installed).
3. **Sync your virtual environment**:
   Navigate to the `backend/` directory and run:
   ```bash
   uv sync
   ```
   This will automatically create a `.venv` directory, install all required dependencies (including testing tools like `httpx` and `aiosqlite`), and generate/align the lock file.

4. **Verify your `.env` configuration**:
   Ensure you have a `.env` file inside the `backend/` directory. If you are developing locally without Supabase credentials, the database URL can remain a placeholder:
   ```env
   DATABASE_URL=postgresql://postgres.stncyvhjbtmutxsvuuxj:[YOUR_DATABASE_PASSWORD_HERE]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
   *Note: Our connection utility is designed to handle this placeholder automatically to prevent startup syntax validation crashes.*

---

## 3. Running the Test Suites

Execute the following commands from the `backend/` root directory:

### Run ORM Schema & Model Validation Tests
Verifies that the SQLAlchemy ORM models correspond to correct database schema generation and serialize cleanly into Pydantic validation models (including computed properties like `categories`):
```bash
uv run python -m app.test_models
```

### Run API Endpoints Integration Tests
Spawns an in-memory client against the FastAPI application and runs assertions verifying HTTP responses, search filters, and public/private contact number gating:
```bash
uv run python -m app.test_endpoints
```

---

## 4. Latest Verification Results

### ORM Model Mapping & Schema Validation (`test_models.py`)
```text
Verifying SQLAlchemy models and Pydantic schemas against local SQLite database...

Found 1 tailors in local DB.

Serializing to Pydantic TailorPublicResponse...

Tailor: Signature Threads
  Location: Indiranagar, Bangalore
  Verified: True
  Rating: 4.8 (120 reviews)
  Resolved Categories (Computed Field): ['Alterations']

Verification Successful! All models mapped and Pydantic serialization executed without errors.
```

### API Endpoints Integration Verification (`test_endpoints.py`)
```text
Starting Integration Tests with local SQLite in-memory database...

Test 1: Search tailors without filters
  - Tailor: Signature Threads, Categories: ['Alterations']
Test 1 Passed!

Test 2: Search tailors with locality=Indiranagar
  - Match: Signature Threads at Indiranagar
Test 2 Passed!

Test 3: Search tailors with category=Alterations
  - Match: Signature Threads with categories ['Alterations']
Test 3 Passed!

Test 4: Get tailor detail view for 6f9d62c0-f569-417f-a649-80033674c74f
  - Detail view for Signature Threads verified (contact gated, new fields present).
Test 4b: Get tailor detail view for unverified tailor a21c2416-8a4d-40e8-b26e-b531ad96c861
  - Unverified tailor is blocked (404 Not Found).
Test 4c: Get tailor detail view for non-existent tailor fda8e055-a573-4926-8a1e-b6c7d961403a
  - Non-existent tailor returns 404.
Test 4 Passed!

Test 5: Submit lead to unlock contact info
  - Lead submitted successfully.
  - Gated Contact Number unlocked: +91 98765 43210
Test 5 Passed!

Test 6: Update tailor profile details
  - Profile update verified successfully.
Test 6 Passed!

Test 7: Run Services CRUD operations
  - Service created successfully.
  - Service updated successfully.
  - List services for tailor boutique verified.
  - Service deleted successfully.
Test 7 Passed!

Test 8: Run Portfolio Management operations
  - Portfolio metadata added successfully.
  - File type validation verified (text/plain rejected).
  - File size validation verified (>5MB rejected).
  - Valid portfolio file upload verified.
  - Portfolio bulk reordering verified.
  - Portfolio image limit of 20 verified.
  - Portfolio image deletion verified.
Test 8 Passed!

Test 9: Run Locations Autocomplete search
  - Locations autocomplete query matched expected locality.
Test 9 Passed!

All integration tests passed successfully against local SQLite database!
```

---

## 5. Frontend Lint & Build Verification

To verify that the frontend contains no compilation errors or formatting/style issues, we run Next.js linting and static builds locally.

### Executing Frontend Linting
Run the following command from the `frontend/` root directory:
```bash
npm run lint
```
**Latest Output:**
```text
> temp_next_app@0.1.0 lint
> eslint
```
*(Clean execution with zero errors and zero warnings)*

### Executing Frontend Production Build
Run the following command from the `frontend/` root directory:
```bash
npm run build
```
**Latest Output:**
```text
> temp_next_app@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 3.0s
  Running TypeScript ...
  Finished TypeScript in 2.3s ...
  Collecting page data using 5 workers ...
  Generating static pages using 5 workers (0/4) ...
  Generating static pages using 5 workers (1/4) 
  Generating static pages using 5 workers (2/4) 
  Generating static pages using 5 workers (3/4) 
✓ Generating static pages using 5 workers (4/4) in 476ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```
*(Build successfully completed with zero TypeScript errors or bundle generation failures)*

---

## 6. Browser UI Testing (Omitted due to missing Frontend)

For the tailor details profile page (`SCRUM-15`), the Next.js frontend currently does not contain any subpages or route mappings (such as `/tailors/[id]`) for displaying individual tailor profiles.
- As a result, browser-based UI testing using the `/browser` subagent was **omitted** for this feature.
- All backend-related API behaviors (the GET endpoints, update routes, leads unlock endpoints, and the unverified tailor verification gates) have been fully covered and validated using backend integration test suites (`test_endpoints.py`).
