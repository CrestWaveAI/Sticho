from fastapi import APIRouter
from app.core.supabase_client import get_supabase
from app.schemas.category import CategoryResponse

router = APIRouter()

@router.get("", response_model=list[CategoryResponse])
async def list_categories():
    """
    Retrieve all service categories.
    """
    sb = get_supabase()
    data = sb.table("categories").select("*").execute().data or []
    return data
