import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class LoveLetter(Base):
    __tablename__ = "love_letters"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    couple_id = Column(String(64), index=True, nullable=False)
    created_by = Column(String(64), nullable=False)
    author_name = Column(String(100), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    visibility = Column(String(20), default="shared")
    opened_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
