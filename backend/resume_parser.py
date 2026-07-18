"""
Extracts plain text from an uploaded PDF resume so it can be fed into the
same analysis pipeline as pasted text.
"""

import io

from pypdf import PdfReader


def extract_text_from_pdf(file_storage):
    """file_storage: a werkzeug FileStorage from request.files."""
    raw_bytes = file_storage.read()
    reader = PdfReader(io.BytesIO(raw_bytes))

    pages_text = []
    for page in reader.pages:
        pages_text.append(page.extract_text() or "")

    text = "\n".join(pages_text).strip()

    if not text:
        raise ValueError(
            "Couldn't extract any text from this PDF. It may be a scanned "
            "image rather than a text-based PDF -- try pasting the text instead."
        )

    return text
