# In file: backend/app/main.py (Final Corrected Version)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Use ABSOLUTE imports, which are more reliable in Docker
from app.db import models, database
from app.api.v1 import endpoints, websockets

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="MockVerse API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://mock-verse.vercel.app", # Make sure this matches your Vercel URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix="/api/v1", tags=["Interviews"])
app.include_router(websockets.router, prefix="/ws", tags=["WebSockets"])

@app.get("/")
def read_root():
    return {"status": "MockVerse API is running"}