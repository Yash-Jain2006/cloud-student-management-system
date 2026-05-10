from pydantic import BaseModel
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
