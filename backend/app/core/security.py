import hmac
import hashlib
import json
import base64
import time

SECRET_KEY = "super-secret-key-change-in-production"

def hash_password(password: str) -> str:
    """
    Generate a secure password hash using PBKDF2-HMAC-SHA256 from Python standard library.
    """
    salt = b"sticho-salt-secure"
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return dk.hex()

def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a password against its hash.
    """
    return hash_password(password) == hashed

def create_token(payload: dict) -> str:
    """
    Create a signed JWT-like token using standard library HMAC.
    """
    # 24-hour expiration by default
    if "exp" not in payload:
        payload["exp"] = int(time.time() + 86400)
        
    payload_str = json.dumps(payload)
    payload_b64 = base64.urlsafe_b64encode(payload_str.encode()).decode().rstrip("=")
    
    sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    
    return f"{payload_b64}.{sig_b64}"

def verify_token(token: str) -> dict | None:
    """
    Verify and decode a signed session token.
    """
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
            
        payload_b64, sig_b64 = parts
        
        # Verify HMAC signature
        expected_sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
        
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None
            
        # Add padding back to base64 payload if needed
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += "=" * (4 - rem)
            
        payload_str = base64.urlsafe_b64decode(payload_b64.encode()).decode()
        payload = json.loads(payload_str)
        
        # Check token expiration
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None
