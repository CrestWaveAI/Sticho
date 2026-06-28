# Scrum Log: SCRUM-20 — Tailor Registration & Login (Email + Google OAuth)

## 1. Scrum Details from Jira
* **Key:** SCRUM-20
* **Title:** Tailor Registration & Login (Email + Google OAuth)
* **Summary:** Implement secure tailor authentication using email/password or Google OAuth.
* **Description:**
  * As a Tailor, I want to register and log in using my email or Google account, so that I can save my activity and access the platform securely.
  * Given a new visitor, when they sign up with email + password, then an account is created.
  * Given Google OAuth is selected, when the user authorizes, then an account is created/logged in without a password.
  * Given an email already registered, when sign-up is attempted again, then a clear duplicate-email error is shown.
  * Given valid credentials, when login succeeds, then the user is redirected to the homepage and the session persists until logout.
* **Assigned To:** Aman Kumar
* **Date Assigned:** June 28, 2026
* **Date PR Raised:** June 28, 2026

## 2. Technical Implementation Details
To support this authentication redesign, the following modifications were completed:

### Database Changes (Supabase & SQLite Mock)
* Dropped the obsolete `public.otp_codes` table completely.
* Modified `public.tailors` columns:
  * Set `email` column to `NOT NULL` and `UNIQUE`.
  * Set `contact_number` and `address` columns to `NULLABLE`.
  * Added `hashed_password` (`VARCHAR(255)`) and `google_id` (`VARCHAR(255)`) columns.

### ORM Model Changes (FastAPI Backend)
* Deleted ORM model file `backend/app/models/otp.py`.
* Updated SQLAlchemy `Tailor` model attributes in `backend/app/models/tailor.py` to match new nullability constraints and added `hashed_password` and `google_id` properties.

### Security Utilities
* Created `backend/app/core/security.py` using Python's standard libraries:
  * `hash_password(password)`: Hashes passwords using secure PBKDF2-HMAC-SHA256 with salt.
  * `verify_password(password, hashed)`: Verifies passwords against stored hashes.
  * `create_token(payload)`: Generates signed JWT-like access tokens using HMAC-SHA256.
  * `verify_token(token)`: Validates and decodes signed session tokens.

### Schemas & API Endpoints
* Rewrote `backend/app/schemas/auth.py` to support `TailorRegister`, `TailorLogin`, `GoogleAuthRequest`, and `AuthResponse` models.
* Updated `backend/app/schemas/tailor.py` to enforce email as required and contact/address as optional.
* Rewrote `backend/app/api/v1/endpoints/auth.py`:
  * `POST /register`: Registers new email/password accounts, verifying email uniqueness.
  * `POST /login`: Logs in existing tailors via email/password.
  * `POST /google`: Authorizes tailors using Google OAuth credentials, automatically linking new/existing accounts by email.
* Updated `create_tailor` profile registration in `backend/app/api/v1/endpoints/tailors.py` to remove OTP gates.

### Verification Outcomes
* Removed old `otp_codes` model imports and query mock blocks in `backend/app/test_endpoints.py`.
* Replaced tests with:
  * **Test 11 (Tailor Registration):** Registers a new tailor boutique via email + password and blocks duplicate sign-ups.
  * **Test 12 (Tailor Login):** Logins with valid/invalid credentials.
  * **Test 13 (Google OAuth):** Tests Google sign-up, Google login, and automatic email linking.
  * **Test 13b (Multi-Category Search Filtering):** Validates category search discovery.
* Verified that both backend test suites (`test_models` and `test_endpoints`) pass with zero errors.
* Verified that the frontend application compiles and lint checks complete successfully.
