from sqlalchemy.orm import Session
from app import models, schemas

def create_course(db: Session, course: schemas.CourseCreate, instructor_id: int):
    """Business logic for creating a new course."""
    db_course = models.Course(
        title=course.title,
        description=course.description,
        instructor_id=instructor_id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def get_all_courses(db: Session):
    """List all courses with instructor details."""
    return db.query(models.Course).all()
