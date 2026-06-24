import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.db import get_db
from app.models.lead import Lead
from app.models.tailor import Tailor
from app.models.service import Service
from app.schemas.lead import LeadCreate
from app.schemas.tailor import TailorPrivateResponse

router = APIRouter()

@router.post("", response_model=TailorPrivateResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead_in: LeadCreate,
    db: AsyncSession = Depends(get_db),
):
    # 1. Verify if tailor exists
    tailor_query = select(Tailor).where(Tailor.id == lead_in.tailor_id).options(
        selectinload(Tailor.location),
        selectinload(Tailor.services).selectinload(Service.category)
    )
    result = await db.execute(tailor_query)
    tailor = result.scalar_one_or_none()
    
    if not tailor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tailor with ID {lead_in.tailor_id} not found"
        )
        
    # 2. Create the lead
    lead = Lead(
        tailor_id=lead_in.tailor_id,
        customer_name=lead_in.customer_name,
        customer_mobile=lead_in.customer_mobile,
        requirement_description=lead_in.requirement_description,
    )
    db.add(lead)
    await db.flush() # Flush to populate ID and validate constraints
    
    # 3. Return the private tailor profile response (which includes contact_number)
    return tailor
