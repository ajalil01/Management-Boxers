import os
import uuid
from fastapi import UploadFile
from pathlib import Path

UPLOAD_DIR = Path(__file__).parent.parent.parent.parent.parent / "uploads" / "boxers"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

async def save_picture(file: UploadFile) -> str:
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename

    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    return f"uploads/boxers/{filename}"

def delete_picture(picture_path: str):
    full_path = Path(__file__).parent.parent.parent.parent.parent / picture_path
    if full_path.exists():
        os.remove(full_path)

