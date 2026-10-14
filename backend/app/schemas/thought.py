from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class LoveThoughtCreate(BaseModel):
    content: str
    visibility: Optional[str] = "shared"  # 'shared' or 'private'

class LoveThoughtOut(BaseModel):
    id: str
    couple_id: str
    created_by: str
    author_name: Optional[str] = None
    content: str
    visibility: str
    is_favorite: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
