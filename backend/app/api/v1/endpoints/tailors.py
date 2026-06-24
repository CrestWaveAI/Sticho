import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.db import get_db
from app.models.tailor import Tailor
from app.models.location import Location
from app.models.service import Service
from app.models.category import Category
from app.schemas.tailor import TailorPublicResponse, TailorDetailResponse

router = APIRouter()

@router.get("", response_model=list[TailorPublicResponse])
async def search_tailors(
    locality: str | None = Query(None, description="Filter by locality or area name"),
    city: str | None = Query(None, description="Filter by city name"),
    pin_code: str | None = Query(None, description="Filter by pin code"),
    category: str | None = Query(None, description="Filter by category specialization"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Tailor)
    
    # If location filters are applied, join Location
    if locality or city or pin_code:
        query = query.join(Tailor.location)
        if locality:
            query = query.where(Location.name.ilike(f"%{locality}%"))
        if city:
            query = query.where(Location.city.ilike(f"%{city}%"))
        if pin_code:
            query = query.where(Location.pin_code == pin_code)
            
    # If category filter is applied, join services and categories
    if category:
        query = query.join(Tailor.services).join(Service.category)
        query = query.where(Category.name.ilike(f"%{category}%"))
        
    # Eagerly load the location and services -> category relationships for computed fields and nested models
    query = query.options(
        selectinload(Tailor.location),
        selectinload(Tailor.services).selectinload(Service.category)
    )
    
    result = await db.execute(query)
    # Use scalars().unique() because we might have duplicate tailors if joined on services/categories
    tailors = result.scalars().unique().all()
    return tailors


@router.get("/{tailor_id}", response_model=TailorDetailResponse)
async def get_tailor_detail(
    tailor_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    query = select(Tailor).where(Tailor.id == tailor_id).options(
        selectinload(Tailor.location),
        selectinload(Tailor.services).selectinload(Service.category)
    )
    result = await db.execute(query)
    tailor = result.scalar_one_or_none()
    
    if not tailor:
        raise HTTPException(status_code=404, detail="Tailor not found")
        
    return tailor
