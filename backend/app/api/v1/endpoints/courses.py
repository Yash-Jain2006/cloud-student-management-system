from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app import models
from app import schemas
from app.api.deps import get_current_user, get_db, RoleChecker

from app.services import course_service, enrollment_service

router = APIRouter()

@router.post("/", response_model=schemas.CourseResponse)
def create_course(
    course: schemas.CourseCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(RoleChecker([models.UserRole.admin]))
):
    return course_service.create_course(db, course, current_user.id)

@router.get("/", response_model=List[schemas.CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    return course_service.get_all_courses(db)

@router.get("/enrolled", response_model=List[schemas.EnrolledCourseResponse])
def get_enrolled_courses(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """Return all courses the current student is enrolled in, including their progress."""
    return enrollment_service.get_student_enrollments(db, current_user.id)

@router.post("/{course_id}/enroll")
def enroll_in_course(
    course_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return enrollment_service.enroll_student(db, course_id, current_user.id)

@router.put("/{course_id}/progress")
def update_course_progress(
    course_id: int,
    payload: schemas.ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update the current student's progress in a course they are enrolled in."""
    enrollment = enrollment_service.get_enrollment(db, current_user.id, course_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="You are not enrolled in this course")
    updated = enrollment_service.update_progress(db, enrollment.id, payload.progress)
    return {"message": "Progress updated", "progress": updated.progress}

