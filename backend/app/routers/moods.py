from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_couple_user
from backend.app.models.user import User
from backend.app.models.mood import Mood
from backend.app.schemas.mood import MoodUpdate
from backend.app.websocket.manager import manager

router = APIRouter(prefix="/moods", tags=["moods"])

@router.get("/")
def get_moods(
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    mood_records = db.query(Mood).filter(Mood.couple_id == current_user.couple_id).all()
    mood_map = {}
    for m in mood_records:
        mood_map[m.user_id] = {
            "mood": m.mood,
            "emoji": m.emoji,
            "note": m.note or "",
            "updatedAt": m.updated_at.isoformat() if m.updated_at else datetime.utcnow().isoformat()
        }
    return mood_map

@router.post("/")
async def set_my_mood(
    payload: MoodUpdate,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    existing = db.query(Mood).filter(
        Mood.couple_id == current_user.couple_id,
        Mood.user_id == current_user.id
    ).first()

    if existing:
        existing.mood = payload.mood
        existing.emoji = payload.emoji
        existing.note = payload.note or ""
        existing.updated_at = now
    else:
        new_mood = Mood(
            couple_id=current_user.couple_id,
            user_id=current_user.id,
            mood=payload.mood,
            emoji=payload.emoji,
            note=payload.note or "",
            updated_at=now
        )
        db.add(new_mood)

    db.commit()

    # Broadcast mood update to couple
    await manager.broadcast_to_couple(
        current_user.couple_id,
        {
            "type": "mood_update",
            "user_id": current_user.id,
            "mood": payload.mood,
            "emoji": payload.emoji,
            "note": payload.note or "",
            "updatedAt": now.isoformat()
        }
    )

    return get_moods(current_user=current_user, db=db)
