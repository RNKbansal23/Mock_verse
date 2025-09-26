# In file: ./Dockerfile (at the project root)

FROM python:3.11-slim
WORKDIR /app

# We are now at the repo root, so we need to specify the 'backend/' prefix
COPY backend/requirements.txt .
COPY backend/render_app.py .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Command to run the new, single-file application
CMD ["uvicorn", "render_app:app", "--host", "0.0.0.0", "--port", "10000"]