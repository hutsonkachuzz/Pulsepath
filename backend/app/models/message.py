import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    couple_id = Column(String(64), index=True, nullable=False)
    sender_id = Column(String(64), nullable=False)
    sender_name = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    reply_to_id = Column(String(64), nullable=True)
    reactions = Column(JSON, default=dict)
    is_saved_as_memory = Column(Boolean, default=False)
    seen_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
