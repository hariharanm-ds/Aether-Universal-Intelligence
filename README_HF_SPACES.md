# Deploy Aether RAG to Hugging Face Spaces

## 🚀 Quick Deploy to HF Spaces (5 minutes)

### **Step 1: Create HF Space**
1. Go to https://huggingface.co/spaces
2. Click **Create New Space**
3. Fill in:
   - Name: `aether-rag`
   - Type: **Docker**
   - Visibility: **Public** (or Private)
4. Click **Create Space**

### **Step 2: Clone & Upload**
```bash
# Clone the created space
git clone https://huggingface.co/spaces/YOUR_USERNAME/aether-rag
cd aether-rag

# Copy your Aether files
cp -r ../Aether-universal-intelligence/* .

# Push to HF
git add .
git commit -m "Initial Aether RAG deployment"
git push
```

### **Step 3: Configure**
HF will automatically:
1. Read the `Dockerfile`
2. Build the image (takes ~10 mins)
3. Deploy on their free GPU/CPU tier
4. Provide a public URL

**That's it!** Your app is live at: `https://huggingface.co/spaces/YOUR_USERNAME/aether-rag`

---

## ⚡ Deploy to Other Platforms

### **Option 2: Railway** (Easy, $5/month free credits)
1. Go to https://railway.app
2. Click **New Project**
3. Select **GitHub**
4. Connect your repo with `Dockerfile`
5. Set environment variables
6. Deploy with one click

### **Option 3: Render** (Easy, free tier available)
1. Go to https://render.com
2. **New Web Service**
3. Connect Git repo
4. Build command: `npm run build && pip install -r backend/requirements.txt`
5. Start: `cd backend && uvicorn app:app --host 0.0.0.0`

### **Option 4: Docker Hub + Fly.io** (Advanced)
```bash
# Build & push to Docker Hub
docker build -t your-username/aether-rag .
docker push your-username/aether-rag

# Deploy on Fly.io (free tier)
flyctl launch --image your-username/aether-rag
```

### **Option 5: AWS, Azure, GCP** (Production-grade)
All support Docker deployments:
- **AWS ECS/AppRunner**: `docker push` → auto-host
- **Google Cloud Run**: Serverless, pay-per-use
- **Azure Container Instances**: Similar to GCP

---

## 🔧 Important Notes

### **Model Size**
- Ollama models can be large (4-13GB)
- **Free tier limitations**: Limited disk space
- **Solution**: Use HF Spaces with GPU tier or paid hosting

### **Storage**
- Chroma vector DB is stored in `/app/rag_data/`
- On Hugging Face: Persists within the Space
- **Note**: HF resets every 24-48 hours unless you use persistent storage

### **Persistent Knowledge Base**
For production, migrate to cloud storage:

```python
# In backend/rag_service.py, replace:
CHROMA_DATA_DIR = os.path.join(os.path.dirname(__file__), "rag_data")

# With cloud path:
CHROMA_DATA_DIR = "/persistent/rag_data"  # HF Spaces persistent storage
# OR
CHROMA_DATA_DIR = "s3://your-bucket/rag_data"  # AWS S3
```

---

## 📦 Deployment Checklist

Before deploying:
- [ ] Update `.env` with production URLs
- [ ] Set `OLLAMA_API_URL` to public endpoint
- [ ] Test locally: `npm run dev` + `npm run backend`
- [ ] Build frontend: `npm run build`
- [ ] Ensure `Dockerfile` is in root directory
- [ ] Add `.gitignore` (exclude `node_modules/`, `rag_data/`, `.env`)

---

## 🌐 After Deployment

### **Access Your App**
- Frontend: `https://<your-space>.hf.space`
- Backend API: `https://<your-space>.hf.space:8000/api/health`

### **Update Knowledge Base**
If using HF Spaces with persistent storage:
- Upload through UI (documents persist)
- Or via API: `POST /api/ingest`

### **Monitor Logs**
- HF Spaces: Shows in the Space page (Logs tab)
- Railway/Render: Real-time logs dashboard

---

## 💰 Cost Comparison

| Platform | Cost | Best For |
|----------|------|----------|
| **HF Spaces** | Free (GPU tier $20/mo) | Testing, demos, learning |
| **Railway** | $5-20/mo | Small projects, hobby |
| **Render** | Free tier available | Hobby projects |
| **Fly.io** | Free tier (3 shared-cpu-1x 256MB VMs) | Testing |
| **AWS/GCP** | Pay-per-use | Production, scalability |

---

## 🐛 Troubleshooting

### **"Ollama not found"**
→ Dockerfile installs it; ensure sufficient disk space

### **"Model too large for deployment"**
→ Use smaller model in `.env`: `OLLAMA_MODEL=mistral`

### **"Knowledge base lost after restart"**
→ Use persistent storage (HF Spaces or mount cloud volume)

### **"Port already in use"**
→ Change ports in startup script or environment variables

---

## 📚 More Resources

- [HF Spaces Docker Docs](https://huggingface.co/docs/hub/spaces-overview)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs/)

**Ready to deploy?** Start with HF Spaces—it's the easiest! 🚀
