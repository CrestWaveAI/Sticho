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

Test 4: Get tailor detail view for 29fbf875-fede-4c2f-b043-6cd4dad175ea
  - Detail view for Signature Threads verified (contact gated).
Test 4 Passed!

Test 5: Submit lead to unlock contact info
  - Lead submitted successfully.
  - Gated Contact Number unlocked: +91 98765 43210
Test 5 Passed!

All integration tests passed successfully against local SQLite database!
```
