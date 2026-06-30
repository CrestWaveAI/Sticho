# Stichoh: Simulated Services & Production Hookups Guide

This document catalogs all simulated or mocked services currently running in the Stichoh backend, describes their local testing implementations, and outlines the steps, libraries, and configurations required to transition them to production integrations.

---

## 1. Notification Delivery (SMS / WhatsApp)

### Current Implementation
- **File:** [notification.py](file:///Users/amankumar/Aman/Sticho/backend/app/services/notification.py)
- **Mechanism:** When tailors opt-in to alerts (`notifications_enabled = True`), the `NotificationService.notify_event` method formats alert payloads for profile views, contact number clicks, and lead submissions. It then logs these simulated alerts to [mock_notifications.log](file:///Users/amankumar/Aman/Sticho/docs/mock_notifications.log).
- **Execution:** Triggered asynchronously via FastAPI `BackgroundTasks` to avoid slowing down API responses.

### Production Transition Plan
To connect mock notifications to real delivery networks:

#### Options
1. **Twilio SMS / Messaging API:**
   - Install dependencies: `uv add twilio`
   - Use Twilio's client to dispatch SMS alerts to tailors.
2. **WhatsApp Business Cloud API:**
   - Use direct `httpx` POST requests to the Meta Graph API using WhatsApp Business templates.

#### Required Environment Keys (`.env`)
```bash
# Twilio Integration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_purchased_number

# Meta WhatsApp Integration
META_WHATSAPP_TOKEN=your_meta_access_token
META_WHATSAPP_PHONE_NUMBER_ID=your_sender_phone_number_id
```

#### Production Code Pattern (Twilio SMS Example)
```python
from twilio.rest import Client

def send_real_sms(to_number: str, body: str):
    client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
    client.messages.create(
        body=body,
        from_=os.getenv("TWILIO_PHONE_NUMBER"),
        to=to_number
    )
```

---

## 2. Google OAuth Token Verification

### Current Implementation
- **Files:**
  - [auth.py (Tailors)](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/auth.py)
  - [customer_auth.py (Customers)](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/customer_auth.py)
- **Mechanism:** The `/google` authentication routes accept a direct payload of `email`, `name`, and `google_id` from the client without token verification, treating it as trusted login parameters.

### Production Transition Plan
In production, accepting raw user metadata directly from client requests is a security risk. The frontend must send a Google ID Token (JWT) acquired from the Google Identity Services SDK, and the backend must verify this token cryptographically.

#### Required Dependencies
```bash
uv add google-auth
```

#### Required Environment Keys (`.env`)
```bash
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

#### Production Code Pattern (JWT ID Token Verification)
```python
from google.oauth2 import id_token
from google.auth.transport import requests

def verify_google_token(token: str) -> dict:
    try:
        # Verify the JWT signature against Google's public certificates
        id_info = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            os.getenv("GOOGLE_CLIENT_ID")
        )
        # Returns user claims (sub/google_id, email, name, picture)
        return id_info
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google ID Token: {e}")
```

---

## 3. Portfolio Asset Storage & CDN

### Current Implementation
- **File:** [tailors.py](file:///Users/amankumar/Aman/Sticho/backend/app/api/v1/endpoints/tailors.py)
- **Mechanism:** Checks if Cloudinary environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are set. If missing, it falls back to saving files directly to local storage inside `/static/media/`.

### Production Transition Plan
The backend already supports a complete Cloudinary SDK integration. To switch fully to CDN hosting in staging/production, configure the correct credentials in the host's environment variables.

#### Required Environment Keys (`.env`)
```bash
CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret
```
Once these keys are populated in the deployment environment, the backend automatically bypasses the local storage fallback and uploads files to Cloudinary.
