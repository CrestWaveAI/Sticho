import uuid
from datetime import datetime
from pydantic import BaseModel, Field, condecimal

class ServiceBase(BaseModel):
    price_estimate: condecimal(max_digits=10, decimal_places=2) | None = Field(None, description="Price estimate for service")
    time_estimate_days: int | None = Field(None, description="Time estimate in days")
    description: str | None = Field(None, description="Detailed service description")

class ServiceCreate(ServiceBase):
    tailor_id: uuid.UUID
    category_id: uuid.UUID

class ServiceResponse(ServiceBase):
    id: uuid.UUID
    tailor_id: uuid.UUID
    category_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


from app.schemas.category import CategoryResponse

class ServiceDetailResponse(ServiceResponse):
    category: CategoryResponse | None = None

