import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class CategoryBase(BaseModel):
    name: str = Field(..., description="Category name, e.g. Men's or Boutique")
    description: str | None = Field(None, description="Category description")

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True
