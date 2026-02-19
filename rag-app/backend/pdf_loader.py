"""
PDFLoader — extract text from uploaded PDFs and split into chunks.
"""

from pathlib import Path
from typing import List

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain.schema import Document

from config import settings


class PDFLoader:
    """Load a PDF file, extract pages, and return chunked Documents."""

    def __init__(self) -> None:
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def load_and_split(self, pdf_path: str | Path) -> List[Document]:
        """Return a list of Document chunks from the given PDF file."""
        loader = PyPDFLoader(str(pdf_path))
        pages = loader.load()
        chunks = self.splitter.split_documents(pages)
        return chunks
