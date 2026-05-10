from sqlalchemy.orm import Session
from app import models

def get_student_stats(db: Session, user_id: int):
    """Calculate statistics for the student dashboard."""
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == user_id).all()
    
    total_courses = len(enrollments)
    avg_progress = sum([e.progress for e in enrollments]) / total_courses if total_courses > 0 else 0
    
    return {
        "total_courses": total_courses,
        "avg_progress": round(avg_progress, 2),
        "active_courses": len([e for e in enrollments if e.progress < 100])
    }
