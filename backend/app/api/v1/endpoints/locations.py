import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.location import Location
from app.schemas.location import LocationResponse

router = APIRouter()

@router.get("/autocomplete", response_model=list[LocationResponse])
async def autocomplete_locations(
    q: str = Query(..., min_length=2, description="Search term for locality name, city, or pin code"),
    db: AsyncSession = Depends(get_db),
):
    """
    Search cities, localities, or pin codes for auto-completion.
    Limits results to 10.
    """
    query = select(Location).where(
        or_(
            Location.name.ilike(f"%{q}%"),
            Location.city.ilike(f"%{q}%"),
            Location.pin_code.ilike(f"%{q}%")
        )
    ).limit(10)
    
    result = await db.execute(query)
    locations = result.scalars().all()
    return locations
