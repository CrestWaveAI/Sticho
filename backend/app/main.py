from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router

app = FastAPI(
    title="StitchConnect API",
    description="Hyperlocal Tailor Discovery & Lead-Generation Platform Backend",
    version="0.1.0",
)

# CORS Configuration
# In production, specify the actual frontend domains
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

import os
from fastapi.staticfiles import StaticFiles

# Setup static directory
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
os.makedirs(os.path.join(static_dir, "media"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")



@app.get("/")
async def root():
    return {
        "message": "Welcome to the StitchConnect API",
        "version": "0.1.0",
        "docs_url": "/docs"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "stitchconnect-backend",
        "version": "0.1.0"
    }
