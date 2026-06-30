# Backend Feature Request: Support Separate WhatsApp & Call Numbers (SCRUM-25)

**Assignees/Mentions:** @amankumar006, @musharraf

## Problem
In **SCRUM-25 (Add Contact Details)**, the business requirements dictate that tailors must be able to specify both a **WhatsApp Number** and a **Call Number**.
Currently, the database table `public.tailors` and the Pydantic schemas only support a single field: `contact_number`.

To support the frontend layout and enable customers to contact tailors via WhatsApp and Direct Call independently, the backend needs to store both fields.

---

## Required Changes

### 1. Database Schema Update
Add a new column `whatsapp_number` to the `public.tailors` table:
```sql
ALTER TABLE public.tailors ADD COLUMN whatsapp_number VARCHAR NULL;
```
*Note: Make sure to apply this change to the Supabase migration script.*

### 2. SQLAlchemy Model Update (`backend/app/models/tailor.py`)
Add the `whatsapp_number` field to the `Tailor` model:
```python
class Tailor(Base):
    # ...
    contact_number: Mapped[str] = mapped_column(String, nullable=False) # Call Number
    whatsapp_number: Mapped[str | None] = mapped_column(String, nullable=True) # WhatsApp Number
    # ...
```

### 3. Pydantic Schemas (`backend/app/schemas/tailor.py`)
Update schemas to accept and return `whatsapp_number`:
* **`TailorBase`**: Add `whatsapp_number: str | None = Field(None, description="WhatsApp number of the tailor boutique")`
* **`TailorPrivateResponse`**: Add `whatsapp_number: str | None = Field(None, description="WhatsApp number (unlocked)")`
* **`TailorUpdate`**: Add `whatsapp_number: str | None = Field(None, description="WhatsApp number of the tailor")`

### 4. API Endpoints Mapper (`backend/app/api/v1/endpoints/tailors.py`)
Update mapper functions `_row_to_public` and `_row_to_detail` to map the new database column:
```python
def _row_to_public(row: dict) -> dict:
    return {
        # ...
        "contact_number": row.get("contact_number"),
        "whatsapp_number": row.get("whatsapp_number"),
        # ...
    }
```

---

## Current Status (Workaround implemented in Frontend)
The frontend branch `feature/frontend-contact-details-SCRUM-25` has been updated to collect, validate, and display both fields. Currently, for updates, it saves the Call Number to `contact_number` and falls back to displaying the Call Number as the WhatsApp number if `whatsapp_number` is not returned by the API.

Please implement these backend changes and notify us so we can wire the frontend to use the new `whatsapp_number` field directly.
