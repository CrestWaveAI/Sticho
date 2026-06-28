from fastapi import APIRouter
from app.api.v1.endpoints import tailors, leads, services, locations, auth, categories, admin

api_router = APIRouter()
api_router.include_router(tailors.router, prefix="/tailors", tags=["tailors"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
