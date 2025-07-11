# In file: backend/app/api/v1/endpoints.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import models, schemas, database
from app.services import gemini_service

router = APIRouter()

@router.post("/interviews", response_model=schemas.InterviewResponse)
def create_interview(interview_data: schemas.InterviewCreate, db: Session = Depends(database.get_db)):
    # 1. Generate the first question using Gemini
    first_question = gemini_service.generate_initial_question(
        role=interview_data.role,
        resume_text=interview_data.resume_text
    )

    # 2. Create a new interview record in the database
    db_interview = models.Interview(role=interview_data.role, resume_text=interview_data.resume_text)
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)

    # 3. Save the first question as the first "turn"
    db_turn = models.Turn(interview_id=db_interview.id, speaker="ai", text=first_question)
    db.add(db_turn)
    db.commit()

    return {"session_id": db_interview.id, "first_question": first_question}