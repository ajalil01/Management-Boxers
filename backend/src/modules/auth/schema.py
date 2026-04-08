from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AuthResponseModel(BaseModel):
    success: bool
    message: str
    data: TokenResponse | None

# New schema for user response
class UserInfoResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    full_name: Optional[str] = None
    created_at: Optional[datetime] = None
    # Add other common fields as needed

class CurrentUserResponse(BaseModel):
    success: bool
    message: str
    data: Optional[UserInfoResponse] = None

    