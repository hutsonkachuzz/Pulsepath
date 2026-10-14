from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_couple_user
from backend.app.models.user import User
from backend.app.models.message import Message
from backend.app.models.memory import Memory
from backend.app.schemas.chat import MessageCreate, MessageReactionToggle, MessageSaveMemory, MessageOut
from backend.app.schemas.memory import MemoryOut
from backend.app.websocket.manager import manager

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/messages", response_model=List[MessageOut])
def get_messages(
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    messages = db.query(Message).filter(
        Message.couple_id == current_user.couple_id
    ).order_by(Message.created_at.asc()).all()
    return messages

@router.post("/messages", response_model=MessageOut)
async def create_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    new_msg = Message(
        couple_id=current_user.couple_id,
        sender_id=current_user.id,
        sender_name=current_user.name,
        content=content,
        reply_to_id=payload.reply_to_id,
        reactions={},
        is_saved_as_memory=False,
        created_at=datetime.utcnow()
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    # Broadcast to couple in real time
    msg_dict = {
        "type": "new_message",
        "message": {
            "id": new_msg.id,
            "couple_id": new_msg.couple_id,
            "coupleId": new_msg.couple_id,
            "sender_id": new_msg.sender_id,
            "senderId": new_msg.sender_id,
            "sender_name": new_msg.sender_name,
            "senderName": new_msg.sender_name,
            "content": new_msg.content,
            "reply_to_id": new_msg.reply_to_id,
            "replyToId": new_msg.reply_to_id,
            "reactions": new_msg.reactions or {},
            "is_saved_as_memory": new_msg.is_saved_as_memory,
            "isSavedAsMemory": new_msg.is_saved_as_memory,
            "seen_at": new_msg.seen_at.isoformat() if new_msg.seen_at else None,
            "seenAt": new_msg.seen_at.isoformat() if new_msg.seen_at else None,
            "created_at": new_msg.created_at.isoformat() if new_msg.created_at else None,
            "createdAt": new_msg.created_at.isoformat() if new_msg.created_at else None
        }
    }
    await manager.broadcast_to_couple(current_user.couple_id, msg_dict)

    return new_msg

@router.post("/messages/{message_id}/reaction", response_model=MessageOut)
async def toggle_reaction(
    message_id: str,
    payload: MessageReactionToggle,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    msg = db.query(Message).filter(
        Message.id == message_id,
        Message.couple_id == current_user.couple_id
    ).first()

    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    reactions = dict(msg.reactions or {})
    emoji = payload.emoji
    users = list(reactions.get(emoji, []))

    if current_user.id in users:
        users.remove(current_user.id)
    else:
        users.append(current_user.id)

    if users:
        reactions[emoji] = users
    else:
        reactions.pop(emoji, None)

    msg.reactions = reactions
    db.commit()
    db.refresh(msg)

    # Broadcast reaction event
    await manager.broadcast_to_couple(
        current_user.couple_id,
        {
            "type": "reaction_update",
            "message_id": msg.id,
            "reactions": reactions
        }
    )

    return msg

@router.post("/messages/{message_id}/save-memory", response_model=MemoryOut)
async def save_as_memory(
    message_id: str,
    payload: MessageSaveMemory,
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    msg = db.query(Message).filter(
        Message.id == message_id,
        Message.couple_id == current_user.couple_id
    ).first()

    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.is_saved_as_memory = True
    
    title = payload.custom_title or f"A Special Note from {msg.sender_name} ❤️"
    new_memory = Memory(
        couple_id=current_user.couple_id,
        created_by=msg.sender_id,
        author_name=msg.sender_name,
        title=title,
        description=f'"{msg.content}"',
        date=msg.created_at.strftime("%Y-%m-%d") if msg.created_at else datetime.utcnow().strftime("%Y-%m-%d"),
        mood="Loved",
        mood_emoji="❤️",
        tags=["Saved From Chat", "Love Note"],
        images=[],
        is_favorite=True,
        created_at=datetime.utcnow()
    )
    db.add(new_memory)
    db.commit()
    db.refresh(msg)
    db.refresh(new_memory)

    # Broadcast memory saved badge update
    await manager.broadcast_to_couple(
        current_user.couple_id,
        {
            "type": "message_saved_memory",
            "message_id": msg.id
        }
    )

    return new_memory

@router.post("/messages/seen")
async def mark_messages_seen(
    current_user: User = Depends(get_current_couple_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    unseen = db.query(Message).filter(
        Message.couple_id == current_user.couple_id,
        Message.sender_id != current_user.id,
        Message.seen_at == None
    ).all()

    if unseen:
        for m in unseen:
            m.seen_at = now
        db.commit()

        await manager.broadcast_to_couple(
            current_user.couple_id,
            {
                "type": "messages_seen",
                "seen_by": current_user.id,
                "seen_at": now.isoformat()
            }
        )

    return {"status": "ok", "count": len(unseen)}
