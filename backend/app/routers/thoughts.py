from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_couple_user
from backend.app.models.user import User
from backend.app.models.thought import LoveThought
from backend.app.schemas.thought import LoveThoughtCreate, LoveThoughtOut

router = APIRouter(prefix="/thoughts", tags=["thoughts"])

@router.get("/", response_model=List[LoveThoughtOut])
def get_thoughts(
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    # Creator sees all their own thoughts (shared + private);
    # Partner sees only thoughts with visibility == 'shared'
    thoughts = db.query(LoveThought).filter(
        LoveThought.couple_id == current_user.couple_id,
        or_(
            LoveThought.createdBy == current_user.id,
            LoveThought.visibility == "shared"
        ) if hasattr(LoveThought, "createdBy") else or_(
            LoveThought.created_by == current_user.id,
            LoveThought.visibility == "shared"
        )
    ).order_by(LoveThought.created_at.desc()).all()
    return thoughts

@router.post("/", response_model=LoveThoughtOut)
def create_thought(
    payload: LoveThoughtCreate,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    new_thought = LoveThought(
        couple_id=current_user.couple_id,
        created_by=current_user.id,
        author_name=current_user.name,
        content=payload.content.strip(),
        visibility=payload.visibility or "shared",
        is_favorite=False,
        created_at=datetime.utcnow()
    )
    db.add(new_thought)
    db.commit()
    db.refresh(new_thought)
    return new_thought

@router.delete("/{thought_id}")
def delete_thought(
    thought_id: str,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    thought = db.query(LoveThought).filter(
        LoveThought.id == thought_id,
        LoveThought.couple_id == current_user.couple_id
    ).first()

    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")
    
    # Only creator can delete
    if thought.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this thought")

    db.delete(thought)
    db.commit()
    return {"status": "success", "message": "Thought deleted"}
