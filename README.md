<div align="center">

# 🎙️ MockVerse
### The AI-powered, voice-first mock interview experience

**Practice like it's a real interview. Learn from every answer.**

[![Next.js](https://img.shields.io/badge/Next.js-15-111827?logo=nextdotjs)](https://nextjs.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-Python-05998b?logo=fastapi)](https://fastapi.tiangolo.com/) [![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8b5cf6?logo=googlegemini)](https://ai.google.dev/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-SQLAlchemy-326b9f?logo=postgresql)](https://www.postgresql.org/) [![WebSockets](https://img.shields.io/badge/Realtime-WebSockets-ff8b5c)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

[Live application](https://mock-verse.vercel.app/) · [Source code](https://github.com/RNKbansal23/Mock_verse) · [Architecture](#-system-architecture)

</div>

---

## ✦ Overview

**MockVerse** is a full-stack, conversational mock interview platform that simulates a technical or role-based interview using **Google Gemini**. Candidates select a target role, optionally upload a résumé, and talk naturally to an AI interviewer. The application listens in the browser, sends transcribed responses to a FastAPI backend, and generates questions that build on the conversation so far. At the end, candidates receive an AI-generated report with a **score, strengths, and concrete areas for improvement**.

Rather than a fixed quiz, MockVerse is designed around a **continuous interview loop**: *hear → respond → preserve context → follow up → reflect*.

> **Built with:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, FastAPI, Python, WebSockets, Gemini 2.5 Flash, SQLAlchemy, PostgreSQL, and browser Web Speech APIs.

### Why MockVerse?

Most interview preparation tools emphasize written questions and model answers. Actual interviews demand spoken explanations, quick thinking, and the ability to respond to a follow-up question. MockVerse brings those elements together in one practice environment—without requiring a human interviewer.

## ✨ What it does

| Capability | How it works |
|---|---|
| 🎯 **Role-aware questions** | Gemini creates the opening question using the target job role. |
| 📄 **Résumé-grounded interviews** | Optional PDF, DOCX, or TXT résumé is parsed and supplied as context for the initial question. |
| 🎤 **Voice-first interaction** | Browser SpeechRecognition transcribes candidate speech; SpeechSynthesis speaks the AI interviewer's questions. |
| 🔁 **Contextual follow-ups** | Each answer is added to the interview transcript; Gemini sees the conversation history and generates the next question. |
| ⚡ **Two-way communication** | FastAPI WebSockets carry transcribed answers and generated questions during a live interview. |
| 🧠 **Structured AI feedback** | A dedicated endpoint uses the transcript to create a summary, strengths, improvement suggestions, and a score out of ten. |
| 📹 **Camera preview** | Optional local camera preview provides a more interview-like interface; camera video is not sent to Gemini by this code. |
| 🧪 **Mock development mode** | Simulated responses allow UI testing without a live AI conversation. |
| 💾 **Session persistence** | PostgreSQL tables store the interview role, extracted résumé text, and individual AI/user dialogue turns. |

> **Scope note:** This repository implements interview sessions and conversation persistence, **not** a full user-account/authentication or analytics dashboard system. Performance and transcription-accuracy claims are intentionally omitted because no reproducible benchmarks are included.

---

## 🏗️ System architecture

<div align="center">

![Animated MockVerse system architecture](assets/mockverse-architecture.svg)

*Animated SVG architecture diagram — color-coded service boundaries, directional arrows, and data flow. Respects reduced-motion settings.*

</div>

### The five architectural layers

**01 — Experience layer · Next.js + React.** The candidate selects a role and optionally uploads a résumé. The React interview window manages the browser-side states (`speaking`, `listening`, `processing`, `idle`), renders the dialogue, displays a local camera preview, and navigates to the results page.

**02 — Speech layer · Browser APIs.** `SpeechSynthesisUtterance` reads the AI's question aloud. Browser `SpeechRecognition` converts the candidate's spoken answer into text. **Audio processing is browser-side**; the backend receives **text**, not an audio stream. Browser compatibility and permissions are required.

**03 — Orchestration layer · FastAPI.** REST initializes the interview and later retrieves feedback. A separate WebSocket route carries conversation turns. The backend saves new turns and reconstructs the transcript for follow-up generation.

**04 — Intelligence layer · Gemini 2.5 Flash.** The AI service generates the first role-specific question (using résumé context when supplied), then follow-ups from the complete transcript. A separate feedback prompt returns a structured assessment.

**05 — Persistence layer · PostgreSQL + SQLAlchemy.** `Interview` records store the role and résumé text; related `Turn` records store individual AI and user utterances with timestamps. This preserves conversation context across requests.

### Live interview sequence

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Browser as Next.js + Web Speech
    participant REST as FastAPI REST
    participant WS as FastAPI WebSocket
    participant AI as Gemini 2.5 Flash
    participant DB as PostgreSQL

    Candidate->>Browser: Select role / upload résumé
    Browser->>REST: POST /api/v1/interviews (multipart)
    Note over REST: Parse PDF, DOCX or TXT when provided
    REST->>AI: Generate first question (role + résumé context)
    AI-->>REST: Opening question
    REST->>DB: Create interview + initial AI turn
    REST-->>Browser: session_id + first_question
    Browser->>Candidate: Speak question (SpeechSynthesis)
    Browser->>WS: Open /ws/interviews/{session_id}
    loop Every candidate answer
        Candidate->>Browser: Speak answer
        Note over Browser: Browser transcribes speech to text
        Browser->>WS: Send transcribed answer (text)
        WS->>DB: Persist user turn / load history
        WS->>AI: Generate context-aware follow-up
        AI-->>WS: Next question
        WS->>DB: Persist AI turn
        WS-->>Browser: Send AI question (text)
        Browser->>Candidate: Speak question / resume listening
    end
    Candidate->>Browser: End interview
    Browser->>REST: GET /api/v1/interviews/{id}/feedback
    REST->>DB: Retrieve ordered transcript
    REST->>AI: Evaluate full interview transcript
    AI-->>REST: Structured feedback JSON
    REST-->>Browser: Summary, strengths, improvements, score
    Browser->>Candidate: Display interview scorecard
```

### Responsibility boundaries

| Boundary | Module | Responsibility |
|---|---|---|
| Browser → REST | `frontend/lib/api.ts` → `backend/app/api/v1/endpoints.py` | Start session using multipart form data. |
| Browser ↔ WebSocket | `InterviewWindow.tsx` ↔ `websockets.py` | Exchange user answer and next question. |
| FastAPI → résumé parser | `resume_service.py` | Extract text from supported résumé uploads. |
| FastAPI → Gemini | `gemini_service.py` | Generate opening question, follow-ups, and feedback. |
| FastAPI ↔ DB | `models.py`, `database.py` | Store interviews and chronological dialogue turns. |
| Results page → REST | `FeedbackDisplay.tsx` → `endpoints.py` | Fetch the final interview assessment. |

> **Architecture precision:** This is a **modular FastAPI application** with separated API, service, and data modules—not independently deployed microservices. The repository also includes `backend/render_app.py`, a consolidated deployment entry point.

---

## 🧩 How the AI interview works

### 1. Start an interview

The start form captures a target job role and an optional résumé. In **live mode**, the browser sends them as `multipart/form-data` to `POST /api/v1/interviews`. The résumé parser extracts text; the Gemini service uses the role and optional text to produce the first question. The backend persists the session and returns:

```json
{
  "session_id": 42,
  "first_question": "Can you walk me through a project relevant to this role?"
}
```

*Illustrative response; live wording and session ID vary.*

### 2. Speak and listen

The frontend uses a state-driven loop:

```mermaid
flowchart LR
    A[AI question] --> B[🔊 Browser speaks]
    B --> C[🎙️ Browser listens]
    C --> D[Speech to text]
    D --> E[WebSocket: send answer]
    E --> F[Save turn + load history]
    F --> G[Gemini follow-up]
    G --> H[Save + send next question]
    H --> B
    classDef ui fill:#112a46,stroke:#38bdf8,color:#e0f2fe;
    classDef ai fill:#30204a,stroke:#c084fc,color:#faf5ff;
    classDef data fill:#143b36,stroke:#5eead4,color:#f0fdfa;
    class A,B,C,D,E ui;
    class G,H ai;
    class F data;
```

The browser reads the AI's response aloud and then resumes listening. The implementation includes a short speech-end countdown before submitting a detected answer, plus a control to stop listening manually.

### 3. Preserve context, not just the last answer

Every candidate answer and AI question is stored as a separate row in the `turns` table. When the next answer arrives, the backend loads the **full ordered conversation history** and includes it in the Gemini prompt. This allows the next question to reference previous explanations instead of following a static list.

### 4. Deliver actionable feedback

After the user finishes, `GET /api/v1/interviews/{session_id}/feedback` retrieves the transcript and requests structured feedback from Gemini. The response contains:

```json
{
  "overallSummary": "A concise assessment of the candidate's responses.",
  "strengths": ["Clear explanation of technical choices"],
  "areasForImprovement": ["Include a measurable project outcome"],
  "score": 8
}
```

*Illustrative feedback format; this is an AI-generated coaching assessment, not an objectively validated hiring score.*

---

## 🗃️ Data model

```mermaid
erDiagram
    INTERVIEWS ||--o{ TURNS : contains
    INTERVIEWS {
        int id PK
        string role
        text resume_text
        string status
        datetime created_at
    }
    TURNS {
        int id PK
        int interview_id FK
        string speaker
        text text
        datetime created_at
    }
```

An `Interview` has many `Turn` records. The `speaker` is either `user` or `ai`, while `created_at` provides the turn order. The résumé's **extracted text** is currently saved with the interview, which should be treated as potentially sensitive user information.

---

## 🔌 API reference

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/` | Backend health/status response |
| `POST` | `/api/v1/interviews` | Create an interview; form fields: `role`, optional `resumeFile` |
| `WS` | `/ws/interviews/{session_id}` | Two-way text exchange for interview turns |
| `GET` | `/api/v1/interviews/{session_id}/feedback` | Generate scorecard from saved transcript |

**Request example** (server running at `localhost:8000`):

```bash
curl -X POST http://localhost:8000/api/v1/interviews \
  -F "role=Software Engineer" \
  -F "resumeFile=@resume.pdf"
```

The file field is optional. The WebSocket endpoint expects **plain-text answers**, and responds with **plain-text AI questions**.

---

## 🧰 Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| UI | Radix-based components, Lucide icons, Lottie animation |
| Speech | Web Speech API (`SpeechRecognition`, `SpeechSynthesis`) |
| Backend | Python 3.11, FastAPI, Pydantic, Uvicorn |
| Real-time transport | WebSockets |
| AI | Google Gemini API — `gemini-2.5-flash` |
| Document parsing | PyMuPDF, python-docx, plain-text decoding |
| ORM and database | SQLAlchemy, PostgreSQL via psycopg2 |
| Packaging and hosting | Docker; frontend Vercel URL configured in CORS; Render-oriented backend entry point |

---

## 📁 Repository layout

```text
Mock_verse/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Start interview
│   │   ├── interview/[sessionId]/   # Voice-first interview
│   │   └── results/[sessionId]/     # Scorecard
│   ├── components/
│   │   ├── StartInterviewForm.tsx
│   │   ├── InterviewWindow.tsx
│   │   ├── FeedbackDisplay.tsx
│   │   ├── InterviewerCharacter.tsx
│   │   └── UserCameraFeed.tsx
│   ├── lib/
│   │   ├── api.ts                   # Real REST integration
│   │   └── mockApi.ts               # Simulated responses
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py                  # Modular FastAPI entry point
│   │   ├── api/v1/
│   │   │   ├── endpoints.py          # REST endpoints
│   │   │   └── websockets.py         # Live interview socket
│   │   ├── services/
│   │   │   ├── gemini_service.py
│   │   │   └── resume_service.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   └── core/config.py
│   ├── render_app.py                # Consolidated deployment variant
│   ├── requirements.txt
│   └── Dockerfile
├── assets/
│   └── mockverse-architecture.svg   # Add this SVG from the provided bundle
├── Dockerfile
└── README.md
```

---

## 🚀 Local setup

### Prerequisites

- Node.js 20+ and npm (suitable for Next.js 15)
- Python 3.11
- A PostgreSQL database
- A Gemini API key
- A modern browser supporting the required Web Speech APIs (Chrome/Edge are commonly used)

### 1. Clone the repository

```bash
git clone https://github.com/RNKbansal23/Mock_verse.git
cd Mock_verse
```

### 2. Configure the backend

```bash
cd backend
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env`:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/mockverse
```

Create the database in PostgreSQL first. SQLAlchemy creates the defined tables during app initialization.

```bash
uvicorn app.main:app --reload --port 8000
```

**API:** `http://localhost:8000` · **Interactive docs:** `http://localhost:8000/docs`

### 3. Configure the frontend

Open another terminal at the repository root:

```bash
cd frontend
npm ci
```

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_API=false
```

```bash
npm run dev
```

Visit **http://localhost:3000**, allow microphone permission, select a role, and start an interview. Camera preview requires camera permission but is not part of Gemini's input.

### 4. Use mock mode for UI development

Set `NEXT_PUBLIC_USE_MOCK_API=true` in `frontend/.env.local`, then restart the frontend dev server. This substitutes simulated interview questions and feedback and **does not exercise the real Gemini / PostgreSQL interview pipeline**.

> **Deployment note:** The current live-mode WebSocket URL in `InterviewWindow.tsx` is hard-coded to `ws://localhost:8000`. For a deployed frontend, change it to a configurable `ws://` or `wss://` URL matching your backend. The root/backend Dockerfiles also use a consolidated `render_app.py` entry point; review their copy paths and ensure all required modules and dependencies are present before building a production image.

---

## 🛡️ Security and current limitations

MockVerse is a learning and portfolio project; it should not be treated as a production interview-assessment service without additional hardening.

- **No account login or per-session authorization** is implemented. Protect REST and WebSocket routes before exposing personal transcripts publicly.
- Résumé contents and interview text may include personal data; establish privacy, consent, retention, and deletion policies.
- Validate résumé size/type and sanitize file handling; do not send untrusted résumé content to an LLM without appropriate instruction/data separation.
- Apply request limits, WebSocket rate limits, timeouts, error handling, and usage controls for Gemini costs.
- Do not commit `.env` files, database URLs, or Gemini keys; rotate any secrets previously exposed in repository history.
- Gemini feedback is subjective coaching output, not verified evidence of actual candidate ability.
- Voice accuracy, latency, and browser support vary by browser, device, environment, and connection.
- The backend generates feedback on demand; the current data model does not persist a dedicated feedback report record.
- The application has no automated test suite or reproducible performance benchmark in this repository.

---

## 🧭 Roadmap

- [ ] Configurable production WebSocket URL and reconnection handling
- [ ] Authentication and secure per-user interview history
- [ ] Better audio-permission and accessibility fallbacks
- [ ] Persist versioned feedback reports and interview completion status
- [ ] Résumé upload validation, limits, and retention controls
- [ ] Topic-specific interview modes (DSA, system design, behavioral)
- [ ] Reviewable transcript and per-answer feedback
- [ ] Practice progress across multiple sessions
- [ ] Optional speech-delivery coaching (with appropriate consent)
- [ ] Automated API, WebSocket, and end-to-end testing

---

## 🧠 Key engineering decisions

**Why WebSockets?** A live interview consists of repeated user-answer / AI-question exchanges. A persistent two-way connection keeps the conversation interface straightforward without repeatedly initiating HTTP requests for each turn.

**Why browser speech APIs?** They provide voice input and spoken output without building a dedicated speech-processing backend. The trade-off is browser-dependent availability and recognition behavior.

**Why store individual turns?** Ordered conversation history enables context-sensitive prompts and provides the source material for the final feedback report.

**Why separate the Gemini service?** Centralizing prompt construction keeps API routes focused on request handling and persistence. It also makes it easier to replace or refine question generation later.

**Why support a mock mode?** It decouples UI iteration from API availability and cost, while keeping the conversational interface testable.

---

## 🤝 Contributions

Contributions are welcome. Fork the repository, create a focused branch, document what changed, and open a pull request. Please avoid including API keys, real candidate résumés, or personal transcripts in commits or sample data.

<div align="center">

### MockVerse
**Talk it through. Think it through. Improve every interview.**

[GitHub repository](https://github.com/RNKbansal23/Mock_verse)

</div>
