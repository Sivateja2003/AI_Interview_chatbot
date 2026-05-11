"""Document parser — extracts text from PDF, DOCX, and TXT files."""

import os
from pathlib import Path
import PyPDF2
import docx


def parse_document(file_path: str) -> str:
    """
    Parse a document and extract its text content.
    Supports: PDF, DOCX, TXT
    """
    ext = Path(file_path).suffix.lower()

    if ext == ".pdf":
        return _parse_pdf(file_path)
    elif ext == ".docx":
        return _parse_docx(file_path)
    elif ext == ".txt":
        return _parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")


def _parse_pdf(file_path: str) -> str:
    """Extract text from a PDF file using PyPDF2."""
    text_parts = []
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text.strip())
    return "\n\n".join(text_parts)


def _parse_docx(file_path: str) -> str:
    """Extract text from a DOCX file using python-docx."""
    doc = docx.Document(file_path)
    text_parts = []
    for paragraph in doc.paragraphs:
        if paragraph.text.strip():
            text_parts.append(paragraph.text.strip())
    return "\n\n".join(text_parts)


def _parse_txt(file_path: str) -> str:
    """Read text from a plain text file, handling multiple encodings."""
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
    
    for enc in encodings:
        try:
            with open(file_path, "r", encoding=enc) as f:
                return f.read().strip()
        except UnicodeDecodeError:
            continue
            
    raise ValueError("Failed to parse TXT document: unsupported encoding.")
