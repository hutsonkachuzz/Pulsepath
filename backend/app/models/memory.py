import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Memory(Base):
    __tablename__ = "memories"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    couple_id = Column(String(64), index=True, nullable=False)
    created_by = Column(String(64), nullable=False)
    author_name = Column(String(100), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    date = Column(String(50), nullable=False)
    location = Column(String(255), nullable=True)
    mood = Column(String(50), default="Loved")
    mood_emoji = Column(String(20), default="❤️")
    tags = Column(JSON, default=list)
    images = Column(JSON, default=list)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
