"""
Tailor search endpoint — uses Supabase REST client (PostgREST) instead of
direct asyncpg connection, which avoids pooler auth issues.
"""
import uuid
import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, File, UploadFile, Form, Depends, BackgroundTasks, Header
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from app.core.security import verify_token
from pydantic import BaseModel
from typing import Any

from app.core.supabase_client import get_supabase
from app.schemas.tailor import TailorPublicResponse, TailorDetailResponse, TailorPrivateResponse, TailorUpdate, TailorCreate
from app.schemas.portfolio import PortfolioImagePositionUpdate

import cloudinary
import cloudinary.uploader

# Configure Cloudinary if credentials are provided in the environment
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True
    )

router = APIRouter()


def _row_to_public(row: dict) -> dict:
    """Map a flat Supabase REST row (with nested location/services) to TailorPublicResponse shape."""
    location = row.get("locations")
    if not location:
        location = {
            "id": "00000000-0000-0000-0000-000000000000",
            "name": "N/A",
            "city": "N/A",
            "pin_code": "",
            "created_at": datetime.utcnow().isoformat()
        }
    services = row.get("services") or []
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row.get("email"),
        "bio": row.get("bio"),
        "address": row["address"],
        "gradient": row.get("gradient"),
        "is_verified": row.get("is_verified", False),
        "verification_status": row.get("verification_status", "pending"),
        "rejection_reason": row.get("rejection_reason"),
        "rating": float(row.get("rating") or 0),
        "reviews_count": row.get("reviews_count", 0),
        "created_at": row.get("created_at") or datetime.utcnow().isoformat(),
        "notifications_enabled": row.get("notifications_enabled", True),
        "notification_channel": row.get("notification_channel", "whatsapp"),
        "location": {
            "id": location.get("id"),
            "name": location.get("name"),
            "city": location.get("city"),
            "pin_code": location.get("pin_code"),
            "created_at": location.get("created_at") or datetime.utcnow().isoformat(),
        },
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


def _row_to_detail(row: dict) -> dict:
    """Map a flat Supabase REST row (with nested location, services, and portfolio) to TailorDetailResponse shape."""
    public_dict = _row_to_public(row)
    
    # Portfolio Images
    portfolio_images = row.get("portfolio_images") or []
    # Sort by position
    sorted_images = sorted(portfolio_images, key=lambda x: x.get("position", 0))
    
    return {
        **public_dict,
        "experience": row.get("experience"),
        "latitude": float(row["latitude"]) if row.get("latitude") is not None else None,
        "longitude": float(row["longitude"]) if row.get("longitude") is not None else None,
        "working_hours": row.get("working_hours"),
        "portfolio_images": [
            {
                "id": img["id"],
                "tailor_id": img["tailor_id"],
                "image_url": img["image_url"],
                "caption": img.get("caption"),
                "position": img.get("position", 0),
                "created_at": img.get("created_at") or datetime.utcnow().isoformat()
            }
            for img in sorted_images
        ]
    }


@router.get("", response_model=list[TailorPublicResponse])
async def search_tailors(
    locality: str | None = Query(None),
    city: str | None = Query(None),
    pin_code: str | None = Query(None),
    category: list[str] | None = Query(None),
):
    sb = get_supabase()

    # Fetch tailors with nested location and services→category
    q = sb.table("tailors").select(
        "*, locations(*), services(*, categories(name))"
    ).eq("is_verified", True)

    data = q.execute().data or []

    # Handle string or list of categories for flexibility/compatibility
    category_list = []
    if category:
        if isinstance(category, str):
            category_list = [category]
        else:
            category_list = list(category)

    # Post-filter by location fields (PostgREST doesn't support nested ilike easily)
    results = []
    for row in data:
        loc = row.get("locations") or {}
        if locality:
            loc_name = (loc.get("name") or "").lower()
            query_loc = locality.lower()
            if query_loc not in loc_name and loc_name not in query_loc:
                continue
        if city:
            loc_city = (loc.get("city") or "").lower()
            query_city = city.lower()
            if query_city not in loc_city and loc_city not in query_city:
                continue
        if pin_code and pin_code != (loc.get("pin_code") or ""):
            continue
        if category_list:
            cats = [
                s["categories"]["name"].lower()
                for s in (row.get("services") or [])
                if s.get("categories")
            ]
            # Match if any of the query categories match any of the tailor's categories
            match_found = False
            for q_cat in category_list:
                if any(q_cat.lower() in c for c in cats):
                    match_found = True
                    break
            if not match_found:
                continue
        results.append(_row_to_public(row))

    return results

@router.post("", response_model=TailorPrivateResponse)
async def create_tailor(tailor_in: TailorCreate):
    """
    Register a new tailor profile.
    Checks that the email and phone number (if provided) are not registered.
    If the email is already registered, and it's an account created during signup,
    we update/enrich the existing record with the onboarding profile details.
    """
    sb = get_supabase()
    
    # 1. Check if email is already registered
    existing_tailors = sb.table("tailors").select("*").eq("email", tailor_in.email).execute().data
    if existing_tailors:
        existing_tailor = existing_tailors[0]
        # If the account exists but has not completed profile setup/onboarding yet,
        # we update and enrich the record instead of raising an error.
        if not existing_tailor.get("bio") or not existing_tailor.get("address"):
            update_data = {
                "name": tailor_in.name,
                "bio": tailor_in.bio,
                "address": tailor_in.address,
                "gradient": tailor_in.gradient or existing_tailor.get("gradient"),
                "whatsapp_number": tailor_in.whatsapp_number or existing_tailor.get("whatsapp_number"),
                "location_id": str(tailor_in.location_id) if tailor_in.location_id else existing_tailor.get("location_id"),
            }
            if tailor_in.contact_number:
                # Check if phone number is already registered under a different tailor
                if tailor_in.contact_number != existing_tailor.get("contact_number"):
                    phone_exists = sb.table("tailors").select("id").eq("contact_number", tailor_in.contact_number).execute().data
                    if phone_exists:
                        raise HTTPException(status_code=400, detail="Phone number already registered")
                update_data["contact_number"] = tailor_in.contact_number
                
            result = (
                sb.table("tailors")
                .update(update_data)
                .eq("id", existing_tailor["id"])
                .select("*, locations(*)")
                .execute()
                .data
            )
            if not result:
                raise HTTPException(status_code=500, detail="Failed to update tailor profile")
            row = result[0]
            row["services"] = []
            row["portfolio_images"] = []
            detail_dict = _row_to_detail(row)
            return {
                **detail_dict,
                "contact_number": row.get("contact_number", ""),
                "whatsapp_number": row.get("whatsapp_number")
            }
        else:
            raise HTTPException(status_code=400, detail="Email already registered")
            
    # 2. Check if phone number is already registered under any tailor (if provided)
    if tailor_in.contact_number:
        tailors = sb.table("tailors").select("id").eq("contact_number", tailor_in.contact_number).execute().data
        if tailors:
            raise HTTPException(status_code=400, detail="Phone number already registered")
        
    # 3. Create the tailor profile (default is_verified = False)
    tailor_id = str(uuid.uuid4())
    new_tailor = {
        "id": tailor_id,
        "name": tailor_in.name,
        "email": tailor_in.email,
        "bio": tailor_in.bio,
        "address": tailor_in.address,
        "gradient": tailor_in.gradient,
        "contact_number": tailor_in.contact_number,
        "whatsapp_number": tailor_in.whatsapp_number,
        "location_id": str(tailor_in.location_id) if tailor_in.location_id else None,
        "is_verified": False,
        "verification_status": "pending",
        "rejection_reason": None,
        "rating": 0.0,
        "reviews_count": 0,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = (
        sb.table("tailors")
        .insert(new_tailor)
        .select("*, locations(*)")
        .execute()
        .data
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create tailor profile")
        
    row = result[0]
    # Add empty services and portfolio images list to populate detailed view
    row["services"] = []
    row["portfolio_images"] = []
    detail_dict = _row_to_detail(row)
    return {
        **detail_dict,
        "contact_number": row.get("contact_number", ""),
        "whatsapp_number": row.get("whatsapp_number")
    }

@router.get("/{tailor_id}", response_model=TailorDetailResponse)
async def get_tailor_detail(
    tailor_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    authorization: str | None = Header(None)
):
    sb = get_supabase()
    
    # Allow fetching the profile details of unverified tailors only if the request
    # carries a valid Bearer token that matches the target tailor_id.
    # The Referer header is NOT used as it is trivially spoofable.
    is_authorized = False
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = verify_token(token)
        if payload and payload.get("tailor_id") == str(tailor_id):
            is_authorized = True
        
    query = (
        sb.table("tailors")
        .select("*, locations(*), services(*, categories(name)), portfolio_images(*)")
        .eq("id", str(tailor_id))
    )
    
    if not is_authorized:
        query = query.eq("is_verified", True)
        
    data = query.execute().data
    if not data:
        raise HTTPException(status_code=404, detail="Tailor not found")
    
    from app.services.notification import NotificationService
    background_tasks.add_task(NotificationService.notify_event, data[0], "profile_view")
    
    detail_dict = _row_to_detail(data[0])
    
    if is_authorized:
        private_data = {
            **detail_dict,
            "contact_number": data[0].get("contact_number", ""),
            "whatsapp_number": data[0].get("whatsapp_number")
        }
        return JSONResponse(content=jsonable_encoder(TailorPrivateResponse(**private_data)))
        
    return JSONResponse(content=jsonable_encoder(TailorDetailResponse(**detail_dict)))


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
        .select("*, locations(*), services(*, categories(name)), portfolio_images(*)")
        .execute()
        .data
    )
    if not result:
        raise HTTPException(status_code=404, detail="Tailor not found")
    row = result[0]
    detail_dict = _row_to_detail(row)
    return {
        **detail_dict,
        "contact_number": row.get("contact_number", ""),
        "whatsapp_number": row.get("whatsapp_number")
    }


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

    # 5. Save to Cloudinary CDN (or local fallback)
    if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
        try:
            upload_result = cloudinary.uploader.upload(
                contents,
                folder=f"tailors/{tailor_id}/portfolio",
                public_id=f"img_{uuid.uuid4().hex}"
            )
            image_url = upload_result.get("secure_url")
            if not image_url:
                raise Exception("Missing secure_url in Cloudinary response")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Cloudinary upload failed: {str(e)}"
            )
    else:
        # Fallback local file system handler (mimicking CDN/Cloudinary locally)
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

from app.core.security import get_current_tailor_id
from pydantic import Field

class ClickTrackingRequest(BaseModel):
    type: str = Field(..., description="Click type: 'whatsapp' or 'call'")

@router.post("/{tailor_id}/track-click")
async def track_click(
    tailor_id: uuid.UUID, 
    payload: ClickTrackingRequest,
    background_tasks: BackgroundTasks
):
    """
    Increment Call or WhatsApp click count for a tailor boutique.
    """
    sb = get_supabase()
    tailor_id_str = str(tailor_id)
    
    # 1. Fetch current clicks and settings
    tailor_data = sb.table("tailors").select("*").eq("id", tailor_id_str).execute().data
    if not tailor_data:
        raise HTTPException(status_code=404, detail="Tailor not found")
        
    tailor = tailor_data[0]
    
    # 2. Update clicks based on type
    if payload.type == "whatsapp":
        new_val = tailor.get("whatsapp_clicks", 0) + 1
        sb.table("tailors").update({"whatsapp_clicks": new_val}).eq("id", tailor_id_str).execute()
    elif payload.type == "call":
        new_val = tailor.get("call_clicks", 0) + 1
        sb.table("tailors").update({"call_clicks": new_val}).eq("id", tailor_id_str).execute()
    else:
        raise HTTPException(status_code=400, detail="Invalid click type. Must be 'whatsapp' or 'call'")
        
    # 3. Trigger background notification
    from app.services.notification import NotificationService
    background_tasks.add_task(
        NotificationService.notify_event, 
        tailor, 
        "contact_click", 
        payload.type
    )
        
    return {"message": "Click tracked successfully."}

@router.get("/{tailor_id}/dashboard")
async def get_tailor_dashboard(
    tailor_id: uuid.UUID,
    current_tailor_id: str = Depends(get_current_tailor_id)
):
    """
    Retrieve statistics, clicks, profile completeness, and recent leads for a tailor.
    """
    sb = get_supabase()
    tailor_id_str = str(tailor_id)
    
    if tailor_id_str.replace("-", "") != current_tailor_id.replace("-", ""):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this dashboard"
        )
        
    # 1. Fetch tailor details
    tailor_data = sb.table("tailors").select("*").eq("id", tailor_id_str).execute().data
    if not tailor_data:
        raise HTTPException(status_code=404, detail="Tailor not found")
        
    tailor = tailor_data[0]
    
    # 2. Fetch leads count & recent leads
    leads = sb.table("leads").select("*").eq("tailor_id", tailor_id_str).order("created_at", desc=True).execute().data or []
    lead_count = len(leads)
    recent_leads = leads[:5]
    
    # 3. Calculate profile completeness ratio
    # Name (10%), Email (10%), Bio (20%), Address (20%), Contact (10%), WhatsApp (10%), Location (10%), Experience (10%)
    fields = [
        ("name", 10),
        ("email", 10),
        ("bio", 20),
        ("address", 20),
        ("contact_number", 10),
        ("whatsapp_number", 10),
        ("location_id", 10),
        ("experience", 10)
    ]
    completeness = 0
    missing_fields = []
    
    for f, weight in fields:
        val = tailor.get(f)
        if val is not None and str(val).strip() != "":
            completeness += weight
        else:
            missing_fields.append(f)
            
    approval_status = "approved" if tailor.get("is_verified") else "pending"
    
    return {
        "approval_status": approval_status,
        "lead_count": lead_count,
        "whatsapp_clicks": tailor.get("whatsapp_clicks", 0),
        "call_clicks": tailor.get("call_clicks", 0),
        "completeness_percentage": completeness,
        "missing_fields": missing_fields,
        "recent_leads": recent_leads
    }
