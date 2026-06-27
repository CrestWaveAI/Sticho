import random
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from app.core.supabase_client import get_supabase
from app.schemas.auth import OTPSendRequest, OTPVerifyRequest, OTPVerifyResponse

router = APIRouter()

@router.post("/otp/send")
async def send_otp(request: OTPSendRequest):
    """
    Generate and send an OTP code to a phone number.
    Blocks if the phone number is already registered.
    """
    sb = get_supabase()
    
    # 1. Check if phone number is already registered under any tailor
    tailors = sb.table("tailors").select("id").eq("contact_number", request.phone_number).execute().data
    if tailors:
        raise HTTPException(status_code=400, detail="Phone number already registered")
        
    # 2. Generate a random 6-digit OTP code
    code = f"{random.randint(100000, 999999)}"
    
    # 3. Expiration time (5 minutes from now)
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    # 4. Save to otp_codes table
    otp_data = {
        "id": str(uuid.uuid4()),
        "phone_number": request.phone_number,
        "code": code,
        "expires_at": expires_at.isoformat(),
        "is_verified": False,
        "created_at": datetime.utcnow().isoformat()
    }
    
    sb.table("otp_codes").insert(otp_data).execute()
    
    # Return success response (include OTP in payload for local dev/testing simplicity)
    return {
        "message": "OTP sent successfully",
        "phone_number": request.phone_number,
        "otp": code
    }

@router.post("/otp/verify", response_model=OTPVerifyResponse)
async def verify_otp(request: OTPVerifyRequest):
    """
    Verify the OTP code received by a phone number.
    """
    sb = get_supabase()
    
    # Fetch active codes for the phone number
    results = (
        sb.table("otp_codes")
        .select("*")
        .eq("phone_number", request.phone_number)
        .eq("code", request.code)
        .execute()
        .data
    )
    
    if not results:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    # Pick the latest matching OTP record
    record = results[-1]
    
    # Check expiration
    expires_at_str = record.get("expires_at")
    try:
        clean_str = expires_at_str.replace("Z", "").split("+")[0]
        expires_at = datetime.fromisoformat(clean_str)
    except Exception:
        expires_at = datetime.utcnow()
        
    if expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP code has expired")
        
    # Mark verified
    sb.table("otp_codes").update({"is_verified": True}).eq("id", record["id"]).execute()
    
    return {
        "success": True,
        "message": "OTP verified successfully"
    }
