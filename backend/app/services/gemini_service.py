# In file: backend/app/services/gemini_service.py

import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# CORRECTED: Use the correct, official model name
model = genai.GenerativeModel('gemini-2.5-flash')

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