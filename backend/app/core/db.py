import os
from collections.abc import AsyncGenerator
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    import warnings
    warnings.warn("DATABASE_URL environment variable is not set. Falling back to dummy database URL for module import.")
    DATABASE_URL = "postgresql+asyncpg://postgres:placeholder@localhost:5432/postgres"

if "[YOUR_DATABASE_PASSWORD_HERE]" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("[YOUR_DATABASE_PASSWORD_HERE]", "placeholder")

from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# Normalise scheme: plain postgresql:// / postgres:// → postgresql+asyncpg://
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# Always strip sslmode from asyncpg URLs (asyncpg uses connect_args ssl= instead)
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    parsed_url = urlparse(DATABASE_URL)
    query_params = parse_qs(parsed_url.query)
    if "sslmode" in query_params:
        query_params.pop("sslmode")
    new_query = urlencode(query_params, doseq=True)
    parsed_url = parsed_url._replace(query=new_query)
    DATABASE_URL = urlunparse(parsed_url)

import ssl
from sqlalchemy import event

connect_args = {}
if DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres"):
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ssl_context

# Create asynchronous database engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True, # Logs all SQL queries (useful for development)
    future=True,
    connect_args=connect_args
)

# Async session maker
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Strip PostgreSQL schema names when using SQLite
from app.models.base import Base
@event.listens_for(Base.metadata, "before_create")
def remove_schemas_for_sqlite(target, connection, **kw):
    if connection.dialect.name == "sqlite":
        for table in target.tables.values():
            table.schema = None
            for fk in table.foreign_keys:
                if fk._colspec and fk._colspec.startswith("public."):
                    fk._colspec = fk._colspec.replace("public.", "", 1)

async def init_sqlite_db():
    from app.models.location import Location
    from app.models.category import Category
    from app.models.tailor import Tailor
    
    # Strip schema names from metadata tables permanently for SQLite
    if engine.url.drivername.startswith("sqlite"):
        for table in Base.metadata.tables.values():
            table.schema = None
            for fk in table.foreign_keys:
                if fk._colspec and fk._colspec.startswith("public."):
                    fk._colspec = fk._colspec.replace("public.", "", 1)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session_maker() as session:
        # Check if already seeded
        from sqlalchemy import select
        result = await session.execute(select(Location).limit(1))
        if result.scalars().first() is not None:
            return # Already seeded
            
        # Seed Location
        import uuid
        loc1 = Location(
            id=uuid.UUID("6ed6ab9b-68a6-4988-bd3e-a9789e942ea7"),
            name="Indiranagar",
            city="Bangalore",
            pin_code="560038"
        )
        session.add(loc1)
        
        # Seed Categories
        cat1 = Category(id=uuid.UUID("11111111-1111-1111-1111-111111111111"), name="Men's", description="Men's custom tailoring")
        cat2 = Category(id=uuid.UUID("22222222-2222-2222-2222-222222222222"), name="Alterations", description="Garment adjustments")
        session.add_all([cat1, cat2])
        
        # Seed Tailor
        t1 = Tailor(
            id=uuid.UUID("6ed6ab9b-68a6-4988-bd3e-a9789e942ea7"),
            name="Signature Threads",
            bio="Bespoke suits and precise alterations for modern gentlemen.",
            address="123, 100 Feet Rd, Indiranagar, Bangalore",
            gradient="linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
            rating=4.8,
            reviews_count=120,
            location_id=loc1.id,
            is_verified=True,
            contact_number="+91 98765 43210"
        )
        session.add(t1)
        
        # Seed Service linking Tailor to Alterations category
        from app.models.service import Service
        s1 = Service(
            id=uuid.UUID("33333333-3333-3333-3333-333333333333"),
            tailor_id=t1.id,
            category_id=cat2.id,
            price_estimate=150.00,
            time_estimate_days=2,
            description="Alterations specialization"
        )
        session.add(s1)
        
        await session.commit()


# Dependency to yield async database sessions to route handlers
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
