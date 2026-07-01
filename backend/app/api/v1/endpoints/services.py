import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.supabase_client import get_supabase
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceDetailResponse, ServiceBase
from app.core.security import get_current_tailor_id

router = APIRouter()

@router.post("", response_model=ServiceResponse)
async def create_service(
    service_in: ServiceCreate,
    current_tailor_id: str = Depends(get_current_tailor_id)
):
    """
    Create a new service listing for a tailor boutique.
    """
    sb = get_supabase()
    
    if str(service_in.tailor_id).replace("-", "") != current_tailor_id.replace("-", ""):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this tailor profile"
        )
        
    # 1. Verify tailor exists
    tailor_exists = sb.table("tailors").select("id").eq("id", str(service_in.tailor_id)).execute().data
    if not tailor_exists:
        raise HTTPException(status_code=404, detail="Tailor not found")
        
    # 2. Insert service
    service_id = str(uuid.uuid4())
    new_service = {
        "id": service_id,
        "tailor_id": str(service_in.tailor_id),
        "category_id": str(service_in.category_id),
        "price_estimate": str(service_in.price_estimate) if service_in.price_estimate is not None else None,
        "time_estimate_days": service_in.time_estimate_days,
        "description": service_in.description,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = sb.table("services").insert(new_service).execute().data
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create service")
        
    return result[0]


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: uuid.UUID,
    service_update: ServiceBase,
    current_tailor_id: str = Depends(get_current_tailor_id)
):
    """
    Edit service estimates/description.
    """
    sb = get_supabase()
    
    # 1. Check if service exists
    existing = sb.table("services").select("*").eq("id", str(service_id)).execute().data
    if not existing:
        raise HTTPException(status_code=404, detail="Service not found")
        
    service = existing[0]
    if service.get("tailor_id", "").replace("-", "") != current_tailor_id.replace("-", ""):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this service"
        )
        
    # 2. Update service
    update_data = service_update.model_dump(exclude_unset=True)
    if "category_id" in update_data and update_data["category_id"]:
        update_data["category_id"] = str(update_data["category_id"])
    if "price_estimate" in update_data and update_data["price_estimate"] is not None:
        update_data["price_estimate"] = str(update_data["price_estimate"])
        
    result = sb.table("services").update(update_data).eq("id", str(service_id)).execute().data
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update service")
        
    return result[0]


@router.delete("/{service_id}")
async def delete_service(
    service_id: uuid.UUID,
    current_tailor_id: str = Depends(get_current_tailor_id)
):
    """
    Delete a service listing.
    """
    sb = get_supabase()
    
    # 1. Check if service exists
    existing = sb.table("services").select("*").eq("id", str(service_id)).execute().data
    if not existing:
        raise HTTPException(status_code=404, detail="Service not found")
        
    service = existing[0]
    if service.get("tailor_id", "").replace("-", "") != current_tailor_id.replace("-", ""):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this service"
        )
        
    # 2. Delete service
    sb.table("services").delete().eq("id", str(service_id)).execute()
    return {"message": "Service deleted successfully."}


@router.get("/tailor/{tailor_id}", response_model=list[ServiceDetailResponse])
async def get_tailor_services(tailor_id: uuid.UUID):
    """
    Retrieve all services for a specific tailor boutique.
    """
    sb = get_supabase()
    
    # 1. Verify tailor exists
    tailor_exists = sb.table("tailors").select("id").eq("id", str(tailor_id)).execute().data
    if not tailor_exists:
        raise HTTPException(status_code=404, detail="Tailor not found")
        
    # 2. Fetch services with categories
    result = (
        sb.table("services")
        .select("*, categories(*)")
        .eq("tailor_id", str(tailor_id))
        .execute()
        .data
    )
    
    services = []
    for row in result:
        category = row.get("categories") or {}
        services.append({
            "id": row["id"],
            "tailor_id": row["tailor_id"],
            "category_id": row["category_id"],
            "price_estimate": row.get("price_estimate"),
            "time_estimate_days": row.get("time_estimate_days"),
            "description": row.get("description"),
            "created_at": row.get("created_at") or datetime.utcnow().isoformat(),
            "category": {
                "id": category.get("id"),
                "name": category.get("name"),
                "description": category.get("description"),
                "created_at": category.get("created_at") or datetime.utcnow().isoformat()
            } if category else None
        })
        
    return services
