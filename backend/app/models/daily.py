import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, UniqueConstraint
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class DailyQuestion(Base):
    __tablename__ = "daily_questions"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    date = Column(String(20), unique=True, index=True, nullable=False)  # YYYY-MM-DD
    question_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class DailyAnswer(Base):
    __tablename__ = "daily_answers"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    couple_id = Column(String(64), index=True, nullable=False)
    date = Column(String(20), index=True, nullable=False)  # YYYY-MM-DD
    user_id = Column(String(64), index=True, nullable=False)
    author_name = Column(String(100), nullable=False)
    answer_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("couple_id", "date", "user_id", name="uq_couple_date_user_answer"),
    )
