import uuid
from datetime import datetime
from pydantic import BaseModel, Field, conint

class ReviewCreate(BaseModel):
    tailor_id: uuid.UUID = Field(..., description="ID of the tailor boutique being reviewed")
    rating: conint(ge=1, le=5) = Field(..., description="Star rating from 1 to 5")
    comment: str | None = Field(None, description="Optional textual comment / review body")

class ReviewResponse(BaseModel):
    id: uuid.UUID = Field(..., description="Review ID")
    tailor_id: uuid.UUID = Field(..., description="Tailor ID")
    customer_id: uuid.UUID = Field(..., description="Customer ID")
    rating: int = Field(..., description="Star rating")
    comment: str | None = Field(None, description="Review comment")
    status: str = Field(..., description="Review approval status")
    created_at: datetime = Field(..., description="Creation timestamp")
    customer_name: str | None = Field(None, description="Name of the customer who left the review")
