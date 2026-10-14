from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    dob: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DemoLogin(BaseModel):
    role: str = "eren"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    nickname: Optional[str] = None
    avatar: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    couple_id: Optional[str] = None
    dob: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
