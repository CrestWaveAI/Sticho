# SCRUM-24: Set Working Hours

## 1. Scrum Details
* **Title:** Set Working Hours
* **Summary:** Enforce structured schema validation for working hours and support tailor opening/closing schedules.
* **Description:** As a tailor, I want to set my opening and closing times for each day of the week, so that customers know when I'm available.
  * Given the working hours form, when a tailor sets open/close times per day, then the values are saved per day of the week.
  * Given a day is marked closed, when saved, then it displays as "Closed" on the public profile.
  * Given hours are not set for a day, when displayed publicly, then it shows "Not specified" rather than a misleading default.
* **Assignee:** Sameer (Frontend) / Antigravity (Backend)
* **Date Assigned:** 2026-06-19
* **Date PR Raised:** 2026-06-29

---

## 2. Implementation Details
* **Validation Schema:**
  * Created `WorkingHourDay` Pydantic model in [tailor.py](file:///Users/amankumar/Aman/Sticho/backend/app/schemas/tailor.py) with fields: `open` (str/None), `close` (str/None), and `closed` (bool).
  * Updated `working_hours` fields in `TailorDetailResponse` and `TailorUpdate` to use `dict[str, WorkingHourDay | str]` to validate structured input while gracefully supporting legacy text-based representations (e.g. `{"Mon-Sat": "10:00 AM - 8:00 PM"}`).
* **Model Fields:**
  * Kept SQL database mapping to standard JSON field for native PostgreSQL storage.
* **Test Verification:**
  * Added Test 17 in [test_endpoints.py](file:///Users/amankumar/Aman/Sticho/backend/app/test_endpoints.py) to assert updating profile working hours, verifying that open/close times and closed flags validate correctly. Tests passed successfully.
