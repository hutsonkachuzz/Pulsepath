import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class LoveThought(Base):
    __tablename__ = "love_thoughts"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    couple_id = Column(String(64), index=True, nullable=False)
    created_by = Column(String(64), nullable=False)
    author_name = Column(String(100), nullable=True)
    content = Column(Text, nullable=False)
    visibility = Column(String(20), default="shared")  # 'shared' or 'private'
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
