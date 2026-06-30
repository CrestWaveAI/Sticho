import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from app.core.supabase_client import get_supabase
from app.schemas.review import ReviewCreate, ReviewResponse
from app.core.security import get_current_customer_id

router = APIRouter()

async def recalculate_tailor_rating(sb, tailor_id: str):
    """
    Recalculate average rating and reviews count for a tailor.
    """
    reviews = sb.table("reviews").select("rating").eq("tailor_id", tailor_id).eq("status", "approved").execute().data
    if reviews:
        count = len(reviews)
        total_rating = sum(r["rating"] for r in reviews)
        avg_rating = round(total_rating / count, 1)
    else:
        count = 0
        avg_rating = 0.0
    
    sb.table("tailors").update({
        "rating": avg_rating,
        "reviews_count": count
    }).eq("id", tailor_id).execute()

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(
    payload: ReviewCreate,
    customer_id: str = Depends(get_current_customer_id)
):
    """
    Submit a star rating and comment for a tailor boutique.
    Checks for duplicate reviews and updates the tailor's aggregate rating.
    """
    sb = get_supabase()
    tailor_id_str = str(payload.tailor_id)
    
    # 1. Verify tailor exists
    tailor_exists = sb.table("tailors").select("id").eq("id", tailor_id_str).execute().data
    if not tailor_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tailor with ID {payload.tailor_id} not found"
        )
        
    # 2. Check for duplicate review by this customer for this tailor
    existing = (
        sb.table("reviews")
        .select("id")
        .eq("customer_id", customer_id)
        .eq("tailor_id", tailor_id_str)
        .execute()
        .data
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this tailor boutique"
        )
        
    # 3. Fetch customer details to get name for response
    customer_data = sb.table("customers").select("name").eq("id", customer_id).execute().data
    customer_name = customer_data[0]["name"] if customer_data else "Anonymous"
    
    # 4. Insert review
    review_id = str(uuid.uuid4())
    new_review = {
        "id": review_id,
        "tailor_id": tailor_id_str,
        "customer_id": customer_id,
        "rating": payload.rating,
        "comment": payload.comment,
        "status": "approved",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = sb.table("reviews").insert(new_review).execute().data
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit review"
        )
        
    # 5. Recalculate tailor ratings
    await recalculate_tailor_rating(sb, tailor_id_str)
    
    return {
        **new_review,
        "customer_name": customer_name
    }

@router.get("/tailor/{tailor_id}", response_model=list[ReviewResponse])
async def list_reviews(tailor_id: uuid.UUID):
    """
    Retrieve all approved ratings and reviews for a tailor boutique.
    """
    sb = get_supabase()
    tailor_id_str = str(tailor_id)
    
    # Verify tailor exists
    tailor_exists = sb.table("tailors").select("id").eq("id", tailor_id_str).execute().data
    if not tailor_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tailor with ID {tailor_id} not found"
        )
        
    # Query approved reviews with joined customer names
    results = (
        sb.table("reviews")
        .select("*, customers(name)")
        .eq("tailor_id", tailor_id_str)
        .eq("status", "approved")
        .order("created_at", desc=True)
        .execute()
        .data
    )
    
    response = []
    for r in results:
        cust = r.get("customers") or {}
        cust_name = cust.get("name", "Anonymous")
        response.append({
            "id": r["id"],
            "tailor_id": r["tailor_id"],
            "customer_id": r["customer_id"],
            "rating": r["rating"],
            "comment": r["comment"],
            "status": r["status"],
            "created_at": r["created_at"],
            "customer_name": cust_name
        })
        
    return response
