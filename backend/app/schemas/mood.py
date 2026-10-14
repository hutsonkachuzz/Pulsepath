from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class MoodUpdate(BaseModel):
    mood: str
    emoji: str
    note: Optional[str] = ""

class MoodOut(BaseModel):
    id: str
    couple_id: str
    user_id: str
    mood: str
    emoji: str
    note: Optional[str] = ""
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
