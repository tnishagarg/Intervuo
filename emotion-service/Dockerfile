FROM python:3.11-slim

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
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Manually fetch the Haar Cascade file, since opencv packages sometimes
# don't ship their data/ folder correctly in slim Docker images
RUN mkdir -p /usr/local/share/haarcascades && \
    curl -o /usr/local/share/haarcascades/haarcascade_frontalface_default.xml \
    https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml

# Install Python deps first (better Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Hugging Face Spaces (Docker SDK) expects the app to listen on port 7860
EXPOSE 5001

ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

CMD ["python", "-u","app.py"]