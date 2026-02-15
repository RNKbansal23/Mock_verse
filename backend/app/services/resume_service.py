# In file: backend/app/services/resume_service.py

import io
import fitz  # PyMuPDF
import docx
from fastapi import UploadFile

def parse_resume(file: UploadFile) -> str:
    """
    Parses an uploaded resume file (PDF, DOCX, TXT) and returns its text content.
    """
    try:
        # Read the file content into memory
        file_content = file.file.read()
        file_stream = io.BytesIO(file_content)

        if file.content_type == "application/pdf":
            # Process PDF
            doc = fitz.open(stream=file_stream, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return text

        elif file.content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
            # Process DOCX
            doc = docx.Document(file_stream)
            text = "\n".join([para.text for para in doc.paragraphs])
            return text

        elif file.content_type == "text/plain":
            # Process TXT
            return file_content.decode("utf-8")

        else:
            # Unsupported file type
            return "Could not parse resume: unsupported file type."

    except Exception as e:
        print(f"Error parsing resume: {e}")
        return "Error parsing resume."
    finally:
        # Important to close the file stream
        file.file.close()