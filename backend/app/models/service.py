import uuid
from datetime import datetime
from sqlalchemy import Numeric, Integer, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Service(Base):
    __tablename__ = "services"
    __table_args__ = {"schema": "public"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tailor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("public.tailors.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("public.categories.id", ondelete="RESTRICT"), nullable=False
    )
    price_estimate: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    time_estimate_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    tailor: Mapped["Tailor"] = relationship("Tailor", back_populates="services")
    category: Mapped["Category"] = relationship("Category", back_populates="services")
