# 🚀 Complete Deployment Guide

**Your Aether RAG system is feature-complete!** This guide covers deployment across 6 platforms, from free to production-grade.

---

## 📍 Platform Overview

| Platform | Cost | Setup Time | Best For | Scalability |
|----------|------|-----------|----------|-------------|
| **Hugging Face Spaces** | Free (GPU: $20/mo) | 5 min | 🎓 Learning, demos | ⭐⭐ |
| **Railway** | $5-20/mo | 10 min | 🚀 Small projects | ⭐⭐⭐ |
| **Render** | Free tier, $15/mo+ | 8 min | 🔧 Full-stack apps | ⭐⭐⭐ |
| **Fly.io** | Free tier, pay-per-use | 12 min | ⚡ Global latency | ⭐⭐⭐⭐ |
| **AWS (ECS/Fargate)** | $20+/mo | 30 min | 📊 Production | ⭐⭐⭐⭐⭐ |
| **DigitalOcean (Droplet)** | $4-6/mo | 20 min | 💪 Full control | ⭐⭐⭐⭐ |

---

## 🎯 Quick Start: Recommended Path

### **For Experimentation** (No Credit Card)
```
1. Deploy to Hugging Face Spaces (free)
   See: README_HF_SPACES.md
2. Test knowledge base features
3. Get feedback from users
```

### **For Production** (Paid Setup)
```
1. Start with Railway ($5/mo to start)
   See: DEPLOY_RAILWAY.md
2. Add persistent storage (PostgreSQL)
3. Setup monitoring and CI/CD
4. Scale to Fly.io or AWS as needed
```

---

## 📋 Pre-Deployment Checklist

Run this **before** deploying to any platform:

```bash
# ✅ 1. Test locally
npm run dev        # Terminal 1: Frontend dev server
npm run backend    # Terminal 2: Backend API

# ✅ 2. Test frontend build
npm run build
npm run preview

# ✅ 3. Verify Docker build
docker build -t aether-test .
docker run -p 3000:3000 -p 8000:8000 aether-test

# ✅ 4. Lint code
npm run lint       # If configured

# ✅ 5. Push to GitHub
git add .
git commit -m "Pre-deployment"
git push origin main
```

---

## 🌐 Step-by-Step by Platform

### **1️⃣ Hugging Face Spaces** (Easiest Free Option)

**Setup time:** 5 minutes | **Cost:** Free (GPU tier: $20/mo)

```bash
# No local setup needed!
1. Go to huggingface.co/spaces
2. Create new Space (Docker)
3. Clone space locally
4. Copy Aether files
5. Git push to HF
```

👉 **Full guide:** [README_HF_SPACES.md](README_HF_SPACES.md)

**Pros:**
- ✅ Completely free, no credit card
- ✅ GPUs available ($20/mo)
- ✅ Great for sharing demos
- ✅ HF community features

**Cons:**
- ❌ Persistent storage limited
- ❌ 24-48 hour resets without paid tier
- ❌ Slower cold starts

---

### **2️⃣ Railway** (Best Balance)

**Setup time:** 10 minutes | **Cost:** $5-20/mo

```bash
# Recommended first paid deployment
1. Push repo to GitHub
2. Visit railway.app
3. Connect GitHub repo
4. Set 3 environment variables
5. One-click deploy
```

👉 **Full guide:** [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)

**Pros:**
- ✅ Very easy (1-click GitHub connection)
- ✅ Native multi-service support
- ✅ Cheap and straightforward pricing
- ✅ Good documentation

**Cons:**
- ❌ Requires credit card
- ❌ Storage resets on restart (use Postgres add-on)
- ❌ Less flexible than VPS

---

### **3️⃣ Render** (Most Flexible Free Tier)

**Setup time:** 8 minutes | **Cost:** Free tier + paid upgrades

```bash
1. Visit render.com
2. New Web Service (Docker)
3. Connect GitHub
4. Deploy!
5. (Optional) Add Render Disk for persistence
```

👉 **Full guide:** [DEPLOY_RENDER.md](DEPLOY_RENDER.md)

**Pros:**
- ✅ Free tier available
- ✅ No hidden fees
- ✅ Render Disks for persistence
- ✅ Easy scaling

**Cons:**
- ❌ Spins down free tier after 15 mins inactivity
- ❌ Slightly slower than paid platforms
- ⚠️ Can be expensive to scale

---

### **4️⃣ Fly.io** (Global Deployment)

**Setup time:** 12 minutes | **Cost:** Free tier, then $5/mo

```bash
# Install Fly CLI
curl https://fly.io/install.sh | sh

# Deploy
flyctl launch --name aether-rag
flyctl deploy
```

**Pros:**
- ✅ Excellent free tier (3 shared-cpu VMs)
- ✅ Auto-deploys from GitHub push
- ✅ Global edge deployment
- ✅ Super fast startup

**Cons:**
- ❌ CLI required (not as visual)
- ❌ Less beginner-friendly
- ❌ Requires credit card for scale

---

### **5️⃣ AWS (ECS / Fargate)** (Production-Grade)

**Setup time:** 30 minutes | **Cost:** $20+/mo

```bash
# Use AWS Console or CLI
aws ecs create-cluster --cluster-name aether-rag
aws ecs register-task-definition --cli-input-json file://task.json
aws ecs create-service --cluster aether-rag --service-name aether-api ...
```

**Pros:**
- ✅ Unlimited scaling
- ✅ Production monitoring built-in
- ✅ Auto-scaling groups
- ✅ Industry standard

**Cons:**
- ❌ Complex setup
- ❌ Expensive if not optimized
- ❌ Steep learning curve
- ❌ Need AWS knowledge

**When to use:** Big budget, millions of users, enterprise needs

---

### **6️⃣ DigitalOcean Droplet** (Full Control)

**Setup time:** 20 minutes | **Cost:** $4-6/mo

```bash
1. Create Ubuntu 22.04 Droplet ($5/mo)
2. SSH in
3. Install Docker
4. Clone your repo
5. docker-compose up
```

**Pros:**
- ✅ Cheapest paid option
- ✅ Full control and SSH access
- ✅ Can run anything
- ✅ Excellent support

**Cons:**
- ❌ Manual scaling
- ❌ Your responsibility for uptime
- ❌ Need Linux knowledge
- ❌ No auto-restarts without setup

**When to use:** Developers who like control, small teams, learning

---

## 🔧 Common Setup Patterns

### **Pattern A: Free Tier Testing**
```
HF Spaces → Get feedback → 
  ├─ If popular: upgrade to Railway
  └─ If niche: stay on HF Spaces
```

### **Pattern B: Quick MVP**
```
Railway → PostgreSQL add-on → Monitor → 
  ├─ Low traffic: Keep on Railway
  └─ High traffic: Migrate to AWS
```

### **Pattern C: Permanent Side Project**
```
DigitalOcean $5 Droplet → Docker + Supervisor →
  ├─ Manual updates
  └─ Full control
```

---

## 🔐 Production Checklist

Before going to production, ensure:

- [ ] **Security**
  - [ ] HTTPS enabled (auto on most platforms)
  - [ ] CORS restricted to specific origins
  - [ ] API keys/secrets in environment variables (not code)
  - [ ] Input validation on all endpoints
  - [ ] Rate limiting enabled

- [ ] **Monitoring**
  - [ ] Health check endpoint working
  - [ ] Error logging configured
  - [ ] Uptime monitoring (Uptime Robot, etc.)
  - [ ] Performance metrics tracked

- [ ] **Data**
  - [ ] Persistent storage configured
  - [ ] Regular backups enabled
  - [ ] Database indexed
  - [ ] Vector DB optimized

- [ ] **Performance**
  - [ ] Frontend assets minified
  - [ ] Gzip compression enabled
  - [ ] CDN configured (optional)
  - [ ] Database connection pooling

- [ ] **Documentation**
  - [ ] README updated with setup steps
  - [ ] Environment variables documented
  - [ ] Troubleshooting guide created
  - [ ] API docs generated

---

## 🚨 Troubleshooting by Platform

### **HF Spaces**
```
Issue: "Build timeout"
→ Use smaller Dockerfile, exclude node_modules

Issue: "Model download failed"
→ Increase disk quota in Space settings

Issue: "Knowledge base lost"
→ Use HF Spaces persistent storage
```

### **Railway**
```
Issue: "Pip install timeout"
→ Add --no-cache-dir to pip install

Issue: "Service keeps restarting"
→ Check logs, likely out of memory

Issue: "Frontend can't reach backend"
→ Verify CORS configuration
```

### **Render**
```
Issue: "Service spins down"
→ Upgrade to paid tier, or use cron job

Issue: "Disk space full"
→ Add Render Disk or clean log files

Issue: "Model too slow"
→ Use smaller model (orca-mini)
```

---

## 📊 Cost Comparison (Monthly)

```
┌─────────────────────────────────────┐
│ Platform         │ Typical Cost     │
├─────────────────────────────────────┤
│ HF Spaces        │ FREE → $20 (GPU) │
│ Railway          │ $5-20            │
│ Render           │ FREE → $15+      │
│ Fly.io           │ FREE → $5+       │
│ DigitalOcean     │ $5-12            │
│ AWS              │ $20-100+         │
└─────────────────────────────────────┘

💡 Recommendation for startups:
Start FREE (HF Spaces) → $5-10/mo (Railway) → Scale as needed
```

---

## 🎯 Decision Flowchart

```
Starting your deployment?

1. Question: Need it free?
   YES → HF Spaces (README_HF_SPACES.md)
   NO  → Continue

2. Question: Want easy setup?
   YES → Railway (DEPLOY_RAILWAY.md) or Render (DEPLOY_RENDER.md)
   NO  → Continue

3. Question: Need global deployment?
   YES → Fly.io
   NO  → Continue

4. Question: Enterprise/High scale?
   YES → AWS
   NO  → DigitalOcean (cheapest paid)
```

---

## ✨ Next Steps

1. **Choose a platform** from the decision tree above
2. **Follow the specific platform guide:**
   - HF Spaces: [README_HF_SPACES.md](README_HF_SPACES.md)
   - Railway: [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)
   - Render: [DEPLOY_RENDER.md](DEPLOY_RENDER.md)
3. **Test your deployment** (upload docs, run queries)
4. **Set up monitoring** (logs, health checks, alerts)
5. **Share your live app!** 🎉

---

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Ollama Production Setup](https://github.com/ollama/ollama/blob/main/docs/faq.md)

---

**Questions?** Check your chosen platform's official docs or create an issue in the repository! 🚀
