import uuid
from datetime import datetime
from sqlalchemy import String, Text, Boolean, Numeric, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Tailor(Base):
    __tablename__ = "tailors"
    __table_args__ = {"schema": "public"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    contact_number: Mapped[str | None] = mapped_column(String, nullable=True)
    whatsapp_number: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String, nullable=True)
    google_id: Mapped[str | None] = mapped_column(String, nullable=True)
    location_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("public.locations.id", ondelete="SET NULL"), nullable=True
    )
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    gradient: Mapped[str | None] = mapped_column(String, nullable=True)
    rating: Mapped[float] = mapped_column(Numeric(2, 1), default=0.0, nullable=False)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    experience: Mapped[int | None] = mapped_column(Integer, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    working_hours: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    whatsapp_clicks: Mapped[int] = mapped_column(Integer, server_default="0", default=0, nullable=False)
    call_clicks: Mapped[int] = mapped_column(Integer, server_default="0", default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    location: Mapped["Location"] = relationship(
        "Location", back_populates="tailors"
    )
    services: Mapped[list["Service"]] = relationship(
        "Service", back_populates="tailor", cascade="all, delete-orphan"
    )
    portfolio_images: Mapped[list["PortfolioImage"]] = relationship(
        "PortfolioImage", back_populates="tailor", cascade="all, delete-orphan"
    )
    leads: Mapped[list["Lead"]] = relationship(
        "Lead", back_populates="tailor", cascade="all, delete-orphan"
    )
    reviews_list: Mapped[list["Review"]] = relationship(
        "Review", back_populates="tailor", cascade="all, delete-orphan"
    )
