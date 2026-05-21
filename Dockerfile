FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to root of the project
WORKDIR /app

# Copy requirements from backend first for docker layer caching
COPY backend/requirements.txt ./backend/requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy the entire workspace to the container (required because backend imports and runs root-level scripts)
COPY . .

# Expose port 8000
EXPOSE 8000

# Set environment variable to ensure logs are flushed immediately
ENV PYTHONUNBUFFERED=1

# Command to run uvicorn pointing to backend.main:app, binding dynamically to the assigned port
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
