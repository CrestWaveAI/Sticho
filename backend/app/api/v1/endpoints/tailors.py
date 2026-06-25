import uuid
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.db import get_db
from app.models.tailor import Tailor
from app.models.location import Location
from app.models.service import Service
from app.models.category import Category
from app.models.portfolio import PortfolioImage
from app.schemas.tailor import TailorPublicResponse, TailorDetailResponse, TailorPrivateResponse, TailorUpdate
from app.schemas.portfolio import PortfolioImageBase, PortfolioImageResponse, PortfolioImagePositionUpdate

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


@router.put("/{tailor_id}", response_model=TailorPrivateResponse)
async def update_tailor_profile(
    tailor_id: uuid.UUID,
    tailor_update: TailorUpdate,
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
        
    # Update fields
    update_data = tailor_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tailor, key, value)
        
    db.add(tailor)
    await db.flush()
    return tailor


@router.post("/{tailor_id}/portfolio", response_model=PortfolioImageResponse)
async def add_portfolio_metadata(
    tailor_id: uuid.UUID,
    image_data: PortfolioImageBase,
    db: AsyncSession = Depends(get_db),
):
    # Check tailor exists
    tailor_query = select(Tailor).where(Tailor.id == tailor_id)
    tailor_result = await db.execute(tailor_query)
    if not tailor_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Tailor not found")
        
    # Enforce max limit of 20 images
    count_query = select(func.count()).select_from(PortfolioImage).where(PortfolioImage.tailor_id == tailor_id)
    count_result = await db.execute(count_query)
    count = count_result.scalar() or 0
    if count >= 20:
        raise HTTPException(status_code=400, detail="Maximum limit of 20 portfolio images reached.")

    db_image = PortfolioImage(
        id=uuid.uuid4(),
        tailor_id=tailor_id,
        image_url=image_data.image_url,
        caption=image_data.caption,
        position=image_data.position,
        created_at=datetime.utcnow()
    )
    db.add(db_image)
    await db.flush()
    return db_image


@router.post("/{tailor_id}/portfolio/upload", response_model=PortfolioImageResponse)
async def upload_portfolio_image(
    tailor_id: uuid.UUID,
    file: UploadFile = File(...),
    caption: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
):
    # 1. Check tailor exists
    tailor_query = select(Tailor).where(Tailor.id == tailor_id)
    tailor_result = await db.execute(tailor_query)
    if not tailor_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Tailor not found")

    # 2. File Validation: check file type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Unsupported file type. Only JPEG, PNG, and WEBP are allowed.")

    # 3. File Validation: check file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 5MB limit.")
    await file.seek(0) # Reset stream pointer after reading

    # 4. Enforce max limit of 20 images
    count_query = select(func.count()).select_from(PortfolioImage).where(PortfolioImage.tailor_id == tailor_id)
    count_result = await db.execute(count_query)
    count = count_result.scalar() or 0
    if count >= 20:
        raise HTTPException(status_code=400, detail="Maximum limit of 20 portfolio images reached.")

    # 5. Save locally as fallback (mimicking CDN in local development)
    filename = f"{uuid.uuid4()}_{file.filename}"
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
    absolute_path = os.path.join(base_dir, "static", "media", filename)
    
    # Ensure folder exists
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
    
    with open(absolute_path, "wb") as f:
        f.write(contents)
    
    image_url = f"/static/media/{filename}"

    db_image = PortfolioImage(
        id=uuid.uuid4(),
        tailor_id=tailor_id,
        image_url=image_url,
        caption=caption,
        position=count, # Appends at the end
        created_at=datetime.utcnow()
    )
    db.add(db_image)
    await db.flush()
    return db_image


@router.put("/{tailor_id}/portfolio/reorder")
async def reorder_portfolio(
    tailor_id: uuid.UUID,
    positions: list[PortfolioImagePositionUpdate],
    db: AsyncSession = Depends(get_db),
):
    # Verify tailor exists
    tailor_query = select(Tailor).where(Tailor.id == tailor_id)
    tailor_result = await db.execute(tailor_query)
    if not tailor_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Tailor not found")

    # Retrieve all images for this tailor
    image_ids = [p.id for p in positions]
    images_query = select(PortfolioImage).where(
        PortfolioImage.tailor_id == tailor_id,
        PortfolioImage.id.in_(image_ids)
    )
    images_result = await db.execute(images_query)
    images = {img.id: img for img in images_result.scalars().all()}

    # Update positions
    for update in positions:
        if update.id in images:
            images[update.id].position = update.position
            db.add(images[update.id])

    await db.flush()
    return {"message": "Portfolio order updated successfully."}


@router.delete("/{tailor_id}/portfolio/{image_id}")
async def delete_portfolio_image(
    tailor_id: uuid.UUID,
    image_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    query = select(PortfolioImage).where(
        PortfolioImage.tailor_id == tailor_id,
        PortfolioImage.id == image_id
    )
    result = await db.execute(query)
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Portfolio image not found")

    # Delete local file if it exists
    if image.image_url.startswith("/static/media/"):
        filename = image.image_url.replace("/static/media/", "")
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
        absolute_path = os.path.join(base_dir, "static", "media", filename)
        if os.path.exists(absolute_path):
            os.remove(absolute_path)

    await db.delete(image)
    await db.flush()
    return {"message": "Portfolio image deleted successfully."}

