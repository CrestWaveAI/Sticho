"""
Tailor search endpoint — uses Supabase REST client (PostgREST) instead of
direct asyncpg connection, which avoids pooler auth issues.
"""
import uuid
import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, File, UploadFile, Form
from pydantic import BaseModel
from typing import Any

from app.core.supabase_client import get_supabase
from app.schemas.tailor import TailorPublicResponse, TailorDetailResponse, TailorPrivateResponse, TailorUpdate
from app.schemas.portfolio import PortfolioImagePositionUpdate

router = APIRouter()


def _row_to_public(row: dict) -> dict:
    """Map a flat Supabase REST row (with nested location/services) to TailorPublicResponse shape."""
    location = row.get("locations") or {}
    services = row.get("services") or []
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row.get("email"),
        "bio": row.get("bio"),
        "address": row["address"],
        "gradient": row.get("gradient"),
        "is_verified": row.get("is_verified", False),
        "rating": float(row.get("rating") or 0),
        "reviews_count": row.get("reviews_count", 0),
        "created_at": row.get("created_at") or datetime.utcnow().isoformat(),
        "location": {
            "id": location.get("id"),
            "name": location.get("name"),
            "city": location.get("city"),
            "pin_code": location.get("pin_code"),
            "created_at": location.get("created_at") or datetime.utcnow().isoformat(),
        } if location else None,
        "services": [
            {
                "id": s["id"],
                "tailor_id": s["tailor_id"],
                "category_id": s["category_id"],
                "price_estimate": s.get("price_estimate"),
                "time_estimate_days": s.get("time_estimate_days"),
                "description": s.get("description"),
                "created_at": s.get("created_at") or datetime.utcnow().isoformat(),
                "category": {
                    "id": s["category_id"],
                    "name": s["categories"]["name"],
                    "description": s["categories"].get("description"),
                    "created_at": s["categories"].get("created_at") or datetime.utcnow().isoformat(),
                } if s.get("categories") else None
            }
            for s in services
        ]
    }


@router.get("", response_model=list[TailorPublicResponse])
async def search_tailors(
    locality: str | None = Query(None),
    city: str | None = Query(None),
    pin_code: str | None = Query(None),
    category: str | None = Query(None),
):
    sb = get_supabase()

    # Fetch tailors with nested location and services→category
    q = sb.table("tailors").select(
        "*, locations(*), services(*, categories(name))"
    ).eq("is_verified", True)

    data = q.execute().data or []

    # Post-filter by location fields (PostgREST doesn't support nested ilike easily)
    results = []
    for row in data:
        loc = row.get("locations") or {}
        if locality and locality.lower() not in (loc.get("name") or "").lower():
            continue
        if city and city.lower() not in (loc.get("city") or "").lower():
            continue
        if pin_code and pin_code != (loc.get("pin_code") or ""):
            continue
        if category:
            cats = [
                s["categories"]["name"].lower()
                for s in (row.get("services") or [])
                if s.get("categories")
            ]
            if not any(category.lower() in c for c in cats):
                continue
        results.append(_row_to_public(row))

    return results


@router.get("/{tailor_id}", response_model=TailorDetailResponse)
async def get_tailor_detail(tailor_id: uuid.UUID):
    sb = get_supabase()
    data = (
        sb.table("tailors")
        .select("*, locations(*), services(*, categories(name))")
        .eq("id", str(tailor_id))
        .execute()
        .data
    )
    if not data:
        raise HTTPException(status_code=404, detail="Tailor not found")
    return _row_to_public(data[0])


@router.put("/{tailor_id}", response_model=TailorPrivateResponse)
async def update_tailor_profile(tailor_id: uuid.UUID, tailor_update: TailorUpdate):
    sb = get_supabase()
    update_data = tailor_update.model_dump(exclude_unset=True)
    if "location_id" in update_data and update_data["location_id"]:
        update_data["location_id"] = str(update_data["location_id"])

    result = (
        sb.table("tailors")
        .update(update_data)
        .eq("id", str(tailor_id))
        .select("*, locations(*), services(*, categories(name))")
        .execute()
        .data
    )
    if not result:
        raise HTTPException(status_code=404, detail="Tailor not found")
    row = result[0]
    return {**_row_to_public(row), "contact_number": row.get("contact_number", "")}


@router.post("/{tailor_id}/portfolio")
async def add_portfolio_metadata(tailor_id: uuid.UUID, image_data: dict):
    sb = get_supabase()
    # 1. Check tailor exists
    tailor = sb.table("tailors").select("id").eq("id", str(tailor_id)).execute().data
    if not tailor:
        raise HTTPException(status_code=404, detail="Tailor not found")
        
    # 2. Count images
    images = sb.table("portfolio_images").select("id").eq("tailor_id", str(tailor_id)).execute().data or []
    if len(images) >= 20:
        raise HTTPException(status_code=400, detail="Maximum limit of 20 portfolio images reached.")
        
    # 3. Insert metadata
    new_img = {
        "id": str(uuid.uuid4()),
        "tailor_id": str(tailor_id),
        "image_url": image_data["image_url"],
        "caption": image_data.get("caption"),
        "position": image_data.get("position", len(images)),
        "created_at": datetime.utcnow().isoformat()
    }
    result = sb.table("portfolio_images").insert(new_img).execute().data
    if not result:
        raise HTTPException(status_code=500, detail="Failed to add portfolio metadata")
    return result[0]


@router.post("/{tailor_id}/portfolio/upload")
async def upload_portfolio_image(
    tailor_id: uuid.UUID,
    file: UploadFile = File(...),
    caption: str | None = Form(None),
):
    sb = get_supabase()
    # 1. Check tailor exists
    tailor = sb.table("tailors").select("id").eq("id", str(tailor_id)).execute().data
    if not tailor:
        raise HTTPException(status_code=404, detail="Tailor not found")

    # 2. File type check
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Unsupported file type. Only JPEG, PNG, and WEBP are allowed.")

    # 3. File size check (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 5MB limit.")
    await file.seek(0)

    # 4. Count images
    images = sb.table("portfolio_images").select("id").eq("tailor_id", str(tailor_id)).execute().data or []
    if len(images) >= 20:
        raise HTTPException(status_code=400, detail="Maximum limit of 20 portfolio images reached.")

    # 5. Save locally as fallback (mimicking CDN in local development)
    filename = f"{uuid.uuid4()}_{file.filename}"
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
    absolute_path = os.path.join(base_dir, "static", "media", filename)
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
    with open(absolute_path, "wb") as f:
        f.write(contents)
    
    image_url = f"/static/media/{filename}"

    new_img = {
        "id": str(uuid.uuid4()),
        "tailor_id": str(tailor_id),
        "image_url": image_url,
        "caption": caption,
        "position": len(images),
        "created_at": datetime.utcnow().isoformat()
    }
    result = sb.table("portfolio_images").insert(new_img).execute().data
    if not result:
        raise HTTPException(status_code=500, detail="Failed to save portfolio image")
    return result[0]


@router.put("/{tailor_id}/portfolio/reorder")
async def reorder_portfolio(tailor_id: uuid.UUID, positions: list[PortfolioImagePositionUpdate]):
    sb = get_supabase()
    # 1. Verify tailor exists
    tailor = sb.table("tailors").select("id").eq("id", str(tailor_id)).execute().data
    if not tailor:
        raise HTTPException(status_code=404, detail="Tailor not found")

    # Update positions
    for update in positions:
        sb.table("portfolio_images").update({"position": update.position}).eq("id", str(update.id)).eq("tailor_id", str(tailor_id)).execute()

    return {"message": "Portfolio order updated successfully."}


@router.delete("/{tailor_id}/portfolio/{image_id}")
async def delete_portfolio_image(tailor_id: uuid.UUID, image_id: uuid.UUID):
    sb = get_supabase()
    # 1. Get image metadata
    img_data = sb.table("portfolio_images").select("*").eq("id", str(image_id)).eq("tailor_id", str(tailor_id)).execute().data
    if not img_data:
        raise HTTPException(status_code=404, detail="Portfolio image not found")
    
    image = img_data[0]
    if image.get("image_url", "").startswith("/static/media/"):
        filename = image["image_url"].replace("/static/media/", "")
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
        absolute_path = os.path.join(base_dir, "static", "media", filename)
        if os.path.exists(absolute_path):
            try:
                os.remove(absolute_path)
            except Exception:
                pass

    # 2. Delete from database
    sb.table("portfolio_images").delete().eq("id", str(image_id)).eq("tailor_id", str(tailor_id)).execute()
    return {"message": "Portfolio image deleted successfully."}
