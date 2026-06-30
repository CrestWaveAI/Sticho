# SCRUM-24: Set Working Hours - Frontend Hookup

## 1. Scrum Details
* **Title:** Set Working Hours
* **Summary:** Hook up tailor opening/closing schedules and working hours configuration.
* **Description:** As a tailor, I want to set my opening and closing times for each day of the week, so that customers know when I'm available.
  * Given the working hours form, when a tailor sets open/close times per day, then the values are saved per day of the week.
  * Given a day is marked closed, when saved, then it displays as "Closed" on the public profile.
  * Given hours are not set for a day, when displayed publicly, then it shows "Not specified" rather than a misleading default.
* **Assignee:** `@jeelan80` (USER)
* **Date Assigned:** 2026-06-19
* **Date PR Raised:** 2026-06-30

---

## 2. Implementation Details
- **API Interface**: Added `working_hours` type to `Tailor` and `updateTailor` payload.
- **Settings Page Scheduler**: Built a custom day-by-day scheduler on the Settings Page:
  - Supports checking/unchecking "Closed" status per day.
  - Dynamically disables/enables time input controls for each day.
  - Binds to a structured JSON object (`Record<string, WorkingHourDay>`) and updates Supabase backend on save.
- **Search Discovery Cards**: Display today's working hours dynamically on public search cards. Conforms to day-by-day open/close status and legacy string format fallback compatibility.
