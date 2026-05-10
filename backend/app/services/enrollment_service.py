from sqlalchemy.orm import Session
from app import models
from fastapi import HTTPException

def enroll_student(db: Session, course_id: int, student_id: int):
    """Enrolls a student in a course if not already enrolled."""
    # 1. Check if course exists
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # 2. Check if already enrolled
    existing = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == student_id,
        models.Enrollment.course_id == course_id
    ).first()
    
    if existing:
        return {"message": "Already enrolled", "enrollment_id": existing.id}

    # 3. Create enrollment
    enrollment = models.Enrollment(student_id=student_id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return {"message": "Successfully enrolled", "enrollment_id": enrollment.id}

def get_student_enrollments(db: Session, student_id: int):
    """Fetch all courses a student is enrolled in."""
    return db.query(models.Course).join(models.Enrollment).filter(models.Enrollment.student_id == student_id).all()

def update_progress(db: Session, enrollment_id: int, progress: int):
    """Update student progress in a course."""
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    enrollment.progress = min(100, max(0, progress))
    db.commit()
    return enrollment
