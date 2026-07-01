# SCRUM-26: Tailor Details Page, Profile Sync, and WhatsApp Settings

## 1. Scrum Details
* **Jira Ticket:** [SCRUM-26](https://006amanraj.atlassian.net/browse/SCRUM-26) (View Profile Dashboard & Click Tracking)
* **Summary:** Connect tailor profile data dynamically, resolve local storage profile lock-in, add WhatsApp editing under settings, and build a customer-facing details view with lead-gating.
* **Assignee:** `@jeelan80` (USER)
* **Date Assigned:** 2026-06-30
* **Date PR Raised:** 2026-07-01

---

## 2. Implementation Details

### Customer-Facing Tailor Details Page (GitHub Issue #63)
- Created the details page at [profile/[id]/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/profile/%5Bid%5D/page.tsx) and [profile/[id]/page.module.css](file:///h:/Projects/Stichoh/frontend/src/app/profile/%5Bid%5D/page.module.css).
- Fetches tailor details dynamically from `GET /api/v1/tailors/{tailor_id}` using `fetchTailorDetail`.
- Displays tailor branding, bio, star ratings, categories, portfolio images, and working hours.
- Gated phone numbers are protected by the "Connect with Tailor" lead capturing form. Submitting the form calls `submitLead`, stores the unlocked contact details in `localStorage` (`unlocked_tailors`), and reveals the numbers.
- Integrated click-tracking on the Call and WhatsApp links calling `trackClick(tailorId, type)`.
- Renders dynamic reviews listing and allows submitting new reviews when logged in.

### Discovery Navigation
- Wrapped discovery page cards in [page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/page.tsx) with a `<Link href={\`/profile/\${tailor.id}\`}>` wrapper to enable smooth navigation to the details page, keeping bookmark buttons separate to prevent nested button click errors.

### Profile Local Storage Sync (GitHub Issue #62)
- Corrected [dashboard/profile/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/dashboard/profile/page.tsx) to map the tailor's contact and WhatsApp numbers returned by `fetchTailorDetail` during initial render instead of falling back permanently to local storage values.

### WhatsApp Settings Field (GitHub Issue #61)
- Added `whatsapp` to `contactInfo` state in [dashboard/settings/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/dashboard/settings/page.tsx).
- Exposed the `WhatsApp Number` `<Input>` field under the Phone Number field.
- Passed `whatsapp_number` inside the update payload sent to `updateTailor`.
