# SCRUM-28: Review Tailor Verification Queue

## 1. Scrum Details
* **Title:** Review Tailor Verification Queue
* **Summary:** As an admin, I want to view a queue of newly submitted tailor profiles, so that I can review them before they go live.
* **Description:** 
  * Given profiles with status "pending", when the queue loads, then all of them are listed with key details and portfolio preview.
  * Given the queue, when sorted or filtered by submission date, then results update accordingly.
  * Given a profile is approved or rejected elsewhere, when the queue refreshes, then it no longer appears.
* **Assigned To:** Aman Kumar
* **Date Assigned:** June 28, 2026
* **Date PR Raised:** June 28, 2026

---

## 2. Implementation Details
The backend implementation introduces full support for tracking pending tailors and exposing a queue endpoint to admins:

### Database & ORM Model Changes
* Updated `public.tailors` database table with two new columns:
  * `verification_status` (VARCHAR, default 'pending'): Tracks verification lifecycle state (`pending`, `approved`, `rejected`).
  * `rejection_reason` (TEXT, nullable): Records why a profile was rejected.
* Updated SQLAlchemy model `Tailor` in [tailor.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/tailor.py) to represent these new columns.
* Seeded verified tailors with status `'approved'` to maintain system consistency.

### API Endpoint Changes
* Created a new admin endpoint module [admin.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/admin.py).
* Added `GET /api/v1/admin/tailors/queue`:
  * Retrieves all tailor profiles where `verification_status` is `'pending'`.
  * Fetches nested locations, services (with categories), and portfolio images (enabling portfolio previews).
  * Supports sorting by submission date via `sort_by` query parameters (`created_at_desc` or `created_at_asc`).

### Verification & Testing
* Added `MockQueryBuilder.order` to integration test framework to mock SQLite sorting.
* Wrote **Test 14** in [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py) to verify:
  * Retrieving the queue returns pending profiles only.
  * Validates structure and default unverified status of tailor profiles.
* Verified that the backend integration test suite runs and passes successfully.
