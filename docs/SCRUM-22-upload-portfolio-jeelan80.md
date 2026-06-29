# SCRUM-22: Upload Portfolio Images

## Jira Scrum Ticket Details
- **Title:** Upload Portfolio Images
- **Summary:** As a customer, you can upload portfolio images, allow customer to upload up to 20 photos of their work, enforce validations, and support reordering.
- **Description:** 
  1. **Upload Limit**: Allow customers/partners to upload up to 20 photos of their work.
     - If < 20, new images can be added and stored via Cloudinary CDN, linking them to the profile.
     - If = 20, any attempt to upload another is blocked with a clear message.
  2. **File Validation**: Ensure only supported file types (JPEG, PNG, WEBP) and sizes (<= 5MB) are accepted.
  3. **Image Reordering**: Allow users to reorder existing images and save successfully.
- **Assigned To:** Jeelan Basha (@jeelan80)
- **Date Assigned:** June 19, 2026
- **Date PR Raised:** June 29, 2026

## Actual Implemented Details

1. **Portfolio API Extensions ([api.ts](file:///h:/Projects/Stichoh/frontend/src/app/api.ts)):**
   - Added `PortfolioImage` TypeScript interface mapping backend attributes (`id`, `tailor_id`, `image_url`, `caption`, `position`, `created_at`).
   - Extended `Tailor` interface to optionally contain `portfolio_images?: PortfolioImage[]`.
   - Added `uploadPortfolioImage` — performs Multipart Form-data upload to `POST /api/v1/tailors/{tailor_id}/portfolio/upload`.
   - Added `deletePortfolioImage` — calls `DELETE /api/v1/tailors/{tailor_id}/portfolio/{image_id}`.
   - Added `reorderPortfolioImages` — calls `PUT /api/v1/tailors/{tailor_id}/portfolio/reorder` with the updated ID-position pairs.

2. **Portfolio Dashboard Page ([dashboard/portfolio/page.tsx](file:///h:/Projects/Stichoh/frontend/src/app/dashboard/portfolio/page.tsx)):**
   - Refactored page from mock static items array to fetch real, dynamic portfolio images using `fetchTailorDetail` on mount.
   - Designed file input selectors with built-in preview states (`previewUrl` using object URLs with automatic cleanup to prevent memory leaks).
   - Enforced client-side validations matching the backend constraints:
     - **Size Check**: Restricts files > 5MB and triggers an error toast.
     - **Type Check**: Restricts non-image types outside of `image/jpeg`, `image/png`, and `image/webp`.
     - **Count Limit Check**: Disables the upload trigger and blocks uploads with an error toast if `images.length >= 20`.
   - Built a sleek reordering handler `handleMoveImage` using position index swaps that recalculate sequential sorting positions and trigger a bulk reorder API request.
   - Built optimistic deletion with rollbacks to ensure high-fidelity interactions when deleting.

3. **Cloudinary CDN Backend Issue Setup Recommendation:**
   - As requested, since the backend currently uses fallback local storage, a GitHub issue has been logged for the backend team (@musharraf, @amankumar) to hook up Cloudinary storage in the FastAPI code.
