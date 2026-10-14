import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Couple(Base):
    __tablename__ = "couples"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    couple_code = Column(String(32), unique=True, index=True, nullable=False)
    user_one_id = Column(String(64), nullable=False)
    user_two_id = Column(String(64), nullable=True)
    user_one_name = Column(String(100), nullable=True)
    user_two_name = Column(String(100), nullable=True)
    nickname = Column(String(150), nullable=True)
    description = Column(String(500), nullable=True)
    relationship_start_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
