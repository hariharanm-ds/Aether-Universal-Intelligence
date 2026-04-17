# Deploy Aether RAG to Railway

Railway is one of the easiest alternatives to Hugging Face Spaces with native Python support and generous free tier.

## 🚀 Quick Deploy (10 minutes)

### **Step 1: Prepare Repository**

Ensure your repo is on GitHub (Railway requires it):
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/aether-rag.git
git push -u origin main
```

### **Step 2: Create Railway Account**
1. Go to https://railway.app
2. Sign up with GitHub (recommended for instant repo connection)
3. Click **New Project**

### **Step 3: Deploy**
1. Select **Deploy from GitHub**
2. Connect your `aether-rag` repository
3. Railway auto-detects:
   - **Node.js** service (frontend)
   - **Python** service (backend from `requirements.txt`)
4. Click **Deploy**

### **Step 4: Configure Environment**
In Railway dashboard:

**Frontend Service:**
- Build Command: `npm install && npm run build`
- Start Command: `npm run preview`
- Port: `3000`

**Backend Service:**
1. Add plugin: **PostgreSQL** or **Redis** (optional, for session storage)
2. Set environment variables:
   ```
   OLLAMA_API_URL=http://localhost:11434
   OLLAMA_MODEL=llama3
   ```
3. Start Command: `cd backend && uvicorn app:app --host 0.0.0.0 --port 8000`

### **Step 5: Link Services**
In Railway Services tab:
- Connect Frontend to Backend
- Add proxy rule: `/api` → Backend service (8000)

**Done!** Your app is live at: `https://your-project.up.railway.app`

---

## 📋 Full Configuration Files

### **railway.json** (Optional, but recommended)
Create `railway.json` in your project root:

```json
{
  "build": {
    "builder": "dockerfile"
  },
  "deploy": {
    "restartPolicyType": "on_failure",
    "maxInstances": 1
  }
}
```

This tells Railway to:
- Use your `Dockerfile`
- Restart on crash
- Use single instance (free tier)

### **Procfile** (Alternative to custom start commands)
```
web: npm run build && npm run preview
api: cd backend && uvicorn app:app --host 0.0.0.0 --port 8000
```

---

## 🔧 Important Configuration

### **Port Management**
- Frontend: `3000` (Railway assigns dynamically)
- Backend: `8000` (internal, Railway proxies)
- Make both listen on `0.0.0.0` (required for cloud)

### **Environment Variables in Railway**

Click **Add Variable** for each:

| Key | Value |
|-----|-------|
| `OLLAMA_API_URL` | `http://localhost:11434` |
| `OLLAMA_MODEL` | `mistral` (smaller) or `llama3` |
| `NODE_ENV` | `production` |
| `PYTHONUNBUFFERED` | `1` |

**Note**: Set `mistral` for free tier (smaller model, faster)

### **Ollama Model Size**
Free tier has ~500MB limit on installed models:
- ❌ `llama2` (4GB) - Too large
- ✅ `mistral` (5GB, but uses compression)
- ✅ `neural-chat` (4.1GB)
- ✅ `orca-mini` (1.7GB) - **Recommended for free tier**

Update `.env`:
```
OLLAMA_MODEL=orca-mini
```

---

## 📦 Dependency Notes

### **Backend Dependencies**
Railway auto-installs from `backend/requirements.txt`:
```
fastapi>=0.115.0
uvicorn[standard]>=0.34.0
requests>=2.31.0
chromadb>=0.4.0
sentence-transformers>=2.2.0
python-multipart>=0.0.6
```

### **Frontend Dependencies**
Railway auto-installs from `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 3000"
  }
}
```

---

## 🌐 Custom Domain

1. Go to project settings
2. **Domains** → Add Domain
3. Add your domain: `aether-rag.your-domain.com`
4. Follow DNS configuration
5. Railway auto-generates SSL certificate

---

## 📊 Monitoring

### **View Logs**
- Click service → **Deployments** tab
- Select latest deployment
- View real-time logs

### **Check Health**
```bash
curl https://your-project.up.railway.app/api/health
```

Expected response:
```json
{"status": "ok"}
```

### **Resource Usage**
- Click project → **Usage** tab
- See CPU, Memory, Storage percentages
- Free tier: 100 hours/month shared resources

---

## ⚡ Performance Tips

1. **Use smaller models**: `orca-mini` over `llama3`
2. **Enable compression**: Add to backend startup:
   ```bash
   GZIP=true uvicorn app:app --host 0.0.0.0 --port 8000
   ```
3. **Cache embeddings**: Use Redis plugin (optional)
4. **Limit knowledge base size**: Chroma auto-indexes all docs

---

## 💾 Persistent Storage

By default, RAG knowledge base (`/app/rag_data/`) is lost on restart.

### **Solution 1: Railway Postgres** (Recommended)
Use Postgres for vector storage instead of Chroma:

```python
# In backend/rag_service.py
import psycopg2
DB_URL = os.getenv("DATABASE_URL")  # Railway auto-provides this
# Replace Chroma with Postgres + pgvector
```

### **Solution 2: Connect to External S3** (AWS)
```python
import boto3
s3 = boto3.client('s3', region_name='us-east-1')
# Upload rag_data/ to S3 periodically or on-demand
```

### **Solution 3: Ephemeral Storage** (Current Approach)
Accept that knowledge base resets on deploy. Users must re-upload docs.

**Recommended**: Solution 1 (Postgres) for production.

---

## 🐛 Troubleshooting

### **"Build failed: pip install error"**
→ Add `--no-cache-dir` to pip: Update `backend/requirements.txt`
```
pip install --no-cache-dir ...
```

### **"Timeout: Ollama model too slow"**
→ Use faster model: Change `OLLAMA_MODEL=orca-mini`

### **"Out of memory on free tier"**
→ Restart service manually: Click service → **Restart**

### **"Knowledge base disappeared"**
→ Expected on free tier (ephemeral storage). Implement Solution 1 above.

### **"Frontend/Backend connection failed"**
→ Check proxy rule: Frontend service must have rule to Backend
→ Verify both services show `UP` in Railway dashboard

---

## 📚 Railway Resources

- [Railway Docs](https://docs.railway.app/)
- [Deploy from GitHub](https://docs.railway.app/deploy/github)
- [Environment Variables](https://docs.railway.app/develop/variables)
- [Custom Domains](https://docs.railway.app/deploy/exposing-your-app)
- [Pricing](https://railway.app/pricing)

---

## 🎯 Next Steps

1. ✅ Push repo to GitHub
2. ✅ Create Railway account
3. ✅ Deploy project
4. ✅ Set environment variables
5. ✅ Test at `https://your-project.up.railway.app`
6. ⚡ (Optional) Add Postgres for persistent storage
7. 🌐 (Optional) Connect custom domain

**Questions?** Check Railway docs or create an issue in your repo!
