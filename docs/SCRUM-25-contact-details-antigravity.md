# SCRUM-25: Separate WhatsApp & Call Numbers

This document outlines the details and changes made to resolve task SCRUM-25.

## 1. Jira Scrum Details
* **Title/Summary:** Support Separate WhatsApp & Call Numbers
* **Description:** Update the backend database, SQLAlchemy models, Pydantic schemas, and endpoints mapper to accept, store, and return a separate WhatsApp number (`whatsapp_number`) alongside the existing Call Number (`contact_number`). Ensure `whatsapp_number` follows the contact gating policy (hidden in public searches, unlocked only after lead submission).
* **Assigned To:** Antigravity
* **Date Assigned:** 2026-06-28
* **Date PR Raised:** 2026-06-28

## 2. Implemented Details

### Database Schema Update
- Added the column `whatsapp_number` to `public.tailors`:
  ```sql
  ALTER TABLE public.tailors ADD COLUMN whatsapp_number VARCHAR NULL;
  ```

### SQLAlchemy Model & Schema Updates
- **Model (`app/models/tailor.py`):** Added the `whatsapp_number` field to the `Tailor` class.
- **Schemas (`app/schemas/tailor.py`):**
  - Updated `TailorCreate` to accept optional `whatsapp_number`.
  - Updated `TailorUpdate` to allow editing `whatsapp_number`.
  - Updated `TailorPrivateResponse` to return the unlocked `whatsapp_number`.

### Endpoint & Mapper Changes
- **`app/api/v1/endpoints/tailors.py`:** Update `create_tailor` and `update_tailor_profile` to include `whatsapp_number` in the database inserts/updates and the returned private profile payload.
- **`app/api/v1/endpoints/leads.py`:** Updated `create_lead` to return the unlocked `whatsapp_number` along with `contact_number` upon lead submission.

### Test Verifications
- Updated database seeds in `test_endpoints.py` to include `whatsapp_number`.
- Added assertions to **Test 5** (unlock contact details upon lead submission) and **Test 12** (profile registration) to verify end-to-end mapping and data security.
- Verification commands run successfully:
  - `uv run python -m app.test_models` (Passed)
  - `uv run python -m app.test_endpoints` (Passed)
  - `uv run python -c "from app.main import app; print('FastAPI app loaded successfully')"` (Passed)
  - `npm run lint && npm run build` (Passed)
