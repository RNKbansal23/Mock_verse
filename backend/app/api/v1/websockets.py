# In file: backend/app/api/v1/websockets.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.db import models, database

from app.services import gemini_service

router = APIRouter()

# A simple class to manage connections if needed, but not essential for one user
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

manager = ConnectionManager()

@router.websocket("/interviews/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int, db: Session = Depends(database.get_db)):
    await manager.connect(websocket)
    try:
        while True:
            # 1. Receive user's answer (text) from frontend
            user_answer = await websocket.receive_text()

            # 2. Save user's answer to the database
            db_user_turn = models.Turn(interview_id=session_id, speaker="user", text=user_answer)
            db.add(db_user_turn)
            db.commit()

            # 3. Fetch the entire conversation history for context
            turns = db.query(models.Turn).filter(models.Turn.interview_id == session_id).order_by(models.Turn.created_at).all()
            conversation_history = [f"{turn.speaker}: {turn.text}" for turn in turns]

            # 4. Generate the next question using Gemini
            ai_response = gemini_service.generate_follow_up_question(conversation_history)

            # 5. Save AI's response to the database
            db_ai_turn = models.Turn(interview_id=session_id, speaker="ai", text=ai_response)
            db.add(db_ai_turn)
            db.commit()

            # 6. Send the new question back to the frontend
            await websocket.send_text(ai_response)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client for session {session_id} disconnected.")