from pydantic import BaseModel, Field
from typing import Optional

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None

class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    instructor_id: int

    class Config:
        from_attributes = True

class EnrolledCourseResponse(BaseModel):
    """Course data enriched with the student's personal progress."""
    id: int
    title: str
    description: Optional[str] = None
    instructor_id: int
    progress: float = 0.0

    class Config:
        from_attributes = True

class ProgressUpdate(BaseModel):
    progress: float = Field(..., ge=0, le=100, description="Progress percentage (0–100)")
