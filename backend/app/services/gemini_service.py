# In file: backend/app/services/gemini_service.py

import google.generativeai as genai
from ..core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_initial_question(role: str, resume_text: str | None = None) -> str:
    prompt = f"You are an expert interviewer hiring for a '{role}' position. Your goal is to conduct a friendly but effective screening interview. Start the interview with your first question."
    if resume_text:
        prompt += f"\n\nThe candidate has submitted the following resume. Use it to inform your first question:\n---RESUME---\n{resume_text}\n---END RESUME---"
    
    response = model.generate_content(prompt)
    return response.text

def generate_follow_up_question(conversation_history: list[str]) -> str:
    prompt = "You are an expert interviewer. The following is the conversation so far. Ask the next relevant follow-up question.\n\n"
    prompt += "\n".join(conversation_history)
    prompt += "\n\nInterviewer:" # Prompt the model to generate the interviewer's next line

    response = model.generate_content(prompt)
    return response.text