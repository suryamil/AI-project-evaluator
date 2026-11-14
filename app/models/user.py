from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

EMAIL_REGEX = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'

class UserBase(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX, example="student@university.edu")
    full_name: str = Field(..., min_length=2, example="Rahul Sharma")
    university: Optional[str] = Field(None, example="Anna University")
    role: str = "student"

class UserRegister(UserBase):
    password: str = Field(..., min_length=8, example="SecretP@ss123")

class UserLogin(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str

class UserInDB(UserBase):
    id: Optional[str] = None
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PasswordResetRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
