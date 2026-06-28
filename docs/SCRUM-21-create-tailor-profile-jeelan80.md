# SCRUM-21: Create Tailor Profile

## Jira Scrum Ticket Details
- **Title:** Create Tailor Profile
- **Summary:** Allow tailors to create business profiles with details (Business Name, Bio, City, Locality, Address, Experience).
- **Description:** To create your tailor profile, please fill in the following details: Business Name, Bio, City, Locality, Address, Experience. Make sure all required fields are completed. If any required fields are missing, submission will be blocked with field-level validation errors. Once all required fields are valid and you submit the form, your profile will be saved with a status of "pending." If you need to update your details after submission, you can edit the profile, and your changes will be saved successfully.
- **Assigned To:** Jeelan Basha (@jeelan80)
- **Date Assigned:** June 19, 2026
- **Date PR Raised:** June 28, 2026

## Actual Implemented Details
1. **API Integration ([api.ts](file:///h:/Projects/Stichoh/frontend/src/app/api.ts)):**
   - Added helper functions: `sendOtp`, `verifyOtp`, `createTailor`, `updateTailor`.
   - Updated `Tailor` interface to support the new `experience` (Years of Experience) property.
2. **Registration Page ([register/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/register/page.tsx)):**
   - Refactored form handlers to run client-side validations (matching passwords, requiring fields).
   - Enforced button-based direct click handlers (`type="button" onClick={handleSendOtp}`) and `onSubmit={e => e.preventDefault()}` on forms to completely prevent browser-native GET page reloads under any script hydration state.
   - Connected `sendOtp` and `verifyOtp` API endpoints.
   - Successfully cached validated details to `localStorage` under `tailor_registration_info` on success and redirected to `/onboarding`.
3. **Onboarding Page ([onboarding/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/onboarding/page.tsx)):**
   - Implemented onboarding fields: `Business Name`, `Bio`, `City`, `Locality`, `Address`, `Years of Experience` with robust field-level error messages.
   - Saves profile state to `localStorage` and redirects user to `/dashboard`.
4. **Dashboard Page ([dashboard/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/dashboard/page.tsx)):**
   - Integrated dynamic profile display loading from `localStorage`.
   - Renders a styled, prominent status chip displaying **"Pending Approval"** matching the state constraints.
5. **Profile Edit Page ([dashboard/profile/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/dashboard/profile/page.tsx)):**
   - Populates fields from `localStorage`.
   - Re-validates required inputs on save, updates `localStorage`, and calls `updateTailor` backend endpoint to sync.
6. **Welcome Page ([page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/page.tsx)):**
   - Added "Join as Partner" button link in the header linking to `/register`.
7. **Database Schema Setup (Local DB Setup):**
   - Identified that the database was missing the `otp_codes` table, causing the backend to return `500 Internal Server Error` on registration.
   - Created the missing `otp_codes` table in Supabase and granted permissions to the API roles (`service_role`, `anon`, `authenticated`) to resolve the backend's server errors.
