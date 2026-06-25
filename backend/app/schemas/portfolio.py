import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class PortfolioImageBase(BaseModel):
    image_url: str = Field(..., description="Url of the portfolio image")
    caption: str | None = Field(None, description="Image caption description")
    position: int = Field(0, description="Display order position")

class PortfolioImageCreate(PortfolioImageBase):
    tailor_id: uuid.UUID

class PortfolioImageResponse(PortfolioImageBase):
    id: uuid.UUID
    tailor_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class PortfolioImagePositionUpdate(BaseModel):
    id: uuid.UUID
    position: int
