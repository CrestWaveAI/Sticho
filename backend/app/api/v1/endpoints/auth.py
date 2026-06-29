import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.core.supabase_client import get_supabase
from app.schemas.auth import TailorRegister, TailorLogin, GoogleAuthRequest, AuthResponse
from app.core.security import hash_password, verify_password, create_token

router = APIRouter()

@router.post("/register", response_model=AuthResponse)
async def register_tailor(payload: TailorRegister):
    """
    Register a new tailor account using email and password.
    """
    sb = get_supabase()
    
    # 1. Check if email is already registered
    existing = sb.table("tailors").select("id").eq("email", payload.email).execute().data
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # 2. Hash password and insert tailor
    hashed = hash_password(payload.password)
    tailor_id = str(uuid.uuid4())
    new_tailor = {
        "id": tailor_id,
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hashed,
        "contact_number": payload.contact_number,
        "is_verified": False,
        "rating": 0.0,
        "reviews_count": 0,
        "whatsapp_clicks": 0,
        "call_clicks": 0,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = sb.table("tailors").insert(new_tailor).execute().data
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create tailor account")
        
    # 3. Create session token
    token = create_token({"tailor_id": tailor_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "tailor_id": tailor_id
    }

@router.post("/login", response_model=AuthResponse)
async def login_tailor(payload: TailorLogin):
    """
    Login an existing tailor account using email and password.
    """
    sb = get_supabase()
    
    # 1. Fetch tailor by email
    result = sb.table("tailors").select("id, hashed_password").eq("email", payload.email).execute().data
    if not result:
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    tailor = result[0]
    hashed_pwd = tailor.get("hashed_password")
    if not hashed_pwd:
        raise HTTPException(status_code=400, detail="Account has no password set. Please use Google OAuth login.")
        
    # 2. Verify password
    if not verify_password(payload.password, hashed_pwd):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    # 3. Create session token
    token = create_token({"tailor_id": tailor["id"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "tailor_id": tailor["id"]
    }

@router.post("/google", response_model=AuthResponse)
async def google_auth(payload: GoogleAuthRequest):
    """
    Register or login a tailor using Google OAuth credentials.
    """
    # For local testing simplicity, we accept mock credentials
    email = payload.email
    name = payload.name or "Google Tailor"
    google_id = payload.google_id
    
    if not google_id:
        raise HTTPException(status_code=400, detail="Google ID (google_id) is required")
    if not email:
        raise HTTPException(status_code=400, detail="Google account email is required")
        
    sb = get_supabase()
    
    # 1. Try to find tailor by google_id
    result = sb.table("tailors").select("id").eq("google_id", google_id).execute().data
    if result:
        tailor_id = result[0]["id"]
    else:
        # 2. Try to find tailor by email (to link account)
        result_by_email = sb.table("tailors").select("id, google_id").eq("email", email).execute().data
        if result_by_email:
            tailor = result_by_email[0]
            tailor_id = tailor["id"]
            # Link Google ID to existing account
            sb.table("tailors").update({"google_id": google_id}).eq("id", tailor_id).execute()
        else:
            # 3. Create new tailor
            tailor_id = str(uuid.uuid4())
            new_tailor = {
                "id": tailor_id,
                "name": name,
                "email": email,
                "google_id": google_id,
                "is_verified": False,
                "rating": 0.0,
                "reviews_count": 0,
                "whatsapp_clicks": 0,
                "call_clicks": 0,
                "created_at": datetime.utcnow().isoformat()
            }
            create_result = sb.table("tailors").insert(new_tailor).execute().data
            if not create_result:
                raise HTTPException(status_code=500, detail="Failed to create tailor via Google OAuth")
                
    # 4. Create session token
    token = create_token({"tailor_id": tailor_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "tailor_id": tailor_id
    }
