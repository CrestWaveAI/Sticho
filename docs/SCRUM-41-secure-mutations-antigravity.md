# SCRUM-41: Secure Profile, Service, and Portfolio mutations with JWT Authentication

## 1. Scrum Details
- **Issue Key:** SCRUM-41
- **Title:** Secure Profile, Service, and Portfolio mutations with JWT Authentication
- **Assignee:** Antigravity
- **Assigned Date:** July 1, 2026
- **PR Raised Date:** July 1, 2026
- **Summary:** All mutating REST API endpoints on the backend (creating, updating, and deleting profiles, services, and portfolios) are secured with JWT verification and owner authorization checks.

## 2. Implementation Details

### Changes Made
- Added JWT auth dependency validation checks to profile, services, and portfolio mutation endpoints.
- Verifies that the authenticated `current_tailor_id` matches the path's `tailor_id` parameter or matches the `tailor_id` associated with the service being modified.

### Files Modified

#### 1. [tailors.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/tailors.py)
- Secured the following routes by adding the parameter `current_tailor_id: str = Depends(get_current_tailor_id)` and checking tailor ownership:
  - `PUT /api/v1/tailors/{tailor_id}`
  - `POST /api/v1/tailors/{tailor_id}/portfolio`
  - `POST /api/v1/tailors/{tailor_id}/portfolio/upload`
  - `PUT /api/v1/tailors/{tailor_id}/portfolio/reorder`
  - `DELETE /api/v1/tailors/{tailor_id}/portfolio/{image_id}`

#### 2. [services.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/services.py)
- Secured the service mutation routes to ensure ownership validation:
  - `POST /api/v1/services`
  - `PUT /api/v1/services/{service_id}` (fetches service and verifies tailor matches token)
  - `DELETE /api/v1/services/{service_id}` (fetches service and verifies tailor matches token)

#### 3. [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py)
- Updated Test 6, Test 7, and Test 8 to pass a valid `Authorization` header containing the tailor's Bearer token.
- Added `Test 20: Run Backend Mutation Authentication & Authorization Checks` to verify that requests without a token return `401 Unauthorized` and requests with incorrect permissions return `403 Forbidden`.

### Test Verification Outcome
- FastAPI application compiles and loads successfully.
- All 20 tests in `test_endpoints.py` executed and passed successfully against the SQLite mock environment.
