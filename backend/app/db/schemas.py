# In file: backend/app/db/schemas.py

from pydantic import BaseModel

class InterviewCreate(BaseModel):
    role: str
    resume_text: str | None = None

class InterviewResponse(BaseModel):
    session_id: int
    first_question: str

    class Config:
        orm_mode = True