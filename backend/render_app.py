# In file: backend/render_app.py

import os
import io
import json # <-- Make sure this import is here
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
# ... (This section is correct and does not need changes)
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
class Interview(Base): # ...
class Turn(Base): # ...
Base.metadata.create_all(bind=engine)
def get_db(): # ...
class InterviewResponse(BaseModel): # ...

# --- 3. SERVICES (GEMINI, RESUME PARSING) ---
# ... (This section is mostly correct, we just add one function)
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')
def parse_resume(file: UploadFile) -> str: # ...
def generate_initial_question(role: str, resume_text: str | None = None) -> str: # ...
def generate_follow_up_question(conversation_history: list[str]) -> str: # ...


# --- ADD THIS NEW FUNCTION ---
def generate_interview_feedback(conversation_history: list[str]) -> str:
    transcript = "\n".join(conversation_history)
    prompt = f"""
    You are an expert hiring manager reviewing an interview transcript.
    Your task is to provide structured feedback based on the conversation below.
    Analyze the candidate's responses for clarity, relevance, and depth.
    
    Please provide your feedback STRICTLY in the following JSON format. Do not add any text before or after the JSON object.

    {{
        "overallSummary": "A brief, one-paragraph summary of the candidate's performance.",
        "strengths": [
            "A point about what the candidate did well.",
            "Another point about a strength.",
            "A third strength."
        ],
        "areasForImprovement": [
            "A specific, actionable suggestion for improvement.",
            "Another area for improvement."
        ],
        "score": <an integer score out of 10 for overall performance>
    }}

    Here is the interview transcript:
    --- TRANSCRIPT ---
    {transcript}
    --- END TRANSCRIPT ---
    """
    response = model.generate_content(prompt)
    cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
    return cleaned_response
# --- END OF NEW FUNCTION ---


# --- 4. FASTAPI APP AND ENDPOINTS ---
app = FastAPI(title="MockVerse API")
# ... (CORS middleware and other endpoints are correct)
origins = [ # ...
app.add_middleware(CORSMiddleware, # ...

@app.get("/")
def read_root(): # ...

@app.post("/api/v1/interviews", response_model=InterviewResponse)
def create_interview(role: str = Form(...), resumeFile: UploadFile | None = File(None), db: Session = Depends(get_db)): # ...

@app.websocket("/ws/interviews/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int, db: Session = Depends(get_db)): # ...


# --- ADD THIS NEW ENDPOINT AT THE END ---
@app.get("/api/v1/interviews/{session_id}/feedback")
def get_feedback(session_id: int, db: Session = Depends(get_db)):
    # 1. Fetch the conversation history from the database
    turns = db.query(Turn).filter(Turn.interview_id == session_id).order_by(Turn.created_at).all()
    if not turns:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    conversation_history = [f"{turn.speaker}: {turn.text}" for turn in turns]

    # 2. Generate the feedback using our new service function
    feedback_json_str = generate_interview_feedback(conversation_history)

    # 3. Parse the JSON string and return it to the frontend
    try:
        feedback_data = json.loads(feedback_json_str)
        return feedback_data
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse feedback from AI.")
# --- END OF NEW ENDPOINT ---