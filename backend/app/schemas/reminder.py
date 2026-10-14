from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ReminderUpdate(BaseModel):
    morning_time: Optional[str] = None
    morning_msg: Optional[str] = None
    morning_enabled: Optional[bool] = None
    bedtime_time: Optional[str] = None
    bedtime_msg: Optional[str] = None
    bedtime_enabled: Optional[bool] = None

class ReminderOut(BaseModel):
    user_id: str
    morning_time: str
    morning_msg: str
    morning_enabled: bool
    bedtime_time: str
    bedtime_msg: str
    bedtime_enabled: bool
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
