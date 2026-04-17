# Deploy Aether RAG to Render

Render offers a free tier with generous limits and native support for Docker and Python services.

## 🚀 Quick Deploy (8 minutes)

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **Step 2: Create Render Account**
1. Go to https://render.com
2. Sign up with GitHub
3. Click **New**

### **Step 3: Create Services**

#### **Backend Service**
1. Select **Web Service**
2. Connect your GitHub repo
3. Fill in:
   - **Name**: `aether-backend`
   - **Root Directory**: `.` (or auto-detected)
   - **Environment**: `Docker`
   - **Plan**: `Free`
4. Click **Create**

#### **Frontend Service**
1. New → **Static Site** (simplest)
   - Or **Web Service** with Node.js
2. Connect same repo
3. **Build Command**: `npm run build`
4. **Publish Directory**: `dist`

### **Step 4: Configure Environment**
In backend service dashboard:
- **Environment** tab
- Add variables:
  ```
  OLLAMA_API_URL=http://localhost:11434
  OLLAMA_MODEL=orca-mini
  PYTHONUNBUFFERED=1
  ```

**Done!** Both services live at:
- Frontend: `https://aether-frontend.onrender.com`
- Backend: `https://aether-backend.onrender.com`

---

## 📋 Detailed Configuration

### **Backend Setup (Docker)**

Render auto-detects `Dockerfile` in root. Ensure:

**Port Exposure:**
```dockerfile
EXPOSE 8000
```

**Health Check:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1
```

### **Frontend Setup (Static)**

For simplest setup (recommended):
1. Build command: `npm install && npm run build`
2. Publish directory: `dist`
3. Render serves on their CDN (fast, no server cost)

### **Frontend Setup (Web Service, if needed)**

If you need backend proxy on same domain:
1. Build: `npm install && npm run build`
2. Start: `npm run preview -- --host 0.0.0.0 --port 3000`
3. Add environment: `VITE_API_URL=https://aether-backend.onrender.com`

**Note:** Static site approach is faster and cheaper.

---

## 🔧 Environment Variables

Set in Render dashboard → **Environment**:

| Variable | Value | Notes |
|----------|-------|-------|
| `OLLAMA_API_URL` | `http://localhost:11434` | Local service |
| `OLLAMA_MODEL` | `orca-mini` | Smaller, faster model for free tier |
| `PYTHONUNBUFFERED` | `1` | Ensures logs stream properly |
| `CORS_ORIGINS` | `https://aether-frontend.onrender.com` | Restrict CORS in production |

### **Frontend Environment** (if using Web Service)
```
VITE_API_URL=https://aether-backend.onrender.com
```

---

## 🌐 Connect Frontend to Backend

### **Option 1: Static Site + CORS**
Frontend (dist/) calls backend API directly:
```javascript
// src/services/llama.ts
const API_BASE = import.meta.env.VITE_API_URL || 
                 'https://aether-backend.onrender.com';
```

### **Option 2: Web Service + Proxy**
Add to `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://aether-backend.onrender.com',
      changeOrigin: true
    }
  }
}
```

**Recommendation:** Use Option 1 (simpler, no proxy overhead).

---

## 📦 Model Selection

**Free tier has ~500MB persistent storage**:

| Model | Size | Speed | Notes |
|-------|------|-------|-------|
| `orca-mini` | 1.7GB | ⚡ Fast | **Best for free tier** |
| `neural-chat` | 4.1GB | ⚡ Fast | Good alternative |
| `mistral` | 5GB+ | ⚡⚡ Very fast | May hit storage limits |
| `llama2` | 4GB | 🐢 Slow | Not recommended |
| `llama3` | 13GB | 🐢 Very slow | For paid tier only |

**Set in environment**: `OLLAMA_MODEL=orca-mini`

---

## 💾 Persistent Storage

### **Issue**
By default, `/app/rag_data/` (knowledge base) is lost when service restarts.

### **Solution 1: Render Disks** (Recommended)
1. In service settings → **Disks**
2. Add disk:
   - **Mount path**: `/root/rag_data`
   - **Size**: 1 GB (free tier)
3. Update code:
   ```python
   CHROMA_DATA_DIR = "/root/rag_data"
   ```

This persists knowledge base across restarts!

### **Solution 2: External Database**
Use Render Postgres for vector storage (not Chroma):
```python
import psycopg2
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
# Store embeddings in DB instead of Chroma
```

### **Solution 3: Accept Ephemeral Storage**
Knowledge base resets on service restart. Users re-upload documents.

**Pick Solution 1 for best experience.**

---

## 🔐 Security for Production

### **1. Enable CORS Restriction**
In `backend/app.py`:
```python
CORSMiddleware(
    app,
    allow_origins=["https://aether-frontend.onrender.com"],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"]
)
```

### **2. Add Rate Limiting**
```bash
pip install slowapi
```

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/ingest")
@limiter.limit("5/hour")
async def ingest_document(request: Request, ...):
    # Limit uploads to 5 per hour per IP
```

### **3. Input Validation**
```python
from pydantic import BaseModel, FileSize

class FileUpload(BaseModel):
    file_size: FileSize = Field(..., max_bytes=10_000_000)  # 10MB max
```

---

## 📊 Monitoring & Logs

### **View Logs**
- Service dashboard → **Logs** tab
- Real-time streaming
- Search and filter logs

### **Health Checks**
Render auto-monitors `/api/health` endpoint. If it fails 3x, service restarts.

### **Metrics**
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

All visible in service dashboard.

---

## 🚀 Deployment Checklist

- [ ] GitHub repo set to public (or Render has access)
- [ ] `.dockerignore` excludes unnecessary files
- [ ] `Dockerfile` in project root
- [ ] `backend/requirements.txt` is current
- [ ] `OLLAMA_MODEL` is small (`orca-mini`)
- [ ] `.env.example` documents all variables
- [ ] Backend health endpoint working: `POST /api/health`
- [ ] Frontend build successful: `npm run build`
- [ ] Tested locally: `npm run dev` + `npm run backend`

---

## ⚡ Performance Tips

### **Faster Startup**
Use smaller model:
```bash
OLLAMA_MODEL=orca-mini  # Pulls in ~1GB, starts in seconds
```

### **Caching**
Add response caching middleware:
```python
from fastapi_cache2 import FastAPICache2
from fastapi_cache2.backends.inmemory import InMemoryBackend

FastAPICache2.init(InMemoryBackend())

@app.get("/api/documents", response_model=list)
@cached(namespace="documents", expire=3600)
async def list_documents():
    # Returns cached for 1 hour
```

### **Lazy Embedding**
Only embed on first request to knowledge base:
```python
if not client.list_collections():
    logger.info("Initializing vector DB...")
    client.get_collection("docs")
```

---

## 🐛 Troubleshooting

### **"Build failed: Docker image too large"**
→ Use `.dockerignore` to exclude:
```
node_modules
npm-debug.log
.git
__pycache__
```

### **"Model failed to download"**
→ Increase timeout in startup:
```bash
timeout 600 ollama pull orca-mini
```

### **"Out of memory: Model not loading"**
→ Use smaller model: `OLLAMA_MODEL=orca-mini`
→ Or upgrade to paid tier (more RAM)

### **"Knowledge base disappeared after restart"**
→ Add Render Disk (see Persistent Storage section above)

### **"Frontend can't reach backend"**
→ Check backend URL in frontend code
→ Verify backend service is running (check logs)
→ Allow CORS: Check `CORSMiddleware` config

---

## 💰 Pricing

| Item | Free Tier | Cost |
|------|-----------|------|
| Web Service | 750 hours/month | - |
| Static Site | Unlimited | - |
| Disk | 0.5 GB | $0.10/GB/month |
| Postgres | 100MB | $15/month for more |

**Typical setup cost**: $0-15/month

---

## 🌐 Custom Domain

1. Service → **Settings**
2. **Custom Domain**
3. Add: `aether.your-domain.com`
4. Update DNS CNAME records
5. Render provisions SSL automatically

---

## 📚 Render Resources

- [Render Docs](https://render.com/docs)
- [Docker on Render](https://render.com/docs/deploy-docker)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Persistent Disks](https://render.com/docs/disks)
- [Custom Domains](https://render.com/docs/custom-domains)

---

## ✅ Quick Decision Tree

```
Want simplest free deployment?
├─ YES → Use Render Static Site + Web Service Backend
└─ NO → Continue below

Need persistent knowledge base?
├─ YES → Use Render Disks (add to backend)
└─ NO → Ephemeral storage is fine

Plan to scale to paid?
├─ YES → Choose Render (easier upgrade path)
└─ NO → Any platform works
```

---

**Ready to deploy?** Click the Render button or follow Step 1 above! 🚀
