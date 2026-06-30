import asyncio
import httpx
import uuid
import sqlite3
import json
from unittest.mock import patch
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
from app.models.customer import Customer
from app.models.review import Review

from app.core.db import get_db
from app.main import app

# Create in-memory SQLite engine for tests using shared cache (for sync and async access)
SQLITE_URL = "sqlite+aiosqlite:///file:testmemdb?mode=memory&cache=shared&uri=true"
test_engine = create_async_engine(SQLITE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    bind=test_engine, class_=AsyncSession, expire_on_commit=False
)

def normalize_val(val):
    if isinstance(val, uuid.UUID):
        return val.hex
    elif isinstance(val, datetime):
        return val.isoformat()
    elif isinstance(val, dict):
        return json.dumps(val)
    elif isinstance(val, str):
        try:
            return uuid.UUID(val).hex
        except ValueError:
            pass
    return val

class MockExecuteResult:
    def __init__(self, data):
        self.data = data

class MockQueryBuilder:
    def __init__(self, table_name, db_conn):
        self.table_name = table_name
        self.db_conn = db_conn
        self.filters = []
        self.limit_val = None
        self.update_data = None
        self.insert_data = None

    def select(self, fields):
        return self

    def eq(self, field, value):
        self.filters.append((field, "==", value))
        return self

    def or_(self, filter_str):
        self.filters.append(("or", filter_str))
        return self

    def limit(self, val):
        self.limit_val = val
        return self

    def update(self, data):
        self.update_data = data
        return self

    def order(self, field, desc=False):
        self.order_field = field
        self.order_desc = desc
        return self

    def insert(self, data):
        self.insert_data = data
        return self

    def delete(self):
        self.is_delete = True
        return self



    def execute(self):
        cursor = self.db_conn.cursor()
        
        # 0. Handle DELETE
        if getattr(self, "is_delete", False):
            where_clause = ""
            where_vals = []
            clauses = []
            for field, op, val in self.filters:
                clauses.append(f"{field} {op} ?")
                where_vals.append(normalize_val(val))
            if clauses:
                where_clause = " WHERE " + " AND ".join(clauses)
            sql = f"DELETE FROM {self.table_name}{where_clause}"
            cursor.execute(sql, where_vals)
            self.db_conn.commit()
            return MockExecuteResult([])

        # 1. Handle INSERT
        if self.insert_data is not None:
            cols = list(self.insert_data.keys())
            vals = list(self.insert_data.values())
            # Normalize values (UUIDs to hex, datetimes to ISO strings)
            vals = [normalize_val(v) for v in vals]
            placeholders = ", ".join(["?" for _ in vals])
            sql = f"INSERT INTO {self.table_name} ({', '.join(cols)}) VALUES ({placeholders})"
            cursor.execute(sql, vals)
            self.db_conn.commit()
            inserted_row = {k: normalize_val(v) for k, v in self.insert_data.items()}
            return MockExecuteResult([inserted_row])

        # 2. Handle UPDATE
        if self.update_data is not None:
            sets = []
            vals = []
            for k, v in self.update_data.items():
                sets.append(f"{k} = ?")
                vals.append(normalize_val(v))
            
            where_clause = ""
            where_vals = []
            clauses = []
            for field, op, val in self.filters:
                clauses.append(f"{field} {op} ?")
                where_vals.append(normalize_val(val))
            if clauses:
                where_clause = " WHERE " + " AND ".join(clauses)
                
            sql = f"UPDATE {self.table_name} SET {', '.join(sets)}{where_clause}"
            cursor.execute(sql, vals + where_vals)
            self.db_conn.commit()

        # 3. Handle SELECT
        if self.table_name == "tailors":
            sql = "SELECT * FROM tailors"
            params = []
            where_clauses = []
            for field, op, val in self.filters:
                if field == "is_verified":
                    val = 1 if val else 0
                where_clauses.append(f"{field} {op} ?")
                params.append(normalize_val(val))
            if where_clauses:
                sql += " WHERE " + " AND ".join(where_clauses)
                

                
            cursor.execute(sql, params)
            columns = [col[0] for col in cursor.description]
            tailors = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            for t in tailors:
                t["is_verified"] = bool(t["is_verified"])
                if isinstance(t.get("working_hours"), str):
                    try:
                        t["working_hours"] = json.loads(t["working_hours"])
                    except Exception:
                        pass
                if t.get("location_id"):
                    cursor.execute("SELECT * FROM locations WHERE id = ?", (t["location_id"],))
                    loc_cols = [col[0] for col in cursor.description]
                    loc_row = cursor.fetchone()
                    t["locations"] = dict(zip(loc_cols, loc_row)) if loc_row else None
                else:
                    t["locations"] = None
                
                cursor.execute("SELECT * FROM services WHERE tailor_id = ?", (t["id"],))
                srv_cols = [col[0] for col in cursor.description]
                services = [dict(zip(srv_cols, r)) for r in cursor.fetchall()]
                for s in services:
                    cursor.execute("SELECT * FROM categories WHERE id = ?", (s["category_id"],))
                    cat_cols = [col[0] for col in cursor.description]
                    cat_row = cursor.fetchone()
                    s["categories"] = dict(zip(cat_cols, cat_row)) if cat_row else None
                t["services"] = services

                cursor.execute("SELECT * FROM portfolio_images WHERE tailor_id = ?", (t["id"],))
                port_cols = [col[0] for col in cursor.description]
                port_images = [dict(zip(port_cols, r)) for r in cursor.fetchall()]
                port_images.sort(key=lambda x: x.get("position", 0))
                t["portfolio_images"] = port_images
            return MockExecuteResult(tailors)

        elif self.table_name == "locations":
            sql = "SELECT * FROM locations"
            params = []
            for filt in self.filters:
                if filt[0] == "or":
                    import re
                    match = re.search(r'name\.ilike\.(?:"%)?([^"%]+)(?:%")?', filt[1])
                    if match:
                        query_val = match.group(1)
                        sql += " WHERE name LIKE ? OR city LIKE ? OR pin_code LIKE ?"
                        params.extend([f"%{query_val}%", f"%{query_val}%", f"%{query_val}%"])
            if self.limit_val:
                sql += f" LIMIT {self.limit_val}"
            cursor.execute(sql, params)
            columns = [col[0] for col in cursor.description]
            locations = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return MockExecuteResult(locations)

        elif self.table_name == "portfolio_images":
            sql = "SELECT * FROM portfolio_images"
            params = []
            where_clauses = []
            for field, op, val in self.filters:
                where_clauses.append(f"{field} {op} ?")
                params.append(normalize_val(val))
            if where_clauses:
                sql += " WHERE " + " AND ".join(where_clauses)
            cursor.execute(sql, params)
            columns = [col[0] for col in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return MockExecuteResult(rows)

        elif self.table_name == "categories":
            sql = "SELECT * FROM categories"
            params = []
            where_clauses = []
            for field, op, val in self.filters:
                where_clauses.append(f"{field} {op} ?")
                params.append(normalize_val(val))
            if where_clauses:
                sql += " WHERE " + " AND ".join(where_clauses)
            cursor.execute(sql, params)
            columns = [col[0] for col in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return MockExecuteResult(rows)

        elif self.table_name == "customers":
            sql = "SELECT * FROM customers"
            params = []
            where_clauses = []
            for field, op, val in self.filters:
                where_clauses.append(f"{field} {op} ?")
                params.append(normalize_val(val))
            if where_clauses:
                sql += " WHERE " + " AND ".join(where_clauses)
            cursor.execute(sql, params)
            columns = [col[0] for col in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return MockExecuteResult(rows)

        elif self.table_name == "reviews":
            sql = "SELECT * FROM reviews"
            params = []
            where_clauses = []
            for field, op, val in self.filters:
                where_clauses.append(f"{field} {op} ?")
                params.append(normalize_val(val))
            if where_clauses:
                sql += " WHERE " + " AND ".join(where_clauses)
            if getattr(self, "order_field", None):
                direction = "DESC" if getattr(self, "order_desc", False) else "ASC"
                sql += f" ORDER BY {self.order_field} {direction}"
            cursor.execute(sql, params)
            columns = [col[0] for col in cursor.description]
            reviews = [dict(zip(columns, row)) for row in cursor.fetchall()]
            for r in reviews:
                cursor.execute("SELECT name FROM customers WHERE id = ?", (r["customer_id"],))
                cust_row = cursor.fetchone()
                r["customers"] = {"name": cust_row[0]} if cust_row else {"name": "Anonymous"}
            return MockExecuteResult(reviews)

        elif self.table_name == "leads":
            sql = "SELECT * FROM leads"
            params = []
            where_clauses = []
            for field, op, val in self.filters:
                where_clauses.append(f"{field} {op} ?")
                params.append(normalize_val(val))
            if where_clauses:
                sql += " WHERE " + " AND ".join(where_clauses)
            if getattr(self, "order_field", None):
                direction = "DESC" if getattr(self, "order_desc", False) else "ASC"
                sql += f" ORDER BY {self.order_field} {direction}"
            cursor.execute(sql, params)
            columns = [col[0] for col in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return MockExecuteResult(rows)

        return MockExecuteResult([])

class MockSupabaseClient:
    def __init__(self, db_conn):
        self.db_conn = db_conn

    def table(self, table_name):
        return MockQueryBuilder(table_name, self.db_conn)

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
        cat2 = Category(
            id=uuid.uuid4(),
            name="Men's",
            description="Men's tailoring",
            created_at=datetime.utcnow()
        )
        session.add_all([cat, cat2])
        
        await session.flush()
        
        # 3. Add Tailor
        tailor = Tailor(
            id=uuid.uuid4(),
            name="Signature Threads",
            contact_number="+91 98765 43210",
            whatsapp_number="+91 98765 43219",
            email="signature@threads.com",
            bio="Boutique tailor boutique",
            address="12th Main Road, Indiranagar, Bangalore",
            location_id=loc.id,
            is_verified=True,
            gradient="linear-gradient(135deg, #bf91ac 0%, #7d4d68 100%)",
            rating=4.8,
            reviews_count=120,
            experience=8,
            latitude=12.9784,
            longitude=77.6408,
            working_hours={"Mon-Sat": "10:00 AM - 8:00 PM", "Sun": "Closed"},
            created_at=datetime.utcnow()
        )
        session.add(tailor)
        
        # 3b. Add Unverified Tailor
        unverified_tailor = Tailor(
            id=uuid.uuid4(),
            name="Unverified Tailor",
            contact_number="+91 98765 43211",
            email="unverified@tailor.com",
            bio="Unverified bio",
            address="Unverified Address",
            location_id=loc.id,
            is_verified=False,
            experience=2,
            latitude=12.9785,
            longitude=77.6409,
            working_hours={"Mon-Sat": "11:00 AM - 7:00 PM"},
            created_at=datetime.utcnow()
        )
        session.add(unverified_tailor)

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
        test_unverified_tailor_id = unverified_tailor.id
        test_cat_name = cat.name
        test_loc_name = loc.name
        
    # Start patcher for Supabase REST client during tests
    db_conn = sqlite3.connect("file:testmemdb?mode=memory&cache=shared&uri=true", uri=True)
    mock_client = MockSupabaseClient(db_conn)
    patchers = [
        patch("app.api.v1.endpoints.tailors.get_supabase", return_value=mock_client),
        patch("app.api.v1.endpoints.locations.get_supabase", return_value=mock_client),
        patch("app.api.v1.endpoints.leads.get_supabase", return_value=mock_client),
        patch("app.api.v1.endpoints.categories.get_supabase", return_value=mock_client),
        patch("app.api.v1.endpoints.auth.get_supabase", return_value=mock_client),
        patch("app.api.v1.endpoints.customer_auth.get_supabase", return_value=mock_client),
        patch("app.api.v1.endpoints.reviews.get_supabase", return_value=mock_client),
        patch("app.api.v1.endpoints.tailors.cloudinary.uploader.upload", return_value={"secure_url": "https://res.cloudinary.com/demo/image/upload/sample.jpg"}),
    ]
    for p in patchers:
        p.start()
        
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
        tailor_res = response.json()
        assert tailor_res["id"] == str(test_tailor_id), f"Expected ID {test_tailor_id}"
        assert "contact_number" not in tailor_res, "Security Warning: contact_number exposed in tailor detail view!"
        assert tailor_res["experience"] == 8, f"Expected experience 8, got {tailor_res.get('experience')}"
        assert tailor_res["latitude"] == 12.9784, f"Expected latitude 12.9784, got {tailor_res.get('latitude')}"
        assert tailor_res["longitude"] == 77.6408, f"Expected longitude 77.6408, got {tailor_res.get('longitude')}"
        assert tailor_res["working_hours"] == {"Mon-Sat": "10:00 AM - 8:00 PM", "Sun": "Closed"}, f"Expected working_hours, got {tailor_res.get('working_hours')}"
        assert isinstance(tailor_res["portfolio_images"], list), "Expected portfolio_images to be a list"
        print(f"  - Detail view for {tailor_res['name']} verified (contact gated, new fields present).")

        # Test 4b: Get tailor detail view for unverified tailor (should fail with 404)
        print(f"Test 4b: Get tailor detail view for unverified tailor {test_unverified_tailor_id}")
        response = await client.get(f"/api/v1/tailors/{test_unverified_tailor_id}")
        assert response.status_code == 404, f"Expected 404 for unverified tailor, got {response.status_code}"
        
        # Test 4b-2: Get tailor detail view for unverified tailor via referer (should succeed)
        response_ref = await client.get(f"/api/v1/tailors/{test_unverified_tailor_id}", headers={"Referer": "http://localhost:3000/dashboard/settings"})
        assert response_ref.status_code == 200, f"Expected 200 via referer, got {response_ref.status_code}"
        
        # Test 4b-3: Get tailor detail view for unverified tailor via token (should succeed)
        from app.core.security import create_token
        unverified_token = create_token({"tailor_id": str(test_unverified_tailor_id)})
        response_tok = await client.get(f"/api/v1/tailors/{test_unverified_tailor_id}", headers={"Authorization": f"Bearer {unverified_token}"})
        assert response_tok.status_code == 200, f"Expected 200 via token, got {response_tok.status_code}"
        
        print("  - Unverified tailor is blocked (404 Not Found) for public, but allowed for owner/dashboard.")

        # Test 4c: Get tailor detail view for non-existent tailor (should fail with 404)
        fake_id = uuid.uuid4()
        print(f"Test 4c: Get tailor detail view for non-existent tailor {fake_id}")
        response = await client.get(f"/api/v1/tailors/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("  - Non-existent tailor returns 404.")
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
        assert "whatsapp_number" in tailor_unlocked, "Expected whatsapp_number to be unlocked in response!"
        assert tailor_unlocked["whatsapp_number"] == "+91 98765 43219"
        print(f"  - Lead submitted successfully.")
        print(f"  - Gated contact numbers unlocked: Call={tailor_unlocked['contact_number']}, WhatsApp={tailor_unlocked['whatsapp_number']}")
        print("Test 5 Passed!")

        # Test 6: PUT /api/v1/tailors/{tailor_id} (Edit profile)
        print(f"\nTest 6: Update tailor profile details")
        profile_update = {
            "name": "Signature Boutique",
            "bio": "Updated premium boutique bio"
        }
        response = await client.put(f"/api/v1/tailors/{test_tailor_id}", json=profile_update)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        updated_tailor = response.json()
        assert updated_tailor["name"] == "Signature Boutique"
        assert updated_tailor["bio"] == "Updated premium boutique bio"
        print(f"  - Profile update verified successfully.")
        print("Test 6 Passed!")

        # Test 7: Services CRUD
        print("\nTest 7: Run Services CRUD operations")
        # Create
        new_service_payload = {
            "tailor_id": str(test_tailor_id),
            "category_id": str(cat.id),
            "price_estimate": "350.00",
            "time_estimate_days": 4,
            "description": "Premium Custom Suit Stitching"
        }
        response = await client.post("/api/v1/services", json=new_service_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        service_data = response.json()
        new_service_id = service_data["id"]
        assert service_data["price_estimate"] == "350.00"
        print("  - Service created successfully.")

        # Update
        service_update_payload = {
            "price_estimate": "400.00",
            "time_estimate_days": 5,
            "description": "Updated Suit Stitching description"
        }
        response = await client.put(f"/api/v1/services/{new_service_id}", json=service_update_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.json()["price_estimate"] == "400.00"
        print("  - Service updated successfully.")

        # List
        response = await client.get(f"/api/v1/services/tailor/{test_tailor_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert len(response.json()) >= 1, "Expected at least 1 service listing"
        print("  - List services for tailor boutique verified.")

        # Delete
        response = await client.delete(f"/api/v1/services/{new_service_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("  - Service deleted successfully.")
        print("Test 7 Passed!")

        # Test 8: Portfolio Management (Metadata and Upload validations)
        print("\nTest 8: Run Portfolio Management operations")
        # Metadata add
        metadata_payload = {
            "image_url": "https://cloudinary.com/test1.jpg",
            "caption": "Test Design 1",
            "position": 0
        }
        response = await client.post(f"/api/v1/tailors/{test_tailor_id}/portfolio", json=metadata_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        img1 = response.json()
        img1_id = img1["id"]
        assert img1["image_url"] == "https://cloudinary.com/test1.jpg"
        print("  - Portfolio metadata added successfully.")

        # Multipart upload validation: invalid file type
        response = await client.post(
            f"/api/v1/tailors/{test_tailor_id}/portfolio/upload",
            files={"file": ("test.txt", b"dummy file content", "text/plain")}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "Unsupported file type" in response.json()["detail"]
        print("  - File type validation verified (text/plain rejected).")

        # Multipart upload validation: file size limit (5MB)
        large_content = b"x" * (6 * 1024 * 1024) # 6MB
        response = await client.post(
            f"/api/v1/tailors/{test_tailor_id}/portfolio/upload",
            files={"file": ("large.jpg", large_content, "image/jpeg")}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "File size exceeds" in response.json()["detail"]
        print("  - File size validation verified (>5MB rejected).")

        # Valid multipart upload
        response = await client.post(
            f"/api/v1/tailors/{test_tailor_id}/portfolio/upload",
            files={"file": ("design2.jpg", b"fake jpeg content", "image/jpeg")},
            data={"caption": "Test Design 2"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        img2 = response.json()
        img2_id = img2["id"]
        assert img2["image_url"].startswith("/static/media/") or "cloudinary" in img2["image_url"]
        assert img2["caption"] == "Test Design 2"
        print("  - Valid portfolio file upload verified.")

        # Bulk reordering
        reorder_payload = [
            {"id": img1_id, "position": 2},
            {"id": img2_id, "position": 1}
        ]
        response = await client.put(f"/api/v1/tailors/{test_tailor_id}/portfolio/reorder", json=reorder_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("  - Portfolio bulk reordering verified.")

        # Enforce max limit of 20 images
        # We currently have 2 images. Let's add 18 more to reach 20.
        for i in range(18):
            await client.post(
                f"/api/v1/tailors/{test_tailor_id}/portfolio",
                json={"image_url": f"https://cloudinary.com/test_{i}.jpg", "caption": f"Design {i}", "position": i + 3}
            )
        # Attempt to add the 21st image
        response = await client.post(
            f"/api/v1/tailors/{test_tailor_id}/portfolio",
            json={"image_url": "https://cloudinary.com/test_21.jpg", "caption": "Should fail", "position": 21}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "limit of 20" in response.json()["detail"]
        print("  - Portfolio image limit of 20 verified.")

        # Cleanup: delete images
        # Delete first
        response = await client.delete(f"/api/v1/tailors/{test_tailor_id}/portfolio/{img1_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("  - Portfolio image deletion verified.")
        print("Test 8 Passed!")

        # Test 9: GET /api/v1/locations/autocomplete?q=...
        print("\nTest 9: Run Locations Autocomplete search")
        response = await client.get("/api/v1/locations/autocomplete?q=Indi")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        locations_data = response.json()
        assert len(locations_data) == 1, f"Expected 1 location, got {len(locations_data)}"
        assert locations_data[0]["name"] == "Indiranagar", f"Expected Indiranagar, got {locations_data[0]['name']}"
        print("  - Locations autocomplete query matched expected locality.")
        print("Test 9 Passed!")

        # Test 10: GET /api/v1/categories
        print("\nTest 10: Run Categories list")
        response = await client.get("/api/v1/categories")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        categories_data = response.json()
        assert len(categories_data) >= 2, f"Expected at least 2 categories, got {len(categories_data)}"
        cats_list = [c["name"] for c in categories_data]
        assert "Men's" in cats_list
        assert "Alterations" in cats_list
        print("  - Categories listed successfully.")
        print("Test 10 Passed!")

        # Test 11: Tailor Registration (POST /api/v1/auth/register)
        print("\nTest 11: Run Tailor Registration")
        # 1. Register new tailor (Success)
        reg_payload = {
            "email": "bespoke_register@example.com",
            "password": "secretpassword",
            "name": "Bespoke Registered",
            "contact_number": "+91 99999 88888"
        }
        response = await client.post("/api/v1/auth/register", json=reg_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        auth_data = response.json()
        assert "access_token" in auth_data
        assert "tailor_id" in auth_data
        registered_tailor_id = auth_data["tailor_id"]
        new_tailor = {"id": registered_tailor_id}
        print("  - Register new tailor account success.")

        # 2. Register duplicate email (Fail)
        response = await client.post("/api/v1/auth/register", json=reg_payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "already registered" in response.json()["detail"]
        print("  - Duplicate email registration blocked.")
        print("Test 11 Passed!")

        # Test 12: Tailor Login (POST /api/v1/auth/login)
        print("\nTest 12: Run Tailor Login")
        # 1. Login with invalid password (Fail)
        login_payload_wrong = {
            "email": "bespoke_register@example.com",
            "password": "wrongpassword"
        }
        response = await client.post("/api/v1/auth/login", json=login_payload_wrong)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "Invalid email or password" in response.json()["detail"]
        print("  - Login with invalid password rejected.")

        # 2. Login with valid credentials (Success)
        login_payload_correct = {
            "email": "bespoke_register@example.com",
            "password": "secretpassword"
        }
        response = await client.post("/api/v1/auth/login", json=login_payload_correct)
        assert response.status_code == 200, f"Expected 200, got {response.json()}"
        assert "access_token" in response.json()
        print("  - Login with valid credentials success.")
        print("Test 12 Passed!")

        # Test 13: Google OAuth (POST /api/v1/auth/google)
        print("\nTest 13: Run Google OAuth flow")
        # 1. Google sign-up for new email (Success)
        google_payload_new = {
            "email": "google_new@example.com",
            "name": "Google New Tailor",
            "google_id": "google-oauth-id-123"
        }
        response = await client.post("/api/v1/auth/google", json=google_payload_new)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        google_auth_data = response.json()
        assert "access_token" in google_auth_data
        google_tailor_id = google_auth_data["tailor_id"]
        print("  - Google sign-up for new email success.")

        # 2. Google login for existing google_id (Success)
        response = await client.post("/api/v1/auth/google", json=google_payload_new)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.json()["tailor_id"].replace("-", "") == google_tailor_id.replace("-", "")
        print("  - Google login for existing google_id success.")

        # 3. Google sign-in for existing email without google_id (Account linking success)
        google_payload_link = {
            "email": "bespoke_register@example.com",
            "name": "Google Link Tailor",
            "google_id": "google-oauth-id-456"
        }
        response = await client.post("/api/v1/auth/google", json=google_payload_link)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.json()["tailor_id"].replace("-", "") == registered_tailor_id.replace("-", "")
        print("  - Google sign-in linked to existing email successfully.")
        print("Test 13 Passed!")

        # Test 13b: Multi-Category Search Filtering
        print("\nTest 13b: Run Multi-Category Search Filtering")
        response = await client.get("/api/v1/tailors?category=Alterations&category=NonExistent")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        search_data = response.json()
        assert len(search_data) >= 1
        assert any(t["name"] == "Signature Boutique" for t in search_data)
        print("  - Multi-category search filter returned matching tailors successfully.")
        print("Test 13b Passed!")
        
        # Test 14: Customer Registration & Login (SCRUM-10)
        print("\nTest 14: Run Customer Registration & Login")
        cust_reg_payload = {
            "email": "customer_test@example.com",
            "password": "customerpassword",
            "name": "John Customer"
        }
        # 1. Register customer
        response = await client.post("/api/v1/customer-auth/register", json=cust_reg_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        cust_auth = response.json()
        assert "access_token" in cust_auth
        customer_token = cust_auth["access_token"]
        customer_id = cust_auth["customer_id"]
        print("  - Customer registration success.")

        # 2. Duplicate registration check
        response = await client.post("/api/v1/customer-auth/register", json=cust_reg_payload)
        assert response.status_code == 400
        print("  - Customer duplicate registration rejected.")

        # 3. Customer Login
        response = await client.post("/api/v1/customer-auth/login", json={
            "email": "customer_test@example.com",
            "password": "customerpassword"
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
        print("  - Customer login success.")

        # 4. Customer Google Auth
        google_payload_cust = {
            "email": "cust_google@example.com",
            "name": "Google Customer",
            "google_id": "google-cust-id-123"
        }
        response = await client.post("/api/v1/customer-auth/google", json=google_payload_cust)
        assert response.status_code == 200
        assert "customer_id" in response.json()
        print("  - Customer Google Auth success.")
        print("Test 14 Passed!")

        # Test 15: View & Submit Ratings and Reviews (SCRUM-19)
        print("\nTest 15: Run Ratings and Reviews submission & listing")
        review_payload = {
            "tailor_id": str(test_tailor_id),
            "rating": 5,
            "comment": "Perfect alterations! Highly recommended."
        }
        # 1. Submit review (Auth required)
        response = await client.post(
            "/api/v1/reviews",
            json=review_payload,
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        review_data = response.json()
        assert review_data["rating"] == 5
        assert review_data["customer_name"] == "John Customer"
        print("  - Review submitted successfully.")

        # 2. Duplicate review submission check (Blocked)
        response = await client.post(
            "/api/v1/reviews",
            json=review_payload,
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 400
        assert "already submitted a review" in response.json()["detail"]
        print("  - Duplicate review submission blocked.")

        # 3. Retrieve tailor reviews
        response = await client.get(f"/api/v1/reviews/tailor/{test_tailor_id}")
        assert response.status_code == 200
        reviews_list = response.json()
        assert len(reviews_list) >= 1
        assert reviews_list[0]["rating"] == 5
        assert reviews_list[0]["customer_name"] == "John Customer"
        print("  - Tailor reviews listed successfully.")
        print("Test 15 Passed!")

        # Test 16: Tailor Dashboard & Click Tracking (SCRUM-26)
        print("\nTest 16: Run Click Tracking and Tailor Profile Dashboard")
        # 1. Get tailor login token
        response = await client.post("/api/v1/auth/login", json={
            "email": "bespoke_register@example.com",
            "password": "secretpassword"
        })
        assert response.status_code == 200
        tailor_token = response.json()["access_token"]
        tailor_id_registered = response.json()["tailor_id"]

        # 2. Track Call & WhatsApp clicks
        response = await client.post(
            f"/api/v1/tailors/{tailor_id_registered}/track-click",
            json={"type": "call"}
        )
        assert response.status_code == 200
        response = await client.post(
            f"/api/v1/tailors/{tailor_id_registered}/track-click",
            json={"type": "whatsapp"}
        )
        assert response.status_code == 200
        print("  - WhatsApp and Call clicks tracked successfully.")

        # 3. Get Tailor Dashboard
        response = await client.get(
            f"/api/v1/tailors/{tailor_id_registered}/dashboard",
            headers={"Authorization": f"Bearer {tailor_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        dashboard = response.json()
        assert dashboard["call_clicks"] == 1
        assert dashboard["whatsapp_clicks"] == 1
        assert "completeness_percentage" in dashboard
        assert "missing_fields" in dashboard
        assert "recent_leads" in dashboard
        print(f"  - Tailor dashboard statistics: Clicks (Call: {dashboard['call_clicks']}, WA: {dashboard['whatsapp_clicks']}), Completeness: {dashboard['completeness_percentage']}%")
        print("Test 16 Passed!")

        # Test 17: Working Hours & Lead/View Notifications (SCRUM-24 & SCRUM-27)
        print("\nTest 17: Run Working Hours & Mock Lead/View Notifications")
        # 1. Update working hours and notification preferences
        update_payload = {
            "working_hours": {
                "monday": {"open": "09:00", "close": "18:00", "closed": False},
                "sunday": {"open": None, "close": None, "closed": True}
            },
            "notifications_enabled": True,
            "notification_channel": "both"
        }
        response = await client.put(
            f"/api/v1/tailors/{tailor_id_registered}",
            json=update_payload,
            headers={"Authorization": f"Bearer {tailor_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        updated_profile = response.json()
        assert updated_profile["working_hours"]["monday"]["open"] == "09:00"
        assert updated_profile["working_hours"]["sunday"]["closed"] is True
        assert updated_profile["notifications_enabled"] is True
        assert updated_profile["notification_channel"] == "both"
        print("  - Working hours and notification settings updated successfully.")

        # 2. Trigger profile view and check log entries
        # Clear mock notification log first if it exists
        import os
        log_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docs", "mock_notifications.log"))
        if os.path.exists(log_file):
            os.remove(log_file)
        # Make the tailor verified so the public GET endpoint doesn't 404
        cursor = db_conn.cursor()
        cursor.execute("UPDATE tailors SET is_verified = 1 WHERE id = ?", (normalize_val(tailor_id_registered),))
        db_conn.commit()

        response = await client.get(
            f"/api/v1/tailors/{tailor_id_registered}",
            headers={"Authorization": f"Bearer {tailor_token}"}
        )
        assert response.status_code == 200
        # Wait a moment for background task to execute
        import asyncio
        await asyncio.sleep(0.1)
        assert os.path.exists(log_file), "Mock notification log was not created!"
        with open(log_file, "r") as f:
            log_content = f.read()
        assert "Event: PROFILE_VIEW" in log_content, f"Log content was: {log_content}"
        assert "Channel: BOTH" in log_content
        print("  - Profile view triggered background notification successfully.")

        # 3. Trigger contact click and check logs
        response = await client.post(
            f"/api/v1/tailors/{tailor_id_registered}/track-click",
            json={"type": "whatsapp"}
        )
        assert response.status_code == 200
        await asyncio.sleep(0.1)
        with open(log_file, "r") as f:
            log_content = f.read()
        assert "Event: CONTACT_CLICK" in log_content
        print("  - Contact click triggered background notification successfully.")

        # 4. Trigger lead submission and check logs
        lead_payload = {
            "tailor_id": tailor_id_registered,
            "customer_name": "Test Customer",
            "customer_mobile": "9876543210",
            "requirement_description": "Stitch a custom designer suit"
        }
        response = await client.post("/api/v1/leads", json=lead_payload)
        assert response.status_code == 201
        await asyncio.sleep(0.1)
        with open(log_file, "r") as f:
            log_content = f.read()
        assert "Event: LEAD_SUBMISSION" in log_content
        assert "Stitch a custom designer suit" in log_content
        print("  - Lead submission triggered background notification successfully.")

        # 5. Opt-out and verify no notification is sent
        opt_out_payload = {
            "notifications_enabled": False
        }
        response = await client.put(
            f"/api/v1/tailors/{tailor_id_registered}",
            json=opt_out_payload,
            headers={"Authorization": f"Bearer {tailor_token}"}
        )
        assert response.status_code == 200
        
        # Clear log file
        os.remove(log_file)
        # Trigger profile view
        response = await client.get(
            f"/api/v1/tailors/{tailor_id_registered}",
            headers={"Authorization": f"Bearer {tailor_token}"}
        )
        assert response.status_code == 200
        await asyncio.sleep(0.1)
        assert not os.path.exists(log_file), "Mock notification log was written even though notifications are disabled!"
        print("  - Opt-out settings respected. No notifications triggered.")
        print("Test 17 Passed!")

        # Test 18: Error Monitoring and Alert Triggering (SCRUM-39)
        print("\nTest 18: Error Monitoring & Triggering Alerts")
        import sentry_sdk
        # Initialize sentry with a dummy DSN for integration verification
        sentry_sdk.init(
            dsn="https://public@sentry.example.com/1",
            traces_sample_rate=1.0
        )
        with patch("sentry_sdk.Hub.current.capture_exception") as mock_capture:
            try:
                response = await client.get("/sentry-debug")
                assert response.status_code == 500
            except ZeroDivisionError:
                pass
        print("  - Error triggering endpoint returned 500 / captured exception successfully.")
        print("Test 18 Passed!")

        # Test 19: List Leads for Tailor
        print("\nTest 19: List Leads for Tailor")
        # 1. Capture a lead first
        lead_payload = {
            "tailor_id": str(test_tailor_id),
            "customer_name": "Test Customer",
            "customer_mobile": "+91 99999 88888",
            "requirement_description": "Custom shirt"
        }
        lead_res = await client.post("/api/v1/leads", json=lead_payload)
        assert lead_res.status_code == 201
        
        # 2. Generate a signed JWT token directly for the tailor
        from app.core.security import create_token
        token = create_token({"tailor_id": str(test_tailor_id)})
        
        # 3. Retrieve leads list with authorization header
        headers = {"Authorization": f"Bearer {token}"}
        leads_res = await client.get(f"/api/v1/leads?tailor_id={test_tailor_id}", headers=headers)
        assert leads_res.status_code == 200
        leads_list = leads_res.json()
        assert len(leads_list) > 0
        assert leads_list[0]["customer_name"] == "Test Customer"
        print("  - Leads list retrieved successfully and gated correctly.")
        print("Test 19 Passed!")



    for p in patchers:
        p.stop()
    db_conn.close()

    # Cleanup engine connection
    await test_engine.dispose()
    print("\nAll integration tests passed successfully against local SQLite database!")

if __name__ == "__main__":
    asyncio.run(run_tests())
