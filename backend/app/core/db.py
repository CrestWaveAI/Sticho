import os
from collections.abc import AsyncGenerator
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

if "[YOUR_DATABASE_PASSWORD_HERE]" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("[YOUR_DATABASE_PASSWORD_HERE]", "placeholder")

from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# Adapt connection scheme for asyncpg if standard postgresql:// is provided
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# Remove sslmode from query parameters as asyncpg doesn't support it directly
parsed_url = urlparse(DATABASE_URL)
query_params = parse_qs(parsed_url.query)
if "sslmode" in query_params:
    query_params.pop("sslmode")
new_query = urlencode(query_params, doseq=True)
parsed_url = parsed_url._replace(query=new_query)
DATABASE_URL = urlunparse(parsed_url)

import ssl

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Create asynchronous database engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True, # Logs all SQL queries (useful for development)
    future=True,
    connect_args={"ssl": ssl_context}
)

# Async session maker
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


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
