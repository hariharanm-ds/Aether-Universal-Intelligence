# Aether RAG System - Installation & Setup Guide

## ✅ What's Installed

### Frontend (React + TypeScript)
- **185 npm packages** installed successfully
- React 19.0.0, TailwindCSS, Vite, Framer Motion, Lucide Icons
- **RAG-enabled UI** with knowledge base manager, document upload, retrieved chunk display

### Backend (Python + RAG)
- **FastAPI** 0.115.8 ✅
- **Uvicorn** 0.34.0 ✅
- **Chroma** - Vector database for document storage ✅
- **sentence-transformers** - Local embeddings ✅
- **.env file** configured ✅

---

## 🎯 System Architecture

```
┌─────────────┐                              ┌──────────────────┐
│   Browser   │                              │  Ollama (LLaMA3) │
│  (React UI) │                              │  @ localhost:11434
└──────┬──────┘                              └──────────────────┘
       │                                            △
       │ HTTP requests                             │ API calls
       ▼                                            │
┌──────────────────────┐    ┌──────────────────┐  │
│   FastAPI Backend    │◄──►│  Chroma (Vector  │  │
│ @ localhost:8000     │    │  DB) + Embeddings│  │
└──────────────────────┘    └──────────────────┘  │
       │                                           │
       └───────────────────────────────────────────┘

Endpoints:
- /api/rag-query       : Query with RAG (retrieves context)
- /api/analyze         : Direct analysis (no RAG)
- /api/ingest          : Upload documents to knowledge base
- /api/documents       : List ingested documents
- /api/documents/{id}  : Delete specific document
```

---

## 🚀 Quick Start (Step-by-Step)

### **1️⃣ Install Ollama** (one-time)
- Download from https://ollama.ai/
- Install and launch the Ollama app

### **2️⃣ Start Ollama Service**
Open a PowerShell terminal:
```powershell
ollama serve
```
Wait for: `Listening on 127.0.0.1:11434`

### **3️⃣ Download a Model** (one-time)
Open a NEW PowerShell and run:
```powershell
ollama pull llama3
```
(Or: `mistral`, `neural-chat`, etc.)

### **4️⃣ Install Python Dependencies**
```powershell
python -m pip install -r backend/requirements.txt
```

This installs:
- FastAPI
- Chroma (vector database)
- sentence-transformers (embeddings)
- requests

### **5️⃣ Start the Backend**
```powershell
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### **6️⃣ Start the Frontend**
In a NEW terminal:
```powershell
npm run dev
```

### **7️⃣ Open the App**
- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:8000/api/health

---

## 📚 Using the RAG System

### **Upload Documents**
1. Click the **📚 Knowledge Base** button (left sidebar)
2. **Drag & drop** or **click to upload** documents
3. Supported formats: `.txt`, `.pdf`, `.md`, `.json`, `.csv`

### **Query with RAG**
1. In the **Advanced Config**, ensure **RAG Mode** is **Enabled**
2. Set **Context Chunks (Top-K)** to control how many chunks are retrieved (default: 3)
3. Type your query and click **Execute Synthesis**
4. The system will:
   - Search the knowledge base for relevant chunks
   - Pass them to LLaMA as context
   - Generate an answer based on your documents

### **View Retrieved Chunks**
After a RAG query, click the **RAG Context** tab to see:
- Which documents were used
- Retrieved text chunks
- Similarity scores (how relevant each chunk is)

### **Manage Knowledge Base**
- **View documents**: Click 📚 Knowledge Base → see all ingested files
- **Delete document**: Click trash icon next to any document
- **Clear all**: Click "Clear All" button

---

## ⚙️ Configuration

Edit [`.env`](.env):

```env
OLLAMA_API_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"
APP_URL="http://localhost:3000"
```

### In the UI (Advanced Config):
- **RAG Mode**: Enable/disable retrieval
- **Context Chunks (Top-K)**: How many document chunks to retrieve (1-10)
- **Neural Model**: Which Ollama model to use
- **Neural Depth (Temperature)**: Creativity vs. accuracy (0.0-1.0)
- **Grounding**: Evidence-based reasoning toggle

---

## 📁 Project Structure

```
Aether-universal-intelligence/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── IntelligenceConsole.tsx    (Main UI with RAG controls)
│   │   │   ├── KnowledgebaseManager.tsx   (Doc upload & management)
│   │   │   ├── AnalysisResult.tsx         (Shows RAG context tab)
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── llama.ts                   (API client)
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app.py                   (FastAPI server with RAG endpoints)
│   ├── llama_service.py         (Ollama integration)
│   ├── rag_service.py           (RAG logic: embeddings, retrieval)
│   ├── requirements.txt          (Python dependencies)
│   └── rag_data/               (Chroma vector DB - created automatically)
│
├── .env                        (Model & configuration)
└── README.md
```

---

## 🔍 How RAG Works

### Document Ingestion
```
1. User uploads document
2. Backend chunks text (512 chars, 100-char overlap)
3. sentence-transformers creates embeddings
4. Chroma stores embeddings in vector DB
```

### Query Processing
```
1. User types query
2. Query is embedded (same transformer)
3. Chroma searches for similar chunks (cosine similarity)
4. Top-K chunks are retrieved
5. Query + chunks → LLaMA → Answer
6. Frontend shows chunks used in "RAG Context" tab
```

---

## 🐛 Troubleshooting

### **"Ollama service is not running"**
→ Run `ollama serve` in a terminal (Terminal 1)

### **"No module named 'chromadb'"**
→ Run: `python -m pip install -r backend/requirements.txt`

### **RAG returns no results**
→ Upload documents first! Use the 📚 Knowledge Base button

### **Model too slow**
→ Use a smaller model: `ollama pull mistral` or `neural-chat`

### **Port 8000 already in use**
→ Kill the process: `netstat -ano | findstr :8000` → `taskkill /PID xxxxx /F`

---

## 📊 Performance Tips

- **Faster responses**: Use smaller models (`mistral`, `neural-chat`)
- **Better accuracy**: Use larger models (`llama2:13b`) if you have 8GB+ RAM
- **Better retrieval**: Increase `top_k` to 5-10 for longer documents
- **Lower latency**: Lower chunk size in `rag_service.py` (search in 256-char chunks instead of 512)

---

## 🚢 Deployment

To run in production:

1. Replace `ollama serve` with a deployed Ollama instance (Docker, cloud)
2. Update `OLLAMA_API_URL` in `.env`
3. Use a persistent Chroma database path
4. Build frontend: `npm run build`
5. Deploy both to your server

---

## 📝 Next Steps

1. **Upload your documents** via the Knowledge Base manager
2. **Test queries** that reference your documents
3. **View retrieved chunks** to understand what's being used
4. **Adjust RAG settings** (top-k, temperature) for better results
5. **Add more documents** to expand the knowledge base

---

**Questions?** Check backend logs (`Terminal 5`) for detailed error messages.
