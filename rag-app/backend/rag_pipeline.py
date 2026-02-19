"""
RAGPipeline — orchestrates PDF ingestion, retrieval, and answer generation.
"""

from pathlib import Path
from typing import Dict, List

from pdf_loader import PDFLoader
from vector_store import VectorStore
from llm import LLMHandler


_PROMPT_TEMPLATE = (
    "Use ONLY the context below to answer the question. "
    "If the answer is not in the context, say 'I don't have enough information to answer that.'\n\n"
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
        context = "\n\n".join(doc.page_content for doc in docs)

        prompt = _PROMPT_TEMPLATE.format(context=context, question=question)
        answer = self.llm.generate(prompt)

        sources = []
        for doc in docs:
            src = doc.metadata.get("source", "unknown")
            page = doc.metadata.get("page", "?")
            sources.append({"source": Path(src).name, "page": page})

        return {"answer": answer, "sources": sources}

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @property
    def uploaded_files(self) -> List[str]:
        return list(self._uploaded_files)
