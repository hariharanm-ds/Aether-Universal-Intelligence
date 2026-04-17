# Use official Node image for building
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Python runtime with both backend + Ollama
FROM python:3.11-slim

# Install system dependencies for building and Ollama
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

WORKDIR /app

# Copy backend files
COPY backend /app/backend
COPY .env /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy built frontend
COPY --from=frontend-builder /app/dist /app/dist

# Install a simple HTTP server to serve the frontend
RUN pip install --no-cache-dir python-dotenv

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start Ollama in the background\n\
echo "===== Application Startup at $(date) ====="\n\
echo "Starting Ollama..."\n\
ollama serve > /tmp/ollama.log 2>&1 &\n\
OLLAMA_PID=$!\n\
\n\
# Wait for Ollama to be ready\n\
echo "Waiting for Ollama to be ready..."\n\
MAX_RETRIES=30\n\
RETRY_COUNT=0\n\
while ! curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; do\n\
  RETRY_COUNT=$((RETRY_COUNT + 1))\n\
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then\n\
    echo "ERROR: Ollama failed to start after $MAX_RETRIES attempts"\n\
    kill $OLLAMA_PID 2>/dev/null || true\n\
    exit 1\n\
  fi\n\
  echo "Ollama not ready, waiting... (attempt $RETRY_COUNT/$MAX_RETRIES)"\n\
  sleep 1\n\
done\n\
echo "Ollama is ready"\n\
\n\
# Pull the model (with timeout of 25 minutes to stay under 30min total)\n\
echo "Pulling orca-mini model..."\n\
timeout 1500 ollama pull orca-mini > /tmp/ollama-pull.log 2>&1 &\n\
PULL_PID=$!\n\
\n\
# Start backend\n\
echo "Starting FastAPI backend..."\n\
cd /app/backend && uvicorn app:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &\n\
BACKEND_PID=$!\n\
\n\
# Start frontend server\n\
echo "Starting frontend HTTP server..."\n\
cd /app && python -m http.server 3000 --directory dist > /tmp/frontend.log 2>&1 &\n\
FRONTEND_PID=$!\n\
\n\
echo "All services started. Waiting..."\n\
\n\
# Keep the container alive and monitor processes\n\
while true; do\n\
  sleep 10\n\
  # Check if critical processes are still running\n\
  if ! kill -0 $OLLAMA_PID 2>/dev/null; then\n\
    echo "ERROR: Ollama process died"\n\
    exit 1\n\
  fi\n\
  if ! kill -0 $BACKEND_PID 2>/dev/null; then\n\
    echo "ERROR: Backend process died"\n\
    exit 1\n\
  fi\n\
  if ! kill -0 $FRONTEND_PID 2>/dev/null; then\n\
    echo "ERROR: Frontend process died"\n\
    exit 1\n\
  fi\n\
done' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Health check to ensure container stays healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

EXPOSE 3000 8000 11434

CMD ["/app/entrypoint.sh"]
