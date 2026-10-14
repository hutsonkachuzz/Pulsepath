from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class CoupleCreate(BaseModel):
    relationship_start_date: str
    nickname: Optional[str] = None
    description: Optional[str] = "Two hearts beating as one."

class CoupleJoin(BaseModel):
    couple_code: str

class CoupleOut(BaseModel):
    id: str
    couple_code: str
    user_one_id: str
    user_two_id: Optional[str] = None
    user_one_name: Optional[str] = None
    user_two_name: Optional[str] = None
    nickname: Optional[str] = None
    description: Optional[str] = None
    relationship_start_date: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
