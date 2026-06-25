"""
Locations autocomplete endpoint — uses Supabase REST client.
"""
from fastapi import APIRouter, Query, HTTPException
from app.core.supabase_client import get_supabase
from app.schemas.location import LocationResponse

router = APIRouter()


@router.get("/autocomplete", response_model=list[LocationResponse])
async def autocomplete_locations(
    q: str = Query(..., min_length=2, description="Search term for locality, city, or pin code"),
):
    """
    Returns up to 10 locations matching the query across name, city, or pin_code.
    """
    sb = get_supabase()

    # PostgREST: use `or` filter with ilike (wrapped in double quotes to handle commas)
    data = (
        sb.table("locations")
        .select("*")
        .or_(f'name.ilike."%{q}%",city.ilike."%{q}%",pin_code.ilike."%{q}%"')
        .limit(10)
        .execute()
        .data
    ) or []

    return data
