import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(64), unique=True, index=True, nullable=False)
    morning_time = Column(String(10), default="08:00")
    morning_msg = Column(Text, default="Good morning ❤️ It's time to wake up. Your favorite person is waiting for another beautiful day with you.")
    morning_enabled = Column(Boolean, default=True)
    bedtime_time = Column(String(10), default="23:15")
    bedtime_msg = Column(Text, default="Good night ❤️ Close your eyes and rest. Tomorrow we create another memory.")
    bedtime_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
