from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app import models
from app import schemas
from .auth import get_current_user

from app.services import file_service

router = APIRouter()

@router.post("/generate-presigned-url")
async def generate_presigned_url(
    request: schemas.FileUploadRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """Generates a secure URL for the frontend to upload a file directly to S3."""
    return file_service.create_presigned_upload(db, request, current_user.id)

@router.get("/")
def list_my_files(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Lists all files uploaded by the current user."""
    return file_service.get_user_files(db, current_user.id)


@router.get("/storage-status")
def get_storage_status(
    current_user: models.User = Depends(get_current_user)
):
    """Returns current S3 access health for diagnostics."""
    return file_service.get_storage_status()


@router.get("/download-url/{file_id}")
def get_download_url_compat(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Compatibility route for older clients."""
    return file_service.generate_presigned_download(file_id, current_user.id, db)


@router.get("/{file_id}/download-url")
def get_download_url(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Generates a secure URL for downloading/viewing a private S3 object."""
    return file_service.generate_presigned_download(file_id, current_user.id, db)
