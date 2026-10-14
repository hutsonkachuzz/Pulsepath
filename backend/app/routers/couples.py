from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user, generate_couple_code
from backend.app.models.user import User
from backend.app.models.couple import Couple
from backend.app.schemas.couple import CoupleCreate, CoupleJoin, CoupleOut

router = APIRouter(prefix="/couples", tags=["couples"])

@router.post("/create", response_model=CoupleOut)
def create_couple_space(
    payload: CoupleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Generate unique couple code
    while True:
        code = generate_couple_code()
        if not db.query(Couple).filter(Couple.couple_code == code).first():
            break

    nickname = payload.nickname or f"{current_user.name}'s Space"
    new_couple = Couple(
        couple_code=code,
        user_one_id=current_user.id,
        user_one_name=current_user.name,
        nickname=nickname,
        description=payload.description or "Two hearts beating as one.",
        relationship_start_date=payload.relationship_start_date,
        created_at=datetime.utcnow()
    )
    db.add(new_couple)
    db.commit()
    db.refresh(new_couple)

    # Assign to user
    current_user.couple_id = new_couple.id
    db.commit()

    return new_couple

@router.post("/join", response_model=CoupleOut)
def join_couple_space(
    payload: CoupleJoin,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    code = payload.couple_code.strip().upper()
    couple = db.query(Couple).filter(Couple.couple_code == code).first()
    if not couple:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Couple space code not found. Please check with your partner.",
        )
    
    if couple.user_two_id and couple.user_two_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This couple space already has two connected partners.",
        )
    
    if couple.user_one_id == current_user.id:
        return couple

    couple.user_two_id = current_user.id
    couple.user_two_name = current_user.name
    current_user.couple_id = couple.id
    db.commit()
    db.refresh(couple)

    return couple

@router.get("/current", response_model=CoupleOut)
def get_current_couple(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.couple_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not connected to a couple space.",
        )
    
    couple = db.query(Couple).filter(Couple.id == current_user.couple_id).first()
    if not couple:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Couple space not found.",
        )
    
    return couple
