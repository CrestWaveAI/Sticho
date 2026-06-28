import uuid
from typing import Literal
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from app.core.supabase_client import get_supabase
from app.schemas.tailor import TailorDetailResponse, TailorPrivateResponse

router = APIRouter()


class TailorVerificationUpdate(BaseModel):
    status: Literal["approved", "rejected"] = Field(..., description="Verification status")
    rejection_reason: str | None = Field(None, description="Reason for rejection (required if status is rejected)")


@router.get("/tailors/queue", response_model=list[TailorDetailResponse])
async def get_verification_queue(
    sort_by: Literal["created_at_desc", "created_at_asc"] = Query("created_at_desc")
):
    """
    Retrieve all tailor profiles pending verification (verification_status = 'pending').
    Supports sorting by submission date (created_at).
    """
    sb = get_supabase()

    q = sb.table("tailors").select(
        "*, locations(*), services(*, categories(name)), portfolio_images(*)"
    ).eq("verification_status", "pending")

    if sort_by == "created_at_asc":
        q = q.order("created_at", desc=False)
    else:
        q = q.order("created_at", desc=True)

    data = q.execute().data or []

    from app.api.v1.endpoints.tailors import _row_to_detail
    return [_row_to_detail(row) for row in data]


@router.post("/tailors/{tailor_id}/verify", response_model=TailorPrivateResponse)
async def verify_tailor(tailor_id: uuid.UUID, update: TailorVerificationUpdate):
    """
    Approve or reject a tailor profile.
    If approved, sets verification_status to 'approved' and is_verified to True.
    If rejected, sets verification_status to 'rejected', is_verified to False, and saves a rejection reason.
    """
    sb = get_supabase()

    # 1. Fetch current tailor to verify existence
    tailor_data = sb.table("tailors").select("id, name, verification_status").eq("id", str(tailor_id)).execute().data
    if not tailor_data:
        raise HTTPException(status_code=404, detail="Tailor not found")

    # 2. Validation: Rejection reason is required if status is 'rejected'
    if update.status == "rejected" and not (update.rejection_reason and update.rejection_reason.strip()):
        raise HTTPException(status_code=400, detail="Rejection reason is required when status is rejected")

    # 3. Update database
    is_verified = (update.status == "approved")
    rejection_reason = update.rejection_reason if update.status == "rejected" else None

    update_data = {
        "verification_status": update.status,
        "is_verified": is_verified,
        "rejection_reason": rejection_reason
    }

    result = (
        sb.table("tailors")
        .update(update_data)
        .eq("id", str(tailor_id))
        .select("*, locations(*), services(*, categories(name)), portfolio_images(*)")
        .execute()
        .data
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update tailor verification status")

    updated_row = result[0]

    # 4. Mock notification log
    print(
        f"[MOCK NOTIFICATION] Sent verification outcome alert to tailor '{updated_row.get('name')}' "
        f"({updated_row.get('contact_number')}): Status is '{update.status}'."
        + (f" Reason: {rejection_reason}" if rejection_reason else "")
    )

    from app.api.v1.endpoints.tailors import _row_to_detail
    detail_dict = _row_to_detail(updated_row)
    return {
        **detail_dict,
        "contact_number": updated_row.get("contact_number", ""),
        "whatsapp_number": updated_row.get("whatsapp_number"),
        "verification_status": updated_row.get("verification_status", "pending"),
        "rejection_reason": updated_row.get("rejection_reason")
    }
