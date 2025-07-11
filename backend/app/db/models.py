# In file: backend/app/db/models.py

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from .database import Base

class Interview(Base):
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, index=True)
    resume_text = Column(Text, nullable=True) # To store resume content
    status = Column(String, default="started")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    turns = relationship("Turn", back_populates="interview")

class Turn(Base):
    __tablename__ = "turns"
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    speaker = Column(String) # 'ai' or 'user'
    text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    interview = relationship("Interview", back_populates="turns")