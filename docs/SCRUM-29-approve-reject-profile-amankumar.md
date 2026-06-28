# SCRUM-29: Approve or Reject Tailor Profiles

## 1. Scrum Details
* **Title:** Approve or Reject Tailor Profiles
* **Summary:** As an admin, I want to approve or reject a tailor's profile, so that only verified, quality profiles appear on the platform.
* **Description:** 
  * Given a pending profile, when an admin approves it, then status changes to "approved" and it becomes publicly visible.
  * Given a pending profile, when an admin rejects it with a reason, then status changes to "rejected" and it stays hidden.
  * Given a decision is made, when saved, then the tailor receives a notification of the outcome.
* **Assigned To:** Aman Kumar
* **Date Assigned:** June 28, 2026
* **Date PR Raised:** June 28, 2026

---

## 2. Implementation Details
The backend implementation supports profile verification status transitions and notification triggers:

### Database & ORM Model Changes
* Managed database DDL migration adding `verification_status` and `rejection_reason` to the `public.tailors` table on Supabase.
* Implemented validation mapping for tailors in Pydantic schemas in [schemas/tailor.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/tailor.py).

### API Endpoint Changes
* Implemented `POST /api/v1/admin/tailors/{tailor_id}/verify` in [admin.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/admin.py).
* Validates inputs using `TailorVerificationUpdate` schema.
* Enforces that a `rejection_reason` must be provided when rejecting a profile (status `'rejected'`), raising a `400 Bad Request` if missing.
* Updates tailor status to `'approved'` or `'rejected'`. APPROVED status sets `is_verified` to `True` (making the profile publicly searchable) and clears the `rejection_reason`. REJECTED status sets `is_verified` to `False` (keeping the profile hidden/unsearchable).
* Triggers a mock SMS/WhatsApp notification to inform the tailor of the verification outcome.

### Verification & Testing
* Wrote **Test 15** (profile approval) and **Test 16** (profile rejection checks) in [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py).
* Verified that the backend integration test suite runs and passes successfully.
