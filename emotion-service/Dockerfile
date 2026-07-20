FROM python:3.10-slim

# System dependencies:
# - ffmpeg: required by imageio_ffmpeg / subprocess call in analyze-voice
# - libgl1, libglib2.0-0: required by opencv-python (cv2) to work headless
# - libsm6, libxext6: common opencv runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (better Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Hugging Face Spaces (Docker SDK) expects the app to listen on port 7860
EXPOSE 5001

ENV FLASK_ENV=production

CMD ["python", "app.py"]