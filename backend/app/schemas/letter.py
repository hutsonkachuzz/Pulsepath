from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class LoveLetterCreate(BaseModel):
    title: str
    content: str
    visibility: Optional[str] = "shared"

class LoveLetterOut(BaseModel):
    id: str
    couple_id: str
    created_by: str
    author_name: Optional[str] = None
    title: str
    content: str
    visibility: str
    opened_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
