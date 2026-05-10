from app.db.database import Base
from .user import User, UserRole
from .course import Course
from .enrollment import Enrollment
from .file import File

# This ensures all models are known to SQLAlchemy when Base.metadata is used
__all__ = ["Base", "User", "UserRole", "Course", "Enrollment", "File"]
