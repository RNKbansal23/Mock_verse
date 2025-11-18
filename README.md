# MockVerse: The AI-Powered Conversational Mock Interview Platform 🎙️🧠

MockVerse is an **AI-powered mock interview platform** designed to revolutionize how software developers prepare for technical interviews. It provides a **realistic, hands-free, and purely conversational** environment that accurately simulates the pressure and natural flow of a real-world interview.

By using a sophisticated AI engine powered by the **Google Gemini LLM**, the platform asks dynamic, context-aware questions, listens to responses in real-time, and generates detailed, actionable feedback.

![MockVerse Interface Placeholder](https://via.placeholder.com/1200x300.png?text=MockVerse)

---

## ✨ Key Features

* **Fully Conversational AI:** The AI interviewer generates questions and follow-ups based on your specified role, experience level, and the content of your previous answers.
* **🙌 Hands-Free Experience:** The entire interview flows naturally without any button clicks. The system automatically toggles between speaking and listening using the browser's native speech APIs.
* **⚡ High Performance:** Achieves sub-300ms API response times for a seamless, real-time conversation experience.
* **🎯 High-Accuracy Transcription:** Leverages the browser's native **Web Speech API** to ensure high-fidelity transcription (up to 94% accuracy).
* **🧠 Advanced AI Feedback:** A dedicated service analyzes your complete interview transcript for **technical accuracy, clarity, and completeness** to provide a structured, in-depth report.
* **📊 Performance Tracking:** User profiles and interview history are persisted, allowing you to track your improvement and growth over time.
* **🌐 Full-Stack Architecture:** Built with a modern, scalable stack including Next.js, FastAPI, and PostgreSQL.

---

## 🏗️ Architecture Overview

MockVerse is designed with a **scalable microservices architecture** to separate concerns and optimize performance, ensuring a high-quality, low-latency conversational experience.

![Architecture Diagram Placeholder](https://via.placeholder.com/800x450.png?text=Architecture+Diagram)

### 1. Frontend Layer
* A **Server-Side Rendered (SSR) Next.js** application manages the UI and the interview state machine.
* Integrates directly with the browser's **Web Speech API** (`SpeechRecognition` and `SpeechSynthesis`) to handle the bidirectional audio stream (transcription and text-to-speech).

### 2. Backend Layer
* A high-performance **FastAPI (Python)** REST API, divided into three primary microservices:
    * **Interview Engine Service:** Interfaces with **Google's Gemini LLM** to generate dynamic, context-aware interview questions and follow-ups.
    * **Speech Processing Service:** Manages the real-time processing and orchestration of transcribed audio chunks.
    * **Feedback Generation Service:** Uses the **Gemini LLM** to analyze full interview transcripts and generate comprehensive, structured feedback reports.

### 3. Data Layer
* A **PostgreSQL** database stores all persistent data, including user profiles, interview sessions, transcripts, and feedback reports.
* A **relational model** was chosen to maintain data integrity and handle the complex relationships between users, sessions, and their associated data.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python), Starlette, Pydantic |
| **AI/ML** | **Google Gemini API**, Advanced Prompt Engineering, Web Speech API |
| **Database** | PostgreSQL |
| **Deployment** | Docker, Vercel (Frontend), AWS/GCP (Backend) |

---

## 🚀 Getting Started

Follow these steps to set up and run MockVerse locally.

### Prerequisites

* Node.js (v18.x or later)
* Python (v3.9 or later)
* PostgreSQL instance
* An API key for **Google Gemini AI**

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/mockverse.git](https://github.com/your-username/mockverse.git)
cd mockverse
2. Backend Setup (FastAPI)
Bash

cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# 🚨 IMPORTANT: Add your GEMINI_API_KEY and DATABASE_URL to the new .env file

# Run the server
uvicorn main:app --reload
3. Frontend Setup (Next.js)
Bash

cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# 🚨 IMPORTANT: Add the backend API URL to .env.local 
# (e.g., NEXT_PUBLIC_API_BASE_URL=http://localhost:8000)

# Run the development server
npm run dev
Open your browser and navigate to http://localhost:3000 to start your mock interview!

📈 Future AI/ML Enhancements
The platform is built to evolve. The next phase will focus on deepening the ML capabilities for a more intelligent and personalized coaching tool.

1. Speech Emotion and Prosody Analysis
Concept: Analyze the raw audio stream to detect confidence, nervousness, speaking rate, and the use of filler words (e.g., "um," "like").

Benefit: Provides deeper, non-technical feedback on communication skills and presentation delivery, addressing a crucial aspect of interviewing.

2. Personalized Learning Paths with Skill Gap Analysis
Concept: Aggregate feedback from multiple interviews to identify a user's recurring weak points and skill gaps.

Benefit: The system can automatically generate customized study plans or create new mock interviews specifically targeting the user's least confident topic areas, transforming it into an adaptive learning system.

3. Fine-Tuning a Domain-Specific LLM
Concept: Utilize the collected, anonymized interview transcripts to fine-tune an open-source model (e.g., Llama 3, Mistral) using Parameter-Efficient Fine-Tuning (PEFT).

Benefit: A custom-trained model would have a more nuanced understanding of technical interview contexts, leading to more insightful questions and highly accurate, context-specific feedback.
