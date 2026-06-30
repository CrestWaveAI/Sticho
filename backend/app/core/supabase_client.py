"""
Supabase REST client — used as the data layer when direct PostgreSQL
connection via asyncpg is unavailable (e.g. pooler auth not yet propagated).

All endpoints that read/write data use this client instead of SQLAlchemy.
"""
import os
from functools import lru_cache
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL: str = os.environ.get("SUPABASE_URL") or "https://placeholder-url.supabase.co"
# Use the secret (service-role) key so we can bypass RLS for server-side ops
SUPABASE_KEY: str = os.environ.get("SUPABASE_SECRET_KEY") or os.environ.get("SUPABASE_KEY") or "placeholder-key"


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)
