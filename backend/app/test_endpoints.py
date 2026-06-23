import asyncio
import httpx
import uuid
from datetime import datetime
from sqlalchemy import select, event
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Import all models to ensure they are registered in the metadata
from app.models.base import Base
from app.models.location import Location
from app.models.category import Category
from app.models.tailor import Tailor
from app.models.service import Service
from app.models.portfolio import PortfolioImage
from app.models.lead import Lead

from app.core.db import get_db
from app.main import app

# Create in-memory SQLite engine for tests
SQLITE_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(SQLITE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    bind=test_engine, class_=AsyncSession, expire_on_commit=False
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

# Dependency override
async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

app.dependency_overrides[get_db] = override_get_db

async def run_tests():
    print("Starting Integration Tests with local SQLite in-memory database...")
    
    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Seed mock data
    async with TestSessionLocal() as session:
        # 1. Add Location
        loc = Location(
            id=uuid.uuid4(),
            name="Indiranagar",
            city="Bangalore",
            pin_code="560038",
            created_at=datetime.utcnow()
        )
        session.add(loc)
        
        # 2. Add Category
        cat = Category(
            id=uuid.uuid4(),
            name="Alterations",
            description="Alterations specialization",
            created_at=datetime.utcnow()
        )
        session.add(cat)
        
        await session.flush()
        
        # 3. Add Tailor
        tailor = Tailor(
            id=uuid.uuid4(),
            name="Signature Threads",
            contact_number="+91 98765 43210",
            email="signature@threads.com",
            bio="Boutique tailor boutique",
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
        
        # 4. Add Service
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
        
        test_tailor_id = tailor.id
        test_cat_name = cat.name
        test_loc_name = loc.name
        
    # Create Async HTTP Client
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        
        # Test 1: GET /api/v1/tailors (no filter)
        print("\nTest 1: Search tailors without filters")
        response = await client.get("/api/v1/tailors")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of tailors"
        assert len(data) == 1, "Expected exactly one tailor"
        # Verify contact_number is gated/hidden
        for tailor in data:
            assert "contact_number" not in tailor, "Security Warning: contact_number exposed in public search results!"
            assert "categories" in tailor, "Expected 'categories' computed field to be present"
            print(f"  - Tailor: {tailor['name']}, Categories: {tailor['categories']}")
        print("Test 1 Passed!")

        # Test 2: GET /api/v1/tailors?locality=...
        print(f"\nTest 2: Search tailors with locality={test_loc_name}")
        response = await client.get(f"/api/v1/tailors?locality={test_loc_name}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list"
        assert len(data) == 1, "Expected matched tailor"
        for tailor in data:
            assert tailor["location"]["name"] == test_loc_name, f"Expected locality {test_loc_name}"
            print(f"  - Match: {tailor['name']} at {tailor['location']['name']}")
        print("Test 2 Passed!")

        # Test 3: GET /api/v1/tailors?category=...
        print(f"\nTest 3: Search tailors with category={test_cat_name}")
        response = await client.get(f"/api/v1/tailors?category={test_cat_name}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list"
        assert len(data) == 1, "Expected matched tailor"
        for tailor in data:
            assert test_cat_name in tailor["categories"], f"Expected category {test_cat_name} in computed categories"
            print(f"  - Match: {tailor['name']} with categories {tailor['categories']}")
        print("Test 3 Passed!")

        # Test 4: GET /api/v1/tailors/{tailor_id}
        print(f"\nTest 4: Get tailor detail view for {test_tailor_id}")
        response = await client.get(f"/api/v1/tailors/{test_tailor_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        tailor = response.json()
        assert tailor["id"] == str(test_tailor_id), f"Expected ID {test_tailor_id}"
        assert "contact_number" not in tailor, "Security Warning: contact_number exposed in tailor detail view!"
        print(f"  - Detail view for {tailor['name']} verified (contact gated).")
        print("Test 4 Passed!")

        # Test 5: POST /api/v1/leads (Create lead -> Unlock contact info)
        print("\nTest 5: Submit lead to unlock contact info")
        lead_payload = {
            "tailor_id": str(test_tailor_id),
            "customer_name": "Test Customer",
            "customer_mobile": "+91 99999 88888",
            "requirement_description": "Need a premium custom suit stitched within 5 days."
        }
        response = await client.post("/api/v1/leads", json=lead_payload)
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        tailor_unlocked = response.json()
        assert tailor_unlocked["id"] == str(test_tailor_id), "Expected correct tailor id"
        assert "contact_number" in tailor_unlocked, "Expected contact_number to be unlocked in response!"
        assert tailor_unlocked["contact_number"] == "+91 98765 43210"
        print(f"  - Lead submitted successfully.")
        print(f"  - Gated Contact Number unlocked: {tailor_unlocked['contact_number']}")
        print("Test 5 Passed!")

    # Cleanup engine connection
    await test_engine.dispose()
    print("\nAll integration tests passed successfully against local SQLite database!")

if __name__ == "__main__":
    asyncio.run(run_tests())
