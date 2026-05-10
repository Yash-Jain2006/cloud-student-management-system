from sqlalchemy.orm import Session
from app import models

def get_instructor_courses(db: Session, instructor_id: int):
    """Fetch all courses assigned to this instructor."""
    return db.query(models.Course).filter(models.Course.instructor_id == instructor_id).all()

def get_course_students(db: Session, course_id: int):
    """Fetch all students enrolled in a specific course."""
    return db.query(models.User).join(models.Enrollment).filter(models.Enrollment.course_id == course_id).all()

def get_faculty_stats(db: Session, instructor_id: int):
    """Aggregate stats for the faculty dashboard."""
    courses = get_instructor_courses(db, instructor_id)
    course_ids = [c.id for c in courses]
    
    total_students = db.query(models.Enrollment).filter(models.Enrollment.course_id.in_(course_ids)).count() if course_ids else 0
    
    return {
        "total_courses": len(courses),
        "total_students": total_students,
        "active_discussions": 0 # Placeholder for future feature
    }
