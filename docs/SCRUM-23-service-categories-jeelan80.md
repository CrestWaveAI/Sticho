# SCRUM-23: Select Service Categories

## Jira Scrum Ticket Details
- **Title:** Select Service Categories
- **Summary:** A tailor can tag services with multiple categories to display on their public profile and assist in search filtering.
- **Description:** A tailor can tag services with multiple categories (e.g., Stitching, Alterations, Embroidery). At least one category is required for profile submission. Selected categories will display on the public profile and assist in search filtering once the profile is approved.
- **Assigned To:** Jeelan Basha (@jeelan80)
- **Date Assigned:** June 19, 2026
- **Date PR Raised:** June 28, 2026

## Actual Implemented Details

1. **API Integration ([api.ts](file:///h:/Projects/Stichoh/frontend/src/app/api.ts)):**
   - Added `Category` interface for backend category objects (`id`, `name`, `description`).
   - Added `fetchCategories()` — fetches all available service categories from `GET /api/v1/categories`.
   - Added `createService()` — creates a service linking a tailor to a category via `POST /api/v1/services`.
   - Added `deleteService()` — removes a service (and its category association) via `DELETE /api/v1/services/{id}`.

2. **Onboarding Page ([onboarding/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/onboarding/page.tsx)):**
   - Categories are now fetched dynamically from the backend on mount (with hardcoded fallbacks).
   - Replaced the static hardcoded `allCategories` array with dynamically loaded category names.
   - Added validation requiring at least one category to be selected before profile submission.
   - Upon successful tailor profile creation, iterates through selected categories and calls `createService()` for each to persist the tailor–category association in the database.

3. **Dashboard Profile Page ([dashboard/profile/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/dashboard/profile/page.tsx)):**
   - Fetches all available categories and the tailor's existing services from the backend on mount.
   - Replaced the freeform text-input "Add Category" modal with toggleable category chips backed by database categories.
   - Added `toggleCategory()` handler with validation preventing deselection of the last category.
   - On profile save, performs differential sync: compares current selections against original services, calls `createService()` for newly added categories and `deleteService()` for removed ones.
   - Refetches tailor details after sync to ensure UI state matches the database.
   - Removed unused `Modal` import and legacy `handleAddCategory`/`removeCategory` handlers.

4. **Home Search Page ([page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/page.tsx)):**
   - Category filter checkboxes are now loaded dynamically from the backend via `fetchCategories()` on mount.
   - Replaced the static `ACTIVE_CATEGORIES` constant with a `categoriesList` state variable populated from the API.
   - Tailor cards continue to display categories as tags, now backed by the services relationship in the database.
