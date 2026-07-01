# SCRUM-42 — Security Hardening: Password Hashing, SECRET_KEY, Referer Bypass

## Scrum Details
| Field | Value |
|---|---|
| **Jira Ticket** | SCRUM-42 |
| **Title** | Upgrade Password Hashing, Secure SECRET_KEY, and Remove Referer Bypass |
| **Assignee** | Antigravity (AI) |
| **Date Assigned** | 2026-07-01 |
| **PR Raised** | 2026-07-01 |
| **Status** | In Review |

**Summary:**
Three distinct security vulnerabilities were addressed:
1. The `SECRET_KEY` used to sign JWT tokens was hardcoded as a string literal in `security.py`.
2. Passwords were hashed with a static salt (`b"sticho-salt-secure"`), meaning identical passwords always produced identical database hashes — making all hashes compromised if any one password were known.
3. The `GET /api/v1/tailors/{tailor_id}` endpoint granted unverified tailors access to their own profile by checking the easily-spoofable `Referer` HTTP header for `/dashboard` — no authentication required.

---

## Implementation Details

### 1. Upgraded password hashing (`app/core/security.py`)

**Before (Vulnerable):**
```python
SECRET_KEY = "super-secret-key-change-in-production"

def hash_password(password: str) -> str:
    salt = b"sticho-salt-secure"  # STATIC SALT - every identical password hashes identically
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return dk.hex()
```

**After (Secure):**
```python
import os
import bcrypt

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()          # Dynamic random salt per call
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False
```

**Why bcrypt?**
- bcrypt generates a cryptographically random 128-bit salt internally on each `gensalt()` call — two users with the same password get completely different hashes.
- bcrypt is intentionally slow (cost factor), resisting brute-force and rainbow table attacks.
- The full hash + salt is stored as a single string (no separate salt column needed).

### 2. SECRET_KEY from environment variables

- `SECRET_KEY` is now loaded from `os.getenv("SECRET_KEY", ...)` with the hardcoded string serving only as a fallback default for local dev.
- `.env.example` updated with the `SECRET_KEY` placeholder to prompt teams to generate a secure value before deployment.

### 3. Removed Referer header bypass (`app/api/v1/endpoints/tailors.py`)

**Removed code:**
```python
referer = request.headers.get("referer", "")
if "/dashboard" in referer:
    is_authorized = True
```

The `request: Request` parameter and `Request` FastAPI import were also removed since they were only needed for the referer check.

**Access control is now purely JWT-based:**
- Only requests supplying a valid `Authorization: Bearer <token>` where the token payload's `tailor_id` matches the path parameter are granted access to unverified tailor profiles.
- This aligns with the intent of the frontend F1 issue: all settings/dashboard page requests must send the Bearer token.

### 4. Integration test suite updated (`app/test_endpoints.py`)

Test 4b-2 was updated to assert that passing a spoofed `Referer: http://localhost:3000/dashboard/settings` header **without** a Bearer token returns `404 Not Found`, confirming the bypass is closed.

---

## Test Verification Outcomes
- FastAPI app loaded successfully (no import errors with `bcrypt`).
- All 19 integration tests passed against local SQLite in-memory database.
- Test 4b-2 correctly returned `404` for Referer-only requests, and `200` for valid Bearer token requests (Test 4b-3).
