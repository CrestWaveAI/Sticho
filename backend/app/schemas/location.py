import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class LocationBase(BaseModel):
    name: str = Field(..., description="Locality or area name, e.g. Indiranagar")
    city: str = Field(..., description="City name, e.g. Bangalore")
    pin_code: str = Field(..., description="Pin code or zip code")

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True
