from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, computed_field

class MessageCreate(BaseModel):
    content: str
    reply_to_id: Optional[str] = None

class MessageReactionToggle(BaseModel):
    emoji: str

class MessageSaveMemory(BaseModel):
    custom_title: Optional[str] = None

class MessageOut(BaseModel):
    id: str
    couple_id: str
    sender_id: str
    sender_name: str
    content: str
    reply_to_id: Optional[str] = None
    reactions: Dict[str, List[str]] = {}
    is_saved_as_memory: bool = False
    seen_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    @computed_field
    @property
    def senderId(self) -> str:
        return self.sender_id

    @computed_field
    @property
    def senderName(self) -> str:
        return self.sender_name

    @computed_field
    @property
    def coupleId(self) -> str:
        return self.couple_id

    @computed_field
    @property
    def replyToId(self) -> Optional[str]:
        return self.reply_to_id

    @computed_field
    @property
    def isSavedAsMemory(self) -> bool:
        return self.is_saved_as_memory

    @computed_field
    @property
    def seenAt(self) -> Optional[datetime]:
        return self.seen_at

    @computed_field
    @property
    def createdAt(self) -> Optional[datetime]:
        return self.created_at

    class Config:
        from_attributes = True

