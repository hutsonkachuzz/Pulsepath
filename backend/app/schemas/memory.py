from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class MemoryCreate(BaseModel):
    title: str
    description: str
    date: str
    location: Optional[str] = None
    mood: Optional[str] = "Loved"
    mood_emoji: Optional[str] = "❤️"
    tags: Optional[List[str]] = []
    images: Optional[List[str]] = []
    is_favorite: Optional[bool] = False

class MemoryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    mood: Optional[str] = None
    mood_emoji: Optional[str] = None
    tags: Optional[List[str]] = None
    images: Optional[List[str]] = None
    is_favorite: Optional[bool] = None

class MemoryOut(BaseModel):
    id: str
    couple_id: str
    created_by: str
    author_name: Optional[str] = None
    title: str
    description: str
    date: str
    location: Optional[str] = None
    mood: Optional[str] = "Loved"
    mood_emoji: Optional[str] = "❤️"
    tags: List[str] = []
    images: List[str] = []
    is_favorite: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
