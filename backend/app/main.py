# In file: backend/app/main.py (Reverted to original version)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import models, database
from .api.v1 import endpoints, websockets # Using relative imports

# This command creates the database tables if they don't exist
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="MockVerse API")

# Keep the deployed URL in the origins list for future use
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://mock-verse.vercel.app", # Replace with your actual Vercel URL
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