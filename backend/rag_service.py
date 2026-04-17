import os
from typing import Any, Dict, List, Optional

import chromadb
from sentence_transformers import SentenceTransformer

# Initialize Chroma client with persistent storage
CHROMA_DATA_DIR = os.path.join(os.path.dirname(__file__), "rag_data")
os.makedirs(CHROMA_DATA_DIR, exist_ok=True)

CHROMA_CLIENT = chromadb.PersistentClient(path=CHROMA_DATA_DIR)
EMBEDDING_MODEL = SentenceTransformer("all-MiniLM-L6-v2")  # Lightweight, fast embeddings

# Chroma collection for documents
COLLECTION_NAME = "aether_knowledge_base"


def get_or_create_collection():
    """Get or create the knowledge base collection."""
    return CHROMA_CLIENT.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )


def chunk_text(text: str, chunk_size: int = 512, overlap: int = 100) -> List[str]:
    """
    Split text into overlapping chunks.
    
    Args:
        text: Input text to chunk
        chunk_size: Max characters per chunk
        overlap: Character overlap between chunks
    
    Returns:
        List of text chunks
    """
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start = end - overlap
    
    return [c for c in chunks if len(c) > 50]  # Filter out very short chunks


def ingest_document(doc_id: str, filename: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Ingest a document into the knowledge base.
    
    Args:
        doc_id: Unique document identifier
        filename: Source filename
        content: Document text content
        metadata: Optional metadata dict
    
    Returns:
        Ingestion result with chunk count
    """
    collection = get_or_create_collection()
    
    # Split into chunks
    chunks = chunk_text(content)
    
    if not chunks:
        return {"status": "error", "message": "Document too short or empty"}
    
    # Prepare documents and metadata
    ids = [f"{doc_id}:{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "source": filename,
            "doc_id": doc_id,
            "chunk_index": i,
            **(metadata or {})
        }
        for i in range(len(chunks))
    ]
    
    # Add to collection (Chroma handles embedding internally)
    collection.add(
        ids=ids,
        documents=chunks,
        metadatas=metadatas
    )
    
    return {
        "status": "success",
        "doc_id": doc_id,
        "filename": filename,
        "chunks_added": len(chunks),
        "total_chars": len(content)
    }


def retrieve_context(query: str, top_k: int = 3, similarity_threshold: float = 0.3) -> Dict[str, Any]:
    """
    Retrieve relevant context chunks for a query.
    
    Args:
        query: User query text
        top_k: Number of top chunks to retrieve
        similarity_threshold: Minimum similarity score (0-1)
    
    Returns:
        Retrieved chunks with metadata and relevance scores
    """
    collection = get_or_create_collection()
    
    # Query the collection
    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        where=None  # Can add filters here if needed
    )
    
    if not results or not results["documents"] or not results["documents"][0]:
        return {
            "query": query,
            "chunks": [],
            "total_retrieved": 0,
            "context": ""
        }
    
    # Process results
    retrieved_chunks = []
    for doc, metadata, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        # Convert distance to similarity (0-1, higher is better)
        similarity = 1 - distance
        
        if similarity >= similarity_threshold:
            retrieved_chunks.append({
                "text": doc,
                "source": metadata.get("source", "unknown"),
                "doc_id": metadata.get("doc_id"),
                "chunk_index": metadata.get("chunk_index"),
                "similarity": round(similarity, 3)
            })
    
    # Build context string
    context = "\n\n".join([
        f"[From {chunk['source']}]\n{chunk['text']}"
        for chunk in retrieved_chunks
    ])
    
    return {
        "query": query,
        "chunks": retrieved_chunks,
        "total_retrieved": len(retrieved_chunks),
        "context": context
    }


def list_documents() -> Dict[str, Any]:
    """
    List all ingested documents.
    
    Returns:
        List of documents with metadata
    """
    collection = get_or_create_collection()
    
    # Get all items
    try:
        all_items = collection.get()
    except Exception:
        return {"documents": [], "total_chunks": 0}
    
    # Deduplicate by doc_id
    doc_map = {}
    for metadata in all_items["metadatas"]:
        doc_id = metadata.get("doc_id")
        if doc_id and doc_id not in doc_map:
            doc_map[doc_id] = {
                "doc_id": doc_id,
                "filename": metadata.get("source", "unknown"),
                "chunks": 0
            }
        if doc_id:
            doc_map[doc_id]["chunks"] += 1
    
    documents = list(doc_map.values())
    
    return {
        "documents": documents,
        "total_documents": len(documents),
        "total_chunks": len(all_items["ids"]) if all_items["ids"] else 0
    }


def delete_document(doc_id: str) -> Dict[str, Any]:
    """
    Delete a document and all its chunks.
    
    Args:
        doc_id: Document ID to delete
    
    Returns:
        Deletion result
    """
    collection = get_or_create_collection()
    
    try:
        # Delete all chunks with this doc_id
        collection.delete(where={"doc_id": doc_id})
        
        return {
            "status": "success",
            "doc_id": doc_id,
            "message": f"Deleted document {doc_id} and all its chunks"
        }
    except Exception as e:
        return {
            "status": "error",
            "doc_id": doc_id,
            "message": str(e)
        }


def clear_all() -> Dict[str, Any]:
    """
    Clear all documents from the knowledge base.
    
    Returns:
        Clear result
    """
    try:
        CHROMA_CLIENT.delete_collection(name=COLLECTION_NAME)
        return {
            "status": "success",
            "message": "All documents cleared from knowledge base"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
