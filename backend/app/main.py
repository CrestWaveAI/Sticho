import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.router import api_router

# Initialize Sentry if DSN is set in the environment
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )

app = FastAPI(
    title="StitchConnect API",
    description="Hyperlocal Tailor Discovery & Lead-Generation Platform Backend",
    version="0.1.0",
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://stichoh.vercel.app",
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

# Setup static directory for portfolio image uploads
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
os.makedirs(os.path.join(static_dir, "media"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def root():
    return {
        "message": "Welcome to the StitchConnect API",
        "version": "0.1.0",
        "docs_url": "/docs",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "stitchconnect-backend",
        "version": "0.1.0",
    }


@app.get("/trigger-error")
async def trigger_error():
    """Trigger a division by zero error for testing Sentry integration."""
    return 1 / 0

