# In file: backend/main_runner.py
# This is our new, top-level entry point for the server.

import uvicorn
from app.main import app  # Import the FastAPI app object from its original location

if __name__ == "__main__":
    # This block is not strictly necessary for Render but is good practice.
    # Render will use the CMD from the Dockerfile.
    uvicorn.run(app, host="0.0.0.0", port=10000)