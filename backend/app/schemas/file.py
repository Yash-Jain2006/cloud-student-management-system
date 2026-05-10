from pydantic import BaseModel

class FileUploadRequest(BaseModel):
    filename: str
    file_type: str
