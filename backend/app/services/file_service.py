import boto3
import uuid
from urllib.parse import unquote, urlparse
from botocore.exceptions import ClientError
from sqlalchemy.orm import Session
from app import models, schemas
from app.core.config import settings
from fastapi import HTTPException

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

def create_presigned_upload(db: Session, request: schemas.FileUploadRequest, user_id: int):
    """Generates a presigned URL and prepares metadata in DB."""
    file_uuid = str(uuid.uuid4())
    object_name = f"assignments/{user_id}/{file_uuid}_{request.filename}"
    
    try:
        # Generate presigned POST
        presigned_post = s3_client.generate_presigned_post(
            Bucket=settings.S3_BUCKET_NAME,
            Key=object_name,
            Fields={"Content-Type": request.file_type},
            Conditions=[{"Content-Type": request.file_type}],
            ExpiresIn=3600
        )
        
        # Prepare metadata for DB
        db_file = models.File(
            filename=request.filename,
            s3_url=f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}",
            uploader_id=user_id
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return {
            "upload_data": presigned_post,
            "file_id": db_file.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 Error: {str(e)}")

def get_user_files(db: Session, user_id: int):
    """Fetch all files uploaded by a specific user."""
    files = db.query(models.File).filter(models.File.uploader_id == user_id).all()
    result = []
    for db_file in files:
        result.append(
            {
                "id": db_file.id,
                "filename": db_file.filename,
                "s3_url": db_file.s3_url,
            }
        )
    return result


def clear_user_files(db: Session, user_id: int):
    """Delete all files uploaded by a specific user from the database."""
    try:
        # In a real app, we should also delete from S3, but for now we just remove from DB to clear the list.
        db.query(models.File).filter(models.File.uploader_id == user_id).delete()
        db.commit()
        return {"ok": True, "message": "All files cleared"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")


def _extract_object_key_from_url(s3_url: str):
    parsed = urlparse(s3_url)
    return unquote(parsed.path.lstrip("/"))


def generate_presigned_download(file_id: int, user_id: int, db: Session):
    """Generate a short-lived secure URL for downloading a user's file."""
    db_file = (
        db.query(models.File)
        .filter(models.File.id == file_id, models.File.uploader_id == user_id)
        .first()
    )
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        object_key = _extract_object_key_from_url(db_file.s3_url)
        signed_url = s3_client.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": object_key},
            ExpiresIn=600,
        )
        return {"download_url": signed_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 Error: {str(e)}")


def get_storage_status():
    """Basic S3 access diagnostics for configured bucket."""
    if not settings.S3_BUCKET_NAME:
        return {
            "ok": False,
            "message": "S3_BUCKET_NAME is not configured",
        }

    try:
        s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
        return {
            "ok": True,
            "bucket": settings.S3_BUCKET_NAME,
            "region": settings.AWS_REGION,
            "message": "S3 bucket is reachable with current credentials",
        }
    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code", "Unknown")
        return {
            "ok": False,
            "bucket": settings.S3_BUCKET_NAME,
            "region": settings.AWS_REGION,
            "message": f"S3 access check failed: {code}",
        }
    except Exception as exc:
        return {
            "ok": False,
            "bucket": settings.S3_BUCKET_NAME,
            "region": settings.AWS_REGION,
            "message": f"S3 access check failed: {str(exc)}",
        }
