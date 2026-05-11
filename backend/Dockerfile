# Use official Python image for high performance
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=80
WORKDIR /app

# Install system dependencies (required for psycopg2)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port
EXPOSE 80

# Start the application using a production-grade worker setup
# We include a pre-start script or direct command that can run migrations
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
