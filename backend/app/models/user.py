from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base

class UserRole(str, enum.Enum):
    admin = "admin"
    student = "student"
    faculty = "faculty"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student)

    # Relationships
    courses_taught = relationship("Course", back_populates="instructor")
    enrollments = relationship("Enrollment", back_populates="student")
    uploaded_files = relationship("File", back_populates="uploader")
