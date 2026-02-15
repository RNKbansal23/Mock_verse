# In file: backend/app/api/v1/endpoints.py
import json # <-- Add this import at the top of the file


# UPDATED: Import necessary tools for file uploads and form data
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session

from app.db import models, schemas, database
from app.services import gemini_service

# UPDATED: Import our new resume service
from app.services import resume_service

router = APIRouter()

# UPDATED: The endpoint now accepts Form data instead of a JSON body.
# This is how you send both text data (the role) and a file (the resume) together.
@router.post("/interviews", response_model=schemas.InterviewResponse)
def create_interview(
    role: str = Form(...),
    resumeFile: UploadFile | None = File(None), # The resume is optional
    db: Session = Depends(database.get_db)
):
    resume_text = ""
    # 1. If a resume file was uploaded, parse it to get the text
    if resumeFile:
        print(f"Received resume: {resumeFile.filename}, type: {resumeFile.content_type}")
        resume_text = resume_service.parse_resume(resumeFile)
    
    # 2. Generate the first question, now with resume context if available
    first_question = gemini_service.generate_initial_question(
        role=role,
        resume_text=resume_text
    )

    # 3. Create a new interview record in the database
    db_interview = models.Interview(role=role, resume_text=resume_text)
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)

    # 4. Save the first question as the first "turn"
    db_turn = models.Turn(interview_id=db_interview.id, speaker="ai", text=first_question)
    db.add(db_turn)
    db.commit()

    return {"session_id": db_interview.id, "first_question": first_question}
@router.get("/interviews/{session_id}/feedback")
def get_feedback(session_id: int, db: Session = Depends(database.get_db)):
    # 1. Fetch the entire conversation history for context
    turns = db.query(models.Turn).filter(models.Turn.interview_id == session_id).order_by(models.Turn.created_at).all()
    if not turns:
        raise HTTPException(status_code=404, detail="Interview session not found or has no turns.")

    conversation_history = [f"{turn.speaker}: {turn.text}" for turn in turns]

    # 2. Generate feedback using Gemini
    feedback_json_str = gemini_service.generate_interview_feedback(conversation_history)

    # 3. Parse the JSON string and return it
    try:
        feedback_data = json.loads(feedback_json_str)
        return feedback_data
    except json.JSONDecodeError:
        print("Error: Gemini did not return valid JSON.")
        raise HTTPException(status_code=500, detail="Failed to parse feedback from AI.")