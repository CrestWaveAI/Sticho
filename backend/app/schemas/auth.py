from pydantic import BaseModel, Field

class OTPSendRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number to send OTP to")

class OTPVerifyRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number that received the OTP")
    code: str = Field(..., description="6-digit OTP code")

class OTPVerifyResponse(BaseModel):
    success: bool = Field(..., description="Whether verification was successful")
    message: str = Field(..., description="Status message")
