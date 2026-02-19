"""
FastAPI application — exposes /upload, /chat, and /health endpoints.
"""

import shutil
import uuid
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import settings
from rag_pipeline import RAGPipeline

# ------------------------------------------------------------------
# App bootstrap
# ------------------------------------------------------------------

app = FastAPI(
    title="RAG Chat Bot",
    description="Chat with your retail PDF documents using RAG",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
settings.upload_abs_path.mkdir(parents=True, exist_ok=True)

# Singleton pipeline — heavy models are loaded once at startup
pipeline = RAGPipeline()


# ------------------------------------------------------------------
# Request / Response schemas
# ------------------------------------------------------------------

class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: list


class UploadResponse(BaseModel):
    filename: str
    chunks: int
    status: str


class HealthResponse(BaseModel):
    status: str
    uploaded_files: list
    index_ready: bool


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Return service health and uploaded-file list."""
    return HealthResponse(
        status="ok",
        uploaded_files=pipeline.uploaded_files,
        index_ready=pipeline.vector_store.is_ready,
    )


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """Accept a PDF, extract text, chunk, embed, and store in FAISS."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Save uploaded file to disk
    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    dest = settings.upload_abs_path / unique_name
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = pipeline.ingest_pdf(dest)
        return UploadResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Answer a user question using the RAG pipeline."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        result = pipeline.query(request.question)
        return ChatResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ------------------------------------------------------------------
# Dev runner
# ------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
