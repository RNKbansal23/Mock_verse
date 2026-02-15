# In file: backend/Dockerfile

FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
COPY render_app.py .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["uvicorn", "render_app:app", "--host", "0.0.0.0", "--port", "10000"]