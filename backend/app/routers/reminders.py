from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.reminder import Reminder
from backend.app.schemas.reminder import ReminderUpdate, ReminderOut

router = APIRouter(prefix="/reminders", tags=["reminders"])

@router.get("/", response_model=ReminderOut)
def get_user_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = db.query(Reminder).filter(Reminder.user_id == current_user.id).first()
    if not reminder:
        reminder = Reminder(
            user_id=current_user.id,
            morning_time="08:00",
            morning_msg="Good morning ❤️ It's time to wake up. Your favorite person is waiting for another beautiful day with you.",
            morning_enabled=True,
            bedtime_time="23:15",
            bedtime_msg="Good night ❤️ Close your eyes and rest. Tomorrow we create another memory.",
            bedtime_enabled=True,
            updated_at=datetime.utcnow()
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
    
    return reminder

@router.put("/", response_model=ReminderOut)
def update_user_reminders(
    payload: ReminderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = db.query(Reminder).filter(Reminder.user_id == current_user.id).first()
    if not reminder:
        reminder = Reminder(user_id=current_user.id)
        db.add(reminder)

    if payload.morning_time is not None:
        reminder.morning_time = payload.morning_time
    if payload.morning_msg is not None:
        reminder.morning_msg = payload.morning_msg
    if payload.morning_enabled is not None:
        reminder.morning_enabled = payload.morning_enabled
    if payload.bedtime_time is not None:
        reminder.bedtime_time = payload.bedtime_time
    if payload.bedtime_msg is not None:
        reminder.bedtime_msg = payload.bedtime_msg
    if payload.bedtime_enabled is not None:
        reminder.bedtime_enabled = payload.bedtime_enabled

    reminder.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(reminder)
    return reminder
