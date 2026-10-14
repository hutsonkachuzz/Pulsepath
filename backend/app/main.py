import os
import json
import logging
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import init_db, SessionLocal
from backend.app.core.security import decode_access_token
from backend.app.models.user import User
from backend.app.models.message import Message
from backend.app.websocket.manager import manager
from backend.seed import seed_demo_data

# Import routers
from backend.app.routers.auth import router as auth_router
from backend.app.routers.couples import router as couples_router
from backend.app.routers.memories import router as memories_router
from backend.app.routers.chat import router as chat_router
from backend.app.routers.thoughts import router as thoughts_router
from backend.app.routers.letters import router as letters_router
from backend.app.routers.dates import router as dates_router
from backend.app.routers.daily import router as daily_router
from backend.app.routers.moods import router as moods_router
from backend.app.routers.reminders import router as reminders_router
from backend.app.routers.uploads import router as uploads_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pulsepath")

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Request, status

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="PulsePath - Production Full-Stack Couple Companion API"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if isinstance(settings.BACKEND_CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production Security Headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Static Files for Uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(couples_router, prefix=settings.API_V1_STR)
app.include_router(memories_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(thoughts_router, prefix=settings.API_V1_STR)
app.include_router(letters_router, prefix=settings.API_V1_STR)
app.include_router(dates_router, prefix=settings.API_V1_STR)
app.include_router(daily_router, prefix=settings.API_V1_STR)
app.include_router(moods_router, prefix=settings.API_V1_STR)
app.include_router(reminders_router, prefix=settings.API_V1_STR)
app.include_router(uploads_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing database...")
    init_db()
    try:
        seed_demo_data()
    except Exception as e:
        logger.warning(f"Demo seed notice: {e}")
    logger.info("PulsePath Backend initialized successfully!")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PulsePath Backend",
        "timestamp": datetime.utcnow().isoformat()
    }

# ==============================================================================
# WEBSOCKET REAL-TIME ENDPOINT
# ==============================================================================
@app.websocket("/ws/chat/{couple_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    couple_id: str,
    token: str = Query(None)
):
    # Verify JWT or Demo Token
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = None
    if token and token.startswith("demo_token_"):
        user_id = "user_eren_101" if ("eren" in token or "leo" in token) else "user_mikasa_202"
    elif token and token.startswith("fb_"):
        user_id = token.replace("fb_", "")
    else:
        user_id = decode_access_token(token)

    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    db: Session = SessionLocal()
    user = None
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user and token and token.startswith("demo_token_"):
            role = "eren" if ("eren" in token or "leo" in token) else "mikasa"
            email = "eren@pulsepath.love" if role == "eren" else "mikasa@pulsepath.love"
            user = db.query(User).filter(User.email == email).first()
    finally:
        db.close()

    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    if user.couple_id and couple_id != user.couple_id and couple_id != "demo_couple_123":
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, couple_id, user.id, user.name)

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                data = json.loads(data_text)
            except json.JSONDecodeError:
                continue

            event_type = data.get("type")

            if event_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

            elif event_type == "typing":
                # Broadcast typing indicator to partner
                await manager.broadcast_to_couple(
                    couple_id,
                    {
                        "type": "typing",
                        "user_id": user.id,
                        "user_name": user.name,
                        "is_typing": bool(data.get("is_typing", False))
                    },
                    exclude_socket=websocket
                )

            elif event_type == "send_message":
                content = str(data.get("content", "")).strip()
                if not content:
                    continue

                reply_to_id = data.get("reply_to_id")
                db_session: Session = SessionLocal()
                try:
                    new_msg = Message(
                        couple_id=couple_id,
                        sender_id=user.id,
                        sender_name=user.name,
                        content=content,
                        reply_to_id=reply_to_id,
                        reactions={},
                        is_saved_as_memory=False,
                        created_at=datetime.utcnow()
                    )
                    db_session.add(new_msg)
                    db_session.commit()
                    db_session.refresh(new_msg)

                    broadcast_payload = {
                        "type": "new_message",
                        "message": {
                            "id": new_msg.id,
                            "couple_id": new_msg.couple_id,
                            "sender_id": new_msg.sender_id,
                            "sender_name": new_msg.sender_name,
                            "content": new_msg.content,
                            "reply_to_id": new_msg.reply_to_id,
                            "reactions": new_msg.reactions or {},
                            "is_saved_as_memory": new_msg.is_saved_as_memory,
                            "seen_at": new_msg.seen_at.isoformat() if new_msg.seen_at else None,
                            "created_at": new_msg.created_at.isoformat() if new_msg.created_at else None
                        }
                    }
                    await manager.broadcast_to_couple(couple_id, broadcast_payload)
                finally:
                    db_session.close()

            elif event_type == "toggle_reaction":
                message_id = data.get("message_id")
                emoji = data.get("emoji")
                if not message_id or not emoji:
                    continue

                db_session = SessionLocal()
                try:
                    msg = db_session.query(Message).filter(
                        Message.id == message_id,
                        Message.couple_id == couple_id
                    ).first()
                    if msg:
                        reactions = dict(msg.reactions or {})
                        users = list(reactions.get(emoji, []))
                        if user.id in users:
                            users.remove(user.id)
                        else:
                            users.append(user.id)

                        if users:
                            reactions[emoji] = users
                        else:
                            reactions.pop(emoji, None)

                        msg.reactions = reactions
                        db_session.commit()

                        await manager.broadcast_to_couple(
                            couple_id,
                            {
                                "type": "reaction_update",
                                "message_id": msg.id,
                                "reactions": reactions
                            }
                        )
                finally:
                    db_session.close()

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        manager.disconnect(websocket)
