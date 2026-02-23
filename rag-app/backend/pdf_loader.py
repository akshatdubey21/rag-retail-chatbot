"""
PDFLoader — extract text from uploaded PDFs and split into chunks.
"""

import logging
from pathlib import Path
from typing import List

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain.schema import Document

from config import settings

logger = logging.getLogger(__name__)


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
        logger.info("Loaded %d pages from %s", len(pages), pdf_path)

        # Log raw text length per page for debugging
        for i, page in enumerate(pages):
            logger.debug(
                "  Page %d: %d chars", i + 1, len(page.page_content)
            )

        chunks = self.splitter.split_documents(pages)
        logger.info(
            "Split into %d chunks (chunk_size=%d, overlap=%d)",
            len(chunks), settings.CHUNK_SIZE, settings.CHUNK_OVERLAP,
        )
        return chunks
