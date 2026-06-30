# SCRUM-10, SCRUM-19, SCRUM-26: Customer Auth, Ratings/Reviews, and Tailor Dashboard Integration

## 1. Scrum Details
* **Tickets:** 
  * **SCRUM-10**: Customer Registration & Login (Email + Google OAuth)
  * **SCRUM-19**: View & Submit Ratings and Reviews
  * **SCRUM-26**: View Profile Dashboard & Click Tracking
* **Summary:** Hook up Customer Auth, Ratings/Reviews, and Tailor Dashboard on the frontend.
* **Assignee:** `@jeelan80` (USER)
* **Date Assigned:** 2026-06-19
* **Date PR Raised:** 2026-06-30

---

## 2. Implementation Details

### Tailor Auth (Actual Connection)
- Removed the fake OTP verification step from the Tailor registration page [register/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/register/page.tsx).
- Connected the registration form directly to the backend endpoint `POST /api/v1/auth/register`.
- Created a new tailor `/login` page [login/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/login/page.tsx) connected to `POST /api/v1/auth/login`.
- Stored the returned `access_token` as `tailor_token` and `tailor_id` as `tailor_profile_id` in local storage for session authentication.

### Tailor Profile Dashboard
- Connected [dashboard/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/dashboard/page.tsx) to fetch live metrics via `GET /api/v1/tailors/{tailor_id}/dashboard` using `tailor_token`.
- Rendered total leads count, WhatsApp clicks, Call clicks, and profile completeness percentage progress bar.
- Implemented a missing profile fields checklist displaying dynamic links to add missing fields (e.g. bio, address, location).
- Displayed recent leads details table.

### Customer Authentication
- Placed Customer Auth trigger and profile indicators in the main search page header [page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/page.tsx).
- Built a Customer Auth Modal supporting Sign In (`POST /api/v1/customer-auth/login`), Sign Up (`POST /api/v1/customer-auth/register`), and Mock Google OAuth (`POST /api/v1/customer-auth/google`).
- Stored the customer session token `customer_token` and name in local storage.

### Ratings & Reviews
- Integrated collapsible reviews panel under each tailor discovery card on the search page.
- Lists approved reviews for each tailor via `GET /api/v1/reviews/tailor/{tailor_id}`.
- Allows logged-in customers to submit reviews (1-5 star rating and comment) via `POST /api/v1/reviews` with Bearer auth. Auto-refreshes review lists and recalculates average ratings in the UI instantly.
- Prompts customer sign-in modal if trying to write a review while unauthenticated.

### Click Tracking
- Added click tracking to "WhatsApp" and "Call Direct" buttons on the search page to hit `POST /api/v1/tailors/{tailor_id}/track-click` and increment clicks.
