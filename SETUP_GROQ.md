# Aether RAG System - Installation & Setup Guide (Groq Edition)

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
- **Groq SDK** - Fast LLM inference ✅
- **.env file** configured ✅

---

## 🎯 System Architecture

```
┌─────────────┐                              ┌──────────────────┐
│   Browser   │                              │  Groq API        │
│  (React UI) │                              │  (LLaMA3-70B)    │
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

### **1️⃣ Get Groq API Key**
- Go to https://console.groq.com/keys
- Sign up or log in with your account
- Create an API key
- Copy it (you'll need it for the next step)

### **2️⃣ Set Environment Variable**
Open PowerShell and set your Groq API key:

```powershell
# For current session only:
$env:GROQ_API_KEY = "your-api-key-here"

# To make it permanent (optional):
[Environment]::SetEnvironmentVariable("GROQ_API_KEY", "your-api-key-here", "User")
```

Verify it's set:
```powershell
echo $env:GROQ_API_KEY
```

### **3️⃣ Install Python Dependencies**
```powershell
python -m pip install -r backend/requirements.txt
```

This installs:
- FastAPI
- Chroma (vector database)
- sentence-transformers (embeddings)
- Groq SDK
- requests

### **4️⃣ Start the Backend**
```powershell
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
Uvicorn running on http://0.0.0.0:8000
```

### **5️⃣ Start the Frontend**
In a NEW terminal:
```powershell
npm run dev
```

### **6️⃣ Open the App**
- **Frontend**: http://localhost:3000 (or shown in terminal)
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
   - Pass them to Groq LLaMA3 as context
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
GROQ_API_KEY="gsk_your-api-key-here"
GROQ_MODEL="llama3-70b-8192"
APP_URL="http://localhost:3000"
```

### In the UI (Advanced Config):
- **RAG Mode**: Enable/disable retrieval
- **Context Chunks (Top-K)**: How many document chunks to retrieve (1-10)
- **Neural Model**: Which Groq model to use (llama3-70b-8192, mixtral-8x7b-32768, etc.)
- **Neural Depth (Temperature)**: Creativity vs. accuracy (0.0-1.0)
- **Grounding**: Evidence-based reasoning toggle

### Available Groq Models:
- **llama3-70b-8192** (Recommended) - Latest, most capable
- **llama2-70b-4096** - Stable, good performance
- **mixtral-8x7b-32768** - Fast, good for quick responses

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
│   │   │   └── groq.ts                    (Groq API client)
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app.py                   (FastAPI server with RAG endpoints)
│   ├── groq_service.py          (Groq integration)
│   ├── rag_service.py           (RAG logic: embeddings, retrieval)
│   ├── requirements.txt          (Python dependencies)
│   └── rag_data/               (Chroma vector DB - created automatically)
│
├── .env                        (Groq API key & configuration)
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
5. Query + chunks → Groq LLaMA3 → Answer
6. Frontend shows chunks used in "RAG Context" tab
```

---

## 🐛 Troubleshooting

### **"Groq API key is not set"**
→ Run: `$env:GROQ_API_KEY = "your-key-here"`
→ Or add it to your `.env` file

### **"Groq API request failed"**
→ Verify your API key is correct at https://console.groq.com/keys
→ Check your internet connection
→ Ensure the model name is correct in config

### **"No module named 'groq'"**
→ Run: `python -m pip install groq>=0.4.1`

### **"No module named 'chromadb'"**
→ Run: `python -m pip install chromadb sentence-transformers`

### **"Connection refused" on backend**
→ Make sure backend is running: `cd backend && uvicorn app:app --reload`

### **"CORS error" in frontend**
→ Backend CORS middleware is already configured
→ Ensure backend is at http://localhost:8000

### **Frontend shows "Cannot POST /api/analyze"**
→ Verify backend is running at http://localhost:8000/api/health
→ Check browser console for detailed error

---

## 🌟 Performance Tips

1. **Use larger context chunks (Top-K=5-10)** for complex queries
2. **Enable RAG Mode** for accurate, sourced answers
3. **Pre-upload relevant documents** before querying
4. **Set temperature to 0.4-0.7** for balanced responses
5. **Monitor Groq API usage** at https://console.groq.com/usage

---

## 📖 Additional Resources

- **Groq Docs**: https://console.groq.com/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **Chroma**: https://docs.trychroma.com/
- **LLaMA3**: https://github.com/meta-llama/llama3

---

## ✨ Features

✅ **Fast LLM Inference** - Groq's language runtime for quick responses
✅ **RAG Integration** - Semantic search + document grounding
✅ **Vector Database** - Chroma for efficient similarity search
✅ **Local Embeddings** - sentence-transformers for privacy
✅ **Modern UI** - React + TailwindCSS + Framer Motion
✅ **Full API** - Upload, delete, query, list documents
✅ **Advanced Config** - Control temperature, model, grounding
✅ **RAG Context Display** - See which documents influenced your answer
