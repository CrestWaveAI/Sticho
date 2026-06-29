"""
Lead capture endpoint — uses Supabase REST client.
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, BackgroundTasks

from app.core.supabase_client import get_supabase
from app.schemas.lead import LeadCreate
from app.schemas.tailor import TailorPrivateResponse

router = APIRouter()


@router.post("", response_model=TailorPrivateResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(lead_in: LeadCreate, background_tasks: BackgroundTasks):
    sb = get_supabase()

    # 1. Verify tailor exists and fetch full profile
    tailor_data = (
        sb.table("tailors")
        .select("*, locations(*), services(*, categories(name)), portfolio_images(*)")
        .eq("id", str(lead_in.tailor_id))
        .execute()
        .data
    )
    if not tailor_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tailor with ID {lead_in.tailor_id} not found",
        )

    tailor_row = tailor_data[0]

    # 2. Insert the lead
    sb.table("leads").insert({
        "id": str(uuid.uuid4()),
        "tailor_id": str(lead_in.tailor_id),
        "customer_name": lead_in.customer_name,
        "customer_mobile": lead_in.customer_mobile,
        "requirement_description": lead_in.requirement_description,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    # 3. Trigger background notification
    from app.services.notification import NotificationService
    background_tasks.add_task(
        NotificationService.notify_event,
        tailor_row,
        "lead_submission",
        lead_in.requirement_description
    )

    # 4. Return private tailor profile (includes contact_number)
    from app.api.v1.endpoints.tailors import _row_to_detail
    detail_dict = _row_to_detail(tailor_row)
    return {
        **detail_dict,
        "contact_number": tailor_row.get("contact_number", ""),
        "whatsapp_number": tailor_row.get("whatsapp_number")
    }
