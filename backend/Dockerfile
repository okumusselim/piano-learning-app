FROM python:3.12-slim

# Install system dependencies:
# poppler-utils: required by pdf2image for PDF rendering
# libgl1: required by Pillow for some image operations
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       poppler-utils \
       libgl1-mesa-glx \
       libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

# Temp dir for sheet files
RUN mkdir -p /tmp/piano-app

ENV PYTHONUNBUFFERED=1
ENV TEMP_DIR=/tmp/piano-app

EXPOSE 8000

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
