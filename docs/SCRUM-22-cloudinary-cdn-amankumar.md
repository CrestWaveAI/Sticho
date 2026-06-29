# SCRUM-22: Configure Cloudinary CDN for Portfolio Uploads

## 1. Scrum Details
* **Title:** Configure Cloudinary CDN for Portfolio Uploads
* **Summary:** Integrate Cloudinary API in the backend to store tailor portfolio uploads directly in a CDN instead of local fallback storage.
* **Description:** Update the `upload_portfolio_image` endpoint (`POST /api/v1/tailors/{tailor_id}/portfolio/upload`) to upload incoming images directly to Cloudinary CDN, returning the absolute CDN URL. Add the necessary config setup in `.env`, `.env.example`, and backend dependencies.
* **Assignee:** amankumar
* **Date Assigned:** June 29, 2026
* **Date PR Raised:** June 29, 2026

---

## 2. Implementation Details
* **Dependencies:**
  * Added `cloudinary` Python package to project dependencies in [pyproject.toml](file:///Users/amankumar/Aman/Sticho/backend/pyproject.toml).
* **Configuration:**
  * Configured placeholder environment keys in [backend/.env.example](file:///Users/amankumar/Aman/Sticho/backend/.env.example) and [backend/.env](file:///Users/amankumar/Aman/Sticho/backend/.env).
* **Endpoints Modified:**
  * Updated [tailors.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/tailors.py):
    * Configured the `cloudinary` SDK with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
    * Refactored `upload_portfolio_image` to check for these environment variables. When present, the uploaded file bytes are sent directly to Cloudinary (`cloudinary.uploader.upload`), and the absolute secure URL is saved.
    * Added fallback to local filesystem storage if credentials are missing to ensure that test environments continue to function seamlessly.
* **Test Verification:**
  * Verified using local model validation suite (`uv run python -m app.test_models`) and endpoints integration test suite (`uv run python -m app.test_endpoints`). All tests passed successfully.
  * Verified that frontend lint and production build suites compile and pass successfully.
