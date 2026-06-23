from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
