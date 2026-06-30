import asyncio
import uuid
from datetime import datetime
from sqlalchemy.orm import selectinload
from sqlalchemy import select, event
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Import all models to ensure they are registered in the metadata
from app.models.base import Base
from app.models.tailor import Tailor
from app.models.location import Location
from app.models.category import Category
from app.models.service import Service
from app.models.portfolio import PortfolioImage
from app.models.lead import Lead
from app.models.customer import Customer
from app.models.review import Review

from app.schemas.tailor import TailorPublicResponse

# Create local SQLite in-memory engine for self-contained model tests
SQLITE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(SQLITE_URL, echo=False)
async_session_maker = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

# Strip PostgreSQL schema names when using SQLite
@event.listens_for(Base.metadata, "before_create")
def remove_schemas_for_sqlite(target, connection, **kw):
    if connection.dialect.name == "sqlite":
        for table in target.tables.values():
            table.schema = None
            for fk in table.foreign_keys:
                if fk._colspec and fk._colspec.startswith("public."):
                    fk._colspec = fk._colspec.replace("public.", "", 1)

async def verify_models_and_schemas():
    print("Verifying SQLAlchemy models and Pydantic schemas against local SQLite database...")
    try:
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
        # Seed mock data
        async with async_session_maker() as session:
            loc = Location(
                id=uuid.uuid4(),
                name="Indiranagar",
                city="Bangalore",
                pin_code="560038",
                created_at=datetime.utcnow()
            )
            session.add(loc)
            
            cat = Category(
                id=uuid.uuid4(),
                name="Alterations",
                description="Alterations category",
                created_at=datetime.utcnow()
            )
            session.add(cat)
            
            await session.flush()
            
            tailor = Tailor(
                id=uuid.uuid4(),
                name="Signature Threads",
                contact_number="+91 98765 43210",
                email="signature@threads.com",
                bio="Boutique tailor",
                address="12th Main Road, Indiranagar, Bangalore",
                location_id=loc.id,
                is_verified=True,
                gradient="linear-gradient(135deg, #bf91ac 0%, #7d4d68 100%)",
                rating=4.8,
                reviews_count=120,
                created_at=datetime.utcnow()
            )
            session.add(tailor)
            
            await session.flush()
            
            service = Service(
                id=uuid.uuid4(),
                tailor_id=tailor.id,
                category_id=cat.id,
                price_estimate=150.0,
                time_estimate_days=2,
                description="Quick alterations",
                created_at=datetime.utcnow()
            )
            session.add(service)
            
            await session.commit()

        # Query and test serialization
        async with async_session_maker() as session:
            # Query all tailors loading locations and services + categories
            stmt = (
                select(Tailor)
                .options(
                    selectinload(Tailor.location),
                    selectinload(Tailor.services).selectinload(
                        Service.category
                    )
                )
            )
            result = await session.execute(stmt)
            tailors = result.scalars().all()
            
            print(f"\nFound {len(tailors)} tailors in local DB.")
            print("\nSerializing to Pydantic TailorPublicResponse...")
            
            for tailor_orm in tailors:
                # Validate and serialize ORM model to Pydantic Response schema
                tailor_pydantic = TailorPublicResponse.model_validate(tailor_orm)
                
                print(f"\nTailor: {tailor_pydantic.name}")
                if tailor_pydantic.location:
                    print(f"  Location: {tailor_pydantic.location.name}, {tailor_pydantic.location.city}")
                print(f"  Verified: {tailor_pydantic.is_verified}")
                print(f"  Rating: {tailor_pydantic.rating} ({tailor_pydantic.reviews_count} reviews)")
                print(f"  Resolved Categories (Computed Field): {tailor_pydantic.categories}")
                # Ensure contact number is hidden
                assert not hasattr(tailor_pydantic, "contact_number"), "Error: contact_number should be hidden in Public Response!"
                
            print("\nVerification Successful! All models mapped and Pydantic serialization executed without errors.")
    except Exception as e:
        print("\nVerification Failed!")
        print(f"Error details: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify_models_and_schemas())
