import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.core.supabase_client import get_supabase
from app.schemas.customer_auth import CustomerRegister, CustomerLogin, CustomerGoogleAuthRequest, CustomerAuthResponse
from app.core.security import hash_password, verify_password, create_token

router = APIRouter()

@router.post("/register", response_model=CustomerAuthResponse)
async def register_customer(payload: CustomerRegister):
    """
    Register a new customer account using email and password.
    """
    sb = get_supabase()
    
    # 1. Check if email is already registered
    existing = sb.table("customers").select("id").eq("email", payload.email).execute().data
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # 2. Hash password and insert customer
    hashed = hash_password(payload.password)
    customer_id = str(uuid.uuid4())
    new_customer = {
        "id": customer_id,
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hashed,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = sb.table("customers").insert(new_customer).execute().data
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create customer account")
        
    # 3. Create session token
    token = create_token({"customer_id": customer_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "customer_id": customer_id
    }

@router.post("/login", response_model=CustomerAuthResponse)
async def login_customer(payload: CustomerLogin):
    """
    Login an existing customer account using email and password.
    """
    sb = get_supabase()
    
    # 1. Fetch customer by email
    result = sb.table("customers").select("id, hashed_password").eq("email", payload.email).execute().data
    if not result:
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    customer = result[0]
    hashed_pwd = customer.get("hashed_password")
    if not hashed_pwd:
        raise HTTPException(status_code=400, detail="Account has no password set. Please use Google OAuth login.")
        
    # 2. Verify password
    if not verify_password(payload.password, hashed_pwd):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    # 3. Create session token
    token = create_token({"customer_id": customer["id"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "customer_id": customer["id"]
    }

@router.post("/google", response_model=CustomerAuthResponse)
async def google_auth_customer(payload: CustomerGoogleAuthRequest):
    """
    Register or login a customer using Google OAuth credentials.
    """
    email = payload.email
    name = payload.name or "Google Customer"
    google_id = payload.google_id
    
    if not google_id:
        raise HTTPException(status_code=400, detail="Google ID (google_id) is required")
    if not email:
        raise HTTPException(status_code=400, detail="Google account email is required")
        
    sb = get_supabase()
    
    # 1. Try to find customer by google_id
    result = sb.table("customers").select("id").eq("google_id", google_id).execute().data
    if result:
        customer_id = result[0]["id"]
    else:
        # 2. Try to find customer by email (to link account)
        result_by_email = sb.table("customers").select("id, google_id").eq("email", email).execute().data
        if result_by_email:
            customer = result_by_email[0]
            customer_id = customer["id"]
            # Link Google ID to existing account
            sb.table("customers").update({"google_id": google_id}).eq("id", customer_id).execute()
        else:
            # 3. Create new customer
            customer_id = str(uuid.uuid4())
            new_customer = {
                "id": customer_id,
                "name": name,
                "email": email,
                "google_id": google_id,
                "created_at": datetime.utcnow().isoformat()
            }
            create_result = sb.table("customers").insert(new_customer).execute().data
            if not create_result:
                raise HTTPException(status_code=500, detail="Failed to create customer via Google OAuth")
                
    # 4. Create session token
    token = create_token({"customer_id": customer_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "customer_id": customer_id
    }
