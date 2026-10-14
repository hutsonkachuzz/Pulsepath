import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from backend.app.core.config import settings
from backend.app.core.deps import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )

    unique_filename = f"{uuid.uuid4()}{ext}"
    destination_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(destination_path, "wb") as f:
        f.write(content)

    return {
        "url": f"/uploads/{unique_filename}",
        "filename": unique_filename,
        "size": len(content)
    }
