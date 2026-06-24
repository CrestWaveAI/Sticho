from fastapi import APIRouter
from app.api.v1.endpoints import tailors, leads

api_router = APIRouter()
api_router.include_router(tailors.router, prefix="/tailors", tags=["tailors"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
