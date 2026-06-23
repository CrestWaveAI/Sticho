import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class LeadBase(BaseModel):
    customer_name: str = Field(..., description="Name of the customer submitting the lead")
    customer_mobile: str = Field(..., description="Mobile number of the customer")
    requirement_description: str = Field(..., description="Specific requirements/descriptions")

class LeadCreate(LeadBase):
    tailor_id: uuid.UUID

class LeadResponse(LeadBase):
    id: uuid.UUID
    tailor_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True
