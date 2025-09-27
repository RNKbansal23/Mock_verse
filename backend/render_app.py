# In file: backend/render_app.py

import os
import io
import json
import fitz
import docx
import google.generativeai as genai
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Form, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import sessionmaker, relationship, Session
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from pydantic_settings import BaseSettings

# --- 1. CONFIGURATION ---
class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    DATABASE_URL: str = os.getenv("DATABASE_URL")

settings = Settings()

# --- 2. DATABASE SETUP ---
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Interview(Base):
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, index=True)
    resume_text = Column(Text, nullable=True)
    status = Column(String, default="started")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    turns = relationship("Turn", back_populates="interview")

class Turn(Base):
    __tablename__ = "turns"
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    speaker = Column(String)
    text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    interview = relationship("Interview", back_populates="turns")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class InterviewResponse(BaseModel):
    session_id: int
    first_question: str
    class Config:
        from_attributes = True

# --- 3. SERVICES (GEMINI, RESUME PARSING) ---
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

def parse_resume(file: UploadFile) -> str:
    try:
        file_content = file.file.read()
        file_stream = io.BytesIO(file_content)
        if file.content_type == "application/pdf":
            doc = fitz.open(stream=file_stream, filetype="pdf")
            text = "".join(page.get_text() for page in doc)
            return text
        elif file.content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
            doc = docx.Document(file_stream)
            text = "\n".join([para.text for para in doc.paragraphs])
            return text
        return "Unsupported file type."
    except Exception as e:
        print(f"Error parsing resume: {e}")
        return "Error during resume parsing."
    finally:
        file.file.close()

def generate_initial_question(role: str, resume_text: str | None = None) -> str:
    prompt = f"You are an expert interviewer hiring for a '{role}' position. Your goal is to conduct a friendly but effective screening interview. Start the interview with your first question."
    if resume_text:
        prompt += f"\n\nThe candidate has submitted the following resume. Use it to inform your first question:\n---RESUME---\n{resume_text}\n---END RESUME---"
    response = model.generate_content(prompt)
    return response.text

def generate_follow_up_question(conversation_history: list[str]) -> str:
    prompt = "You are an expert interviewer. The following is the conversation so far. Ask the next relevant follow-up question.\n\n"
    prompt += "\n".join(conversation_history)
    prompt += "\n\nInterviewer:"
    response = model.generate_content(prompt)
    return response.text

# --- 4. FASTAPI APP AND ENDPOINTS ---
app = FastAPI(title="MockVerse API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://mock-verse.vercel.app", # <-- MAKE SURE THIS IS YOUR REAL VERCEL URL
]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def read_root():
    return {"status": "MockVerse API is running"}

@app.post("/api/v1/interviews", response_model=InterviewResponse)
def create_interview(role: str = Form(...), resumeFile: UploadFile | None = File(None), db: Session = Depends(get_db)):
    resume_text = ""
    if resumeFile:
        resume_text = parse_resume(resumeFile)
    first_question = generate_initial_question(role=role, resume_text=resume_text)
    db_interview = Interview(role=role, resume_text=resume_text)
    db.add(db_interview)
    db.commit(); db.refresh(db_interview)
    db_turn = Turn(interview_id=db_interview.id, speaker="ai", text=first_question)
    db.add(db_turn)
    db.commit()
    return {"session_id": db_interview.id, "first_question": first_question}

@app.websocket("/ws/interviews/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    try:
        while True:
            user_answer = await websocket.receive_text()
            db_user_turn = Turn(interview_id=session_id, speaker="user", text=user_answer)
            db.add(db_user_turn)
            db.commit()
            turns = db.query(Turn).filter(Turn.interview_id == session_id).order_by(Turn.created_at).all()
            conversation_history = [f"{turn.speaker}: {turn.text}" for turn in turns]
            ai_response = generate_follow_up_question(conversation_history)
            db_ai_turn = Turn(interview_id=session_id, speaker="ai", text=ai_response)
            db.add(db_ai_turn)
            db.commit()
            await websocket.send_text(ai_response)
    except WebSocketDisconnect:
        print(f"Client for session {session_id} disconnected.")