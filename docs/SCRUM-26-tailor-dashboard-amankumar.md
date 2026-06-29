# SCRUM-26: View Profile Dashboard

## 1. Scrum Details
* **Title:** View Profile Dashboard
* **Summary:** Implement backend endpoints and database schemas to track tailor profile dashboard metrics such as WhatsApp/Call clicks, profile completeness, and recent leads.
* **Description:** As a tailor, I want to see my profile status, lead counts, and profile completeness, so that I understand how my profile is performing and what to improve.
* **Assignee:** amankumar
* **Date Assigned:** 2026-06-19
* **Date PR Raised:** 2026-06-28

---

## 2. Implementation Details
* **Database Changes:**
  * Added `whatsapp_clicks` and `call_clicks` columns to `public.tailors` table on Supabase.
* **ORM Model:**
  * Updated `Tailor` SQLAlchemy model in [tailor.py](file:///Users/amankumar/Aman/Sticho/backend/app/models/tailor.py) to map click columns.
* **Endpoints Built:**
  * `POST /api/v1/tailors/{tailor_id}/track-click`: Click tracking endpoint to increment Call/WhatsApp clicks.
  * `GET /api/v1/tailors/{tailor_id}/dashboard`: Secure dashboard data retrieval gated on tailor authorization token. Returns profile verification status, total leads count, click counts, calculated profile completeness percentage, missing fields list with prompts, and recent lead details.
* **Test Verification:**
  * Added Test 16 to [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py) checking click incrementation, dashboard auth, completeness metrics, and lead fetching. Passed successfully.
