from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_couple_user
from backend.app.models.user import User
from backend.app.models.letter import LoveLetter
from backend.app.schemas.letter import LoveLetterCreate, LoveLetterOut

router = APIRouter(prefix="/letters", tags=["letters"])

@router.get("/", response_model=List[LoveLetterOut])
def get_letters(
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    letters = db.query(LoveLetter).filter(
        LoveLetter.couple_id == current_user.couple_id
    ).order_by(LoveLetter.created_at.desc()).all()
    return letters

@router.post("/", response_model=LoveLetterOut)
def create_letter(
    payload: LoveLetterCreate,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    new_letter = LoveLetter(
        couple_id=current_user.couple_id,
        created_by=current_user.id,
        author_name=current_user.name,
        title=payload.title.strip(),
        content=payload.content.strip(),
        visibility=payload.visibility or "shared",
        opened_at=None,
        created_at=datetime.utcnow()
    )
    db.add(new_letter)
    db.commit()
    db.refresh(new_letter)
    return new_letter

@router.put("/{letter_id}/open", response_model=LoveLetterOut)
def open_letter(
    letter_id: str,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    letter = db.query(LoveLetter).filter(
        LoveLetter.id == letter_id,
        LoveLetter.couple_id == current_user.couple_id
    ).first()

    if not letter:
        raise HTTPException(status_code=404, detail="Love letter not found")

    if not letter.opened_at:
        letter.opened_at = datetime.utcnow()
        db.commit()
        db.refresh(letter)

    return letter
