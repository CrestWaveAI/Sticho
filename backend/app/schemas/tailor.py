import uuid
from datetime import datetime
from pydantic import BaseModel, Field, computed_field
from app.schemas.location import LocationResponse
from app.schemas.service import ServiceDetailResponse

class TailorBase(BaseModel):
    name: str = Field(..., description="Name of the tailor boutique")
    email: str | None = Field(None, description="Email address")
    bio: str | None = Field(None, description="Bio or description of specialities")
    address: str = Field(..., description="Street/location address details")
    gradient: str | None = Field(None, description="CSS gradient background for card display")
    is_verified: bool = Field(False, description="Verification status")

class TailorCreate(TailorBase):
    contact_number: str = Field(..., description="Phone number of the tailor")
    location_id: uuid.UUID | None = Field(None, description="Reference to location id")

# Public search results response (gates contact info)
class TailorPublicResponse(TailorBase):
    id: uuid.UUID
    rating: float
    reviews_count: int
    created_at: datetime
    location: LocationResponse | None = None
    
    # We resolve categories from tailor services
    services: list[ServiceDetailResponse] = Field([], exclude=True)

    @computed_field
    @property
    def categories(self) -> list[str]:
        # Return a list of unique category names from services relationship
        unique_cats = set()
        for s in self.services:
            if hasattr(s, 'category') and s.category:
                unique_cats.add(s.category.name)
            # Alternatively, if not loaded, we can extract from Category Response if loaded
        return list(unique_cats)

    class Config:
        from_attributes = True

# Detailed profile response (gates contact info)
class TailorDetailResponse(TailorPublicResponse):
    pass

# Private profile response (includes gated contact info - returned ONLY after lead submission)
class TailorPrivateResponse(TailorDetailResponse):
    contact_number: str = Field(..., description="Phone number of the tailor (unlocked)")

    class Config:
        from_attributes = True
