import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, UniqueConstraint
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Mood(Base):
    __tablename__ = "moods"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    couple_id = Column(String(64), index=True, nullable=False)
    user_id = Column(String(64), index=True, nullable=False)
    mood = Column(String(50), default="Loved")
    emoji = Column(String(20), default="❤️")
    note = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("couple_id", "user_id", name="uq_couple_user_mood"),
    )
