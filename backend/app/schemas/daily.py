from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class DailyAnswerCreate(BaseModel):
    answer_text: str

class DailyAnswerItem(BaseModel):
    authorName: str
    text: str
    timestamp: str

class DailyQuestionResponse(BaseModel):
    id: Optional[str] = None
    date: str
    question: str
    answers: Dict[str, DailyAnswerItem] = {}
