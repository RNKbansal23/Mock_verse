# In file: backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import models, database

# --- THIS LINE IS CRITICAL ---
from .api.v1 import endpoints, websockets # Import the new routers

# This command creates the database tables if they don't exist
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="MockVerse API")

# --- THIS LIST IS CRITICAL ---
# It MUST contain your live Vercel URL
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://mock-verse.vercel.app", # Replace with your actual Vercel URL if different
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- THESE TWO LINES ARE CRITICAL ---
app.include_router(endpoints.router, prefix="/api/v1", tags=["Interviews"])
app.include_router(websockets.router, prefix="/ws", tags=["WebSockets"])


@app.get("/")
def read_root():
    return {"status": "MockVerse API is running"}