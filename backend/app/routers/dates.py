from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_couple_user
from backend.app.models.user import User
from backend.app.models.date import SpecialDate
from backend.app.schemas.date import SpecialDateCreate, SpecialDateOut

router = APIRouter(prefix="/dates", tags=["dates"])

@router.get("/", response_model=List[SpecialDateOut])
def get_dates(
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    dates = db.query(SpecialDate).filter(
        SpecialDate.couple_id == current_user.couple_id
    ).order_by(SpecialDate.date.asc()).all()
    return dates

@router.post("/", response_model=SpecialDateOut)
def create_date(
    payload: SpecialDateCreate,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    new_date = SpecialDate(
        couple_id=current_user.couple_id,
        title=payload.title.strip(),
        date=payload.date,
        category=payload.category or "anniversary",
        description=payload.description,
        reminder_enabled=payload.reminder_enabled if payload.reminder_enabled is not None else True,
        created_at=datetime.utcnow()
    )
    db.add(new_date)
    db.commit()
    db.refresh(new_date)
    return new_date

@router.delete("/{date_id}")
def delete_date(
    date_id: str,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    item = db.query(SpecialDate).filter(
        SpecialDate.id == date_id,
        SpecialDate.couple_id == current_user.couple_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Special date not found")

    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Special date deleted"}
