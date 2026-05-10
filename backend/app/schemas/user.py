from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models import UserRole

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.student

class UserCreate(UserBase):
    password: str = Field(min_length=1, max_length=72)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=64)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=1, max_length=72)

class UserStats(BaseModel):
    total_courses: int
    avg_progress: float
    active_courses: int

class UserResponse(UserBase):
    id: int
    stats: Optional[UserStats] = None

    class Config:
        from_attributes = True
