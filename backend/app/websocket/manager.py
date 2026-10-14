import json
import logging
from typing import Dict, Set, Any
from fastapi import WebSocket

logger = logging.getLogger("pulsepath.websocket")

class ConnectionManager:
    def __init__(self):
        # couple_id -> set of WebSockets
        self.active_couples: Dict[str, Set[WebSocket]] = {}
        # websocket -> (couple_id, user_id, user_name)
        self.socket_users: Dict[WebSocket, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, couple_id: str, user_id: str, user_name: str):
        await websocket.accept()
        if couple_id not in self.active_couples:
            self.active_couples[couple_id] = set()
        
        self.active_couples[couple_id].add(websocket)
        self.socket_users[websocket] = {
            "couple_id": couple_id,
            "user_id": user_id,
            "user_name": user_name
        }
        logger.info(f"WebSocket connected: User {user_name} ({user_id}) joined couple {couple_id}")

    def disconnect(self, websocket: WebSocket):
        info = self.socket_users.pop(websocket, None)
        if info:
            couple_id = info["couple_id"]
            if couple_id in self.active_couples:
                self.active_couples[couple_id].discard(websocket)
                if not self.active_couples[couple_id]:
                    del self.active_couples[couple_id]
            logger.info(f"WebSocket disconnected: User {info.get('user_name')} from couple {couple_id}")

    async def broadcast_to_couple(self, couple_id: str, message_data: dict, exclude_socket: WebSocket = None):
        if couple_id not in self.active_couples:
            return

        payload = json.dumps(message_data)
        dead_sockets = set()
        for connection in self.active_couples[couple_id]:
            if connection == exclude_socket:
                continue
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending message to client: {e}")
                dead_sockets.add(connection)
        
        for dead in dead_sockets:
            self.disconnect(dead)

manager = ConnectionManager()
