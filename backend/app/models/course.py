from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String)
    instructor_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    instructor = relationship("User", back_populates="courses_taught")
    enrollments = relationship("Enrollment", back_populates="course")
    files = relationship("File", back_populates="course")
