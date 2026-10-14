from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class SpecialDateCreate(BaseModel):
    title: str
    date: str
    category: Optional[str] = "anniversary"
    description: Optional[str] = None
    reminder_enabled: Optional[bool] = True

class SpecialDateOut(BaseModel):
    id: str
    couple_id: str
    title: str
    date: str
    category: str
    description: Optional[str] = None
    reminder_enabled: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
