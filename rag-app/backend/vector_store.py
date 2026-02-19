"""
VectorStore — manage FAISS index lifecycle: create, add, save, load, query.
"""

from pathlib import Path
from typing import List, Optional

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document

from config import settings


class VectorStore:
    """Thin wrapper around a FAISS-backed LangChain vector store."""

    def __init__(self) -> None:
        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        self._store: Optional[FAISS] = None
        self._try_load()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def add_documents(self, documents: List[Document]) -> None:
        """Embed *documents* and merge them into the existing index."""
        if not documents:
            return

        new_store = FAISS.from_documents(documents, self.embeddings)

        if self._store is not None:
            self._store.merge_from(new_store)
        else:
            self._store = new_store

        self._save()

    def similarity_search(self, query: str, k: int | None = None) -> List[Document]:
        """Return the top-k most relevant chunks for *query*."""
        if self._store is None:
            return []
        return self._store.similarity_search(query, k=k or settings.TOP_K)

    @property
    def is_ready(self) -> bool:
        return self._store is not None

    # ------------------------------------------------------------------
    # Persistence helpers
    # ------------------------------------------------------------------

    def _save(self) -> None:
        index_path = settings.faiss_abs_path
        index_path.parent.mkdir(parents=True, exist_ok=True)
        self._store.save_local(str(index_path))

    def _try_load(self) -> None:
        index_path = settings.faiss_abs_path
        if (index_path / "index.faiss").exists():
            self._store = FAISS.load_local(
                str(index_path),
                self.embeddings,
                allow_dangerous_deserialization=True,
            )
