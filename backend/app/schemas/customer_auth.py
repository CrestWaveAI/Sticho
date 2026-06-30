from pydantic import BaseModel, Field

class CustomerRegister(BaseModel):
    email: str = Field(..., description="Email address for the customer account")
    password: str = Field(..., min_length=6, description="Password (minimum 6 characters)")
    name: str = Field(..., description="Name of the customer")

class CustomerLogin(BaseModel):
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")

class CustomerGoogleAuthRequest(BaseModel):
    google_token: str | None = Field(None, description="Google ID Token")
    email: str | None = Field(None, description="Google account email (for mocked/testing auth)")
    name: str | None = Field(None, description="Google account name (for mocked/testing auth)")
    google_id: str | None = Field(None, description="Google account ID (for mocked/testing auth)")

class CustomerAuthResponse(BaseModel):
    access_token: str = Field(..., description="Signed access token for session management")
    token_type: str = Field("bearer", description="Token type")
    customer_id: str = Field(..., description="Authenticated customer account ID")
