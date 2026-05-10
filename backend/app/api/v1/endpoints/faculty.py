from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, RoleChecker
from app import models, schemas
from app.services import faculty_service

router = APIRouter()

@router.get("/me/courses", response_model=List[schemas.CourseResponse])
def read_my_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker([models.UserRole.faculty, models.UserRole.admin]))
):
    """Fetch courses where the current user is the instructor."""
    return faculty_service.get_instructor_courses(db, current_user.id)

@router.get("/me/stats")
def read_faculty_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker([models.UserRole.faculty, models.UserRole.admin]))
):
    """Fetch analytics summary for the instructor's courses."""
    return faculty_service.get_faculty_stats(db, current_user.id)

@router.get("/course/{course_id}/students", response_model=List[schemas.UserResponse])
def read_course_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker([models.UserRole.faculty, models.UserRole.admin]))
):
    """Fetch students enrolled in a specific course managed by this instructor."""
    # Security check: Ensure instructor owns this course
    course = db.query(models.Course).filter(models.Course.id == course_id, models.Course.instructor_id == current_user.id).first()
    if not course and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized to view students of this course")
    
    return faculty_service.get_course_students(db, course_id)
