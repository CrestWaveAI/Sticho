import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.db import get_db
from app.models.service import Service
from app.models.tailor import Tailor
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceDetailResponse, ServiceBase

router = APIRouter()

@router.post("", response_model=ServiceResponse)
async def create_service(
    service_in: ServiceCreate,
    db: AsyncSession = Depends(get_db),
):
    # Verify tailor exists
    tailor_query = select(Tailor).where(Tailor.id == service_in.tailor_id)
    tailor_result = await db.execute(tailor_query)
    if not tailor_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Tailor not found")

    db_service = Service(
        id=uuid.uuid4(),
        tailor_id=service_in.tailor_id,
        category_id=service_in.category_id,
        price_estimate=service_in.price_estimate,
        time_estimate_days=service_in.time_estimate_days,
        description=service_in.description,
        created_at=datetime.utcnow()
    )
    db.add(db_service)
    await db.flush()
    return db_service


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: uuid.UUID,
    service_update: ServiceBase,
    db: AsyncSession = Depends(get_db),
):
    query = select(Service).where(Service.id == service_id)
    result = await db.execute(query)
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    update_data = service_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(service, key, value)

    db.add(service)
    await db.flush()
    return service


@router.delete("/{service_id}")
async def delete_service(
    service_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    query = select(Service).where(Service.id == service_id)
    result = await db.execute(query)
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    await db.delete(service)
    await db.flush()
    return {"message": "Service deleted successfully."}


@router.get("/tailor/{tailor_id}", response_model=list[ServiceDetailResponse])
async def get_tailor_services(
    tailor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    # Verify tailor exists
    tailor_query = select(Tailor).where(Tailor.id == tailor_id)
    tailor_result = await db.execute(tailor_query)
    if not tailor_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Tailor not found")

    query = select(Service).where(Service.tailor_id == tailor_id).options(
        selectinload(Service.category)
    )
    result = await db.execute(query)
    services = result.scalars().all()
    return services
