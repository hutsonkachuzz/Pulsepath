from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_couple_user
from backend.app.models.user import User
from backend.app.models.memory import Memory
from backend.app.schemas.memory import MemoryCreate, MemoryUpdate, MemoryOut

router = APIRouter(prefix="/memories", tags=["memories"])

@router.get("/", response_model=List[MemoryOut])
def get_memories(
    search: Optional[str] = None,
    mood: Optional[str] = None,
    only_favorites: Optional[bool] = False,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    query = db.query(Memory).filter(Memory.couple_id == current_user.couple_id)

    if only_favorites:
        query = query.filter(Memory.is_favorite == True)
    
    if mood and mood != "ALL":
        query = query.filter(Memory.mood == mood)
    
    memories = query.order_by(Memory.date.desc(), Memory.created_at.desc()).all()

    if search:
        s = search.lower()
        memories = [
            m for m in memories
            if (s in m.title.lower() or s in m.description.lower() or any(s in str(t).lower() for t in (m.tags or [])))
        ]

    return memories

@router.post("/", response_model=MemoryOut)
def create_memory(
    payload: MemoryCreate,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    new_memory = Memory(
        couple_id=current_user.couple_id,
        created_by=current_user.id,
        author_name=current_user.name,
        title=payload.title,
        description=payload.description,
        date=payload.date,
        location=payload.location,
        mood=payload.mood or "Loved",
        mood_emoji=payload.mood_emoji or "❤️",
        tags=payload.tags or [],
        images=payload.images or [],
        is_favorite=payload.is_favorite or False,
        created_at=datetime.utcnow()
    )
    db.add(new_memory)
    db.commit()
    db.refresh(new_memory)
    return new_memory

@router.put("/{memory_id}", response_model=MemoryOut)
def update_memory(
    memory_id: str,
    payload: MemoryUpdate,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    memory = db.query(Memory).filter(
        Memory.id == memory_id,
        Memory.couple_id == current_user.couple_id
    ).first()

    if not memory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")

    if payload.title is not None:
        memory.title = payload.title
    if payload.description is not None:
        memory.description = payload.description
    if payload.date is not None:
        memory.date = payload.date
    if payload.location is not None:
        memory.location = payload.location
    if payload.mood is not None:
        memory.mood = payload.mood
    if payload.mood_emoji is not None:
        memory.mood_emoji = payload.mood_emoji
    if payload.tags is not None:
        memory.tags = payload.tags
    if payload.images is not None:
        memory.images = payload.images
    if payload.is_favorite is not None:
        memory.is_favorite = payload.is_favorite

    memory.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(memory)
    return memory

@router.delete("/{memory_id}")
def delete_memory(
    memory_id: str,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    memory = db.query(Memory).filter(
        Memory.id == memory_id,
        Memory.couple_id == current_user.couple_id
    ).first()

    if not memory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")

    db.delete(memory)
    db.commit()
    return {"status": "success", "message": "Memory deleted"}
