# Use official Node image for building
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Python runtime - lightweight for HF Spaces
FROM python:3.11-slim

# Install minimal system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend files
COPY backend /app/backend

# Install Python dependencies
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy built frontend
COPY --from=frontend-builder /app/dist /app/dist

# Expose ports
EXPOSE 8000 3000

# Create startup script - no Ollama, just services
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Starting Aether Universal Intelligence..."\n\
\n\
# Start backend on 8000\n\
cd /app/backend && uvicorn app:app --host 0.0.0.0 --port 8000 &\n\
BACKEND_PID=$!\n\
\n\
# Start frontend on 3000\n\
cd /app && python -m http.server 3000 --directory dist &\n\
FRONTEND_PID=$!\n\
\n\
echo "Backend running on port 8000"\n\
echo "Frontend running on port 3000"\n\
\n\
wait' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

EXPOSE 3000 8000 11434

CMD ["/app/entrypoint.sh"]
