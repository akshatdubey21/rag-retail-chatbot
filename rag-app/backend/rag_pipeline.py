"""RAGPipeline — orchestrates PDF ingestion, retrieval, and answer generation."""

import logging
from pathlib import Path
from typing import Dict, List

from pdf_loader import PDFLoader
from vector_store import VectorStore
from llm import LLMHandler

logger = logging.getLogger(__name__)


_PROMPT_TEMPLATE = (
    "Answer the question based on the context below. "
    "Provide a detailed and helpful answer. "
    "If the context does not contain relevant information, say so.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}\n\n"
    "Answer:"
)


class RAGPipeline:
    """End-to-end RAG: ingest → retrieve → generate."""

    def __init__(self) -> None:
        self.pdf_loader = PDFLoader()
        self.vector_store = VectorStore()
        self.llm = LLMHandler()
        self._uploaded_files: List[str] = []

    # ------------------------------------------------------------------
    # Ingest
    # ------------------------------------------------------------------

    def ingest_pdf(self, pdf_path: str | Path) -> Dict:
        """Extract, chunk, embed and store a PDF. Returns a status dict."""
        path = Path(pdf_path)
        chunks = self.pdf_loader.load_and_split(path)
        logger.info("Ingesting %d chunks from %s", len(chunks), path.name)
        self.vector_store.add_documents(chunks)
        self._uploaded_files.append(path.name)
        return {
            "filename": path.name,
            "chunks": len(chunks),
            "status": "success",
        }

    # ------------------------------------------------------------------
    # Query
    # ------------------------------------------------------------------

    def query(self, question: str) -> Dict:
        """Retrieve relevant chunks and generate an answer."""
        if not self.vector_store.is_ready:
            return {
                "answer": "Please upload a PDF document first.",
                "sources": [],
            }

        docs = self.vector_store.similarity_search(question)
        logger.info("Retrieved %d chunks for question: %s", len(docs), question[:80])

        # Build context that fits within the model's token budget.
        # Reserve tokens for the prompt template + question + generation.
        template_overhead = self.llm.count_tokens(
            _PROMPT_TEMPLATE.format(context="", question=question)
        )
        budget = self.llm.max_input_tokens - template_overhead - 10  # safety margin
        logger.info("Token budget for context: %d tokens", budget)

        context_parts: list[str] = []
        used_tokens = 0
        for doc in docs:
            chunk_tokens = self.llm.count_tokens(doc.page_content)
            if used_tokens + chunk_tokens > budget:
                logger.debug("Skipping chunk (%d tokens) — would exceed budget", chunk_tokens)
                break
            context_parts.append(doc.page_content)
            used_tokens += chunk_tokens

        logger.info("Using %d chunks (%d tokens) as context", len(context_parts), used_tokens)
        context = "\n\n".join(context_parts)

        prompt = _PROMPT_TEMPLATE.format(context=context, question=question)
        answer = self.llm.generate(prompt)

        sources = []
        for doc in docs:
            src = doc.metadata.get("source", "unknown")
            page = doc.metadata.get("page", "?")
            sources.append({"source": Path(src).name, "page": page})

        return {"answer": answer, "sources": sources}

    # ------------------------------------------------------------------
    # Delete
    # ------------------------------------------------------------------

    def delete_pdf(self, filename: str) -> Dict:
        """Delete a PDF and rebuild the index from remaining files."""
        from config import settings
        import os

        # Find and remove the file from disk
        upload_dir = settings.upload_abs_path
        found = False
        for f in upload_dir.iterdir():
            if f.name == filename:
                f.unlink()
                found = True
                break

        if not found:
            raise FileNotFoundError(f"File '{filename}' not found.")

        # Remove from uploaded list
        self._uploaded_files = [f for f in self._uploaded_files if f != filename]

        # Rebuild the entire FAISS index from remaining PDFs
        self.vector_store.clear()
        remaining_pdfs = list(upload_dir.glob("*.pdf"))
        for pdf in remaining_pdfs:
            chunks = self.pdf_loader.load_and_split(pdf)
            self.vector_store.add_documents(chunks)

        return {"filename": filename, "status": "deleted"}

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @property
    def uploaded_files(self) -> List[str]:
        return list(self._uploaded_files)
