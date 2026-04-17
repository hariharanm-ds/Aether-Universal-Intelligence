import os
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llama_service import analyze_query
from rag_service import (
    ingest_document,
    retrieve_context,
    list_documents,
    delete_document,
    clear_all,
)

app = FastAPI(title="Aether LLaMA RAG Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class FileData(BaseModel):
    data: str
    mimeType: str


class HistoryItem(BaseModel):
    query: str
    answer: str


class AnalyzeConfig(BaseModel):
    useGrounding: Optional[bool] = False
    model: Optional[str] = "llama3"
    temperature: Optional[float] = 0.4
    history: Optional[list[HistoryItem]] = None


class AnalyzeRequest(BaseModel):
    query: str
    fileData: Optional[FileData] = None
    config: Optional[AnalyzeConfig] = AnalyzeConfig()


class RAGQueryRequest(BaseModel):
    query: str
    use_rag: bool = True
    top_k: int = 3
    config: Optional[AnalyzeConfig] = AnalyzeConfig()


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "backend": "Aether LLaMA RAG"}


@app.post("/api/analyze")
def analyze(request: AnalyzeRequest) -> Dict[str, object]:
    """Direct analysis without RAG (file-based)."""
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query text is required.")

    try:
        result = analyze_query(
            query=request.query,
            file_data=request.fileData.dict() if request.fileData else None,
            config=request.config.dict() if request.config else {}
        )
        return result
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")


@app.post("/api/rag-query")
def rag_query(request: RAGQueryRequest) -> Dict[str, object]:
    """RAG-based query: retrieves context, then generates answer."""
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query text is required.")

    try:
        # Step 1: Retrieve context
        retrieval = retrieve_context(
            query=request.query,
            top_k=request.top_k
        )

        # Step 2: If RAG enabled and context found, augment the query
        augmented_query = request.query
        if request.use_rag and retrieval["context"]:
            augmented_query = f"""Based on the following context, answer the user's question:

CONTEXT:
{retrieval['context']}

USER QUESTION:
{request.query}"""

        # Step 3: Generate answer with LLaMA
        result = analyze_query(
            query=augmented_query,
            file_data=None,
            config=request.config.dict() if request.config else {}
        )

        # Step 4: Add retrieval metadata to response
        result["rag_context"] = {
            "retrieved": True,
            "chunks_used": len(retrieval["chunks"]),
            "sources": list(set([c["source"] for c in retrieval["chunks"]])),
            "chunks": retrieval["chunks"]
        }

        return result

    except ConnectionError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {exc}")


@app.post("/api/ingest")
async def ingest(file: UploadFile = File(...), doc_id: Optional[str] = None) -> Dict[str, object]:
    """Ingest a document into the knowledge base."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required.")

    try:
        # Read file content
        content = await file.read()
        text = content.decode("utf-8", errors="ignore")

        if not text.strip():
            raise HTTPException(status_code=400, detail="File is empty or not text.")

        # Use filename as doc_id if not provided
        doc_id = doc_id or file.filename.replace(".", "_").replace("/", "_")

        # Ingest into RAG
        result = ingest_document(
            doc_id=doc_id,
            filename=file.filename,
            content=text
        )

        return result

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {exc}")


@app.get("/api/documents")
def get_documents() -> Dict[str, object]:
    """List all ingested documents."""
    try:
        return list_documents()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {exc}")


@app.delete("/api/documents/{doc_id}")
def remove_document(doc_id: str) -> Dict[str, object]:
    """Delete a document from the knowledge base."""
    try:
        return delete_document(doc_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Deletion failed: {exc}")


@app.delete("/api/documents/clear-all")
def clear_knowledge_base() -> Dict[str, object]:
    """Clear all documents from the knowledge base."""
    try:
        return clear_all()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Clear failed: {exc}")
