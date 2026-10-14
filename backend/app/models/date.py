import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class SpecialDate(Base):
    __tablename__ = "special_dates"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    couple_id = Column(String(64), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    date = Column(String(100), nullable=False)
    category = Column(String(50), default="anniversary")
    description = Column(Text, nullable=True)
    reminder_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
