# SCRUM-16: Browse Portfolio Gallery

## 1. Scrum Details
* **Title:** Browse Portfolio Gallery
* **Summary:** As a customer, I want to browse a tailor's portfolio of work photos, so that I can assess their work quality before visiting.
* **Description:**
  * Given a tailor profile with uploaded images, when the gallery loads, then images display in the defined sort order via CDN-optimized URLs.
  * Given an image is tapped, when opened, then it displays in an enlarged/lightbox view.
  * Given an image has a caption, when displayed, then the caption is visible alongside the image.
* **Assignee:** amankumar
* **Date Assigned:** June 29, 2026
* **Date PR Raised:** June 29, 2026

---

## 2. Implementation Details
* **ORM Schema & Models:**
  * Backend database table `public.portfolio_images` and ORM model `PortfolioImage` are fully defined to track image URLs, captions, position sort order, and tailor reference IDs.
* **Endpoints:**
  * Endpoint `GET /api/v1/tailors/{tailor_id}` returns portfolio images sorted ascendingly by their `position` column.
  * Endpoint mapper `_row_to_detail` sorts images sequentially via Python's built-in sorted mechanism (`sorted_images = sorted(portfolio_images, key=lambda x: x.get("position", 0))`), meeting the requirement that images display in the defined sort order.
* **Test Verification:**
  * Verified via existing integration tests (specifically Test 8 in `test_endpoints.py`) validating correct JSON return fields, captions, and sorted positions.
