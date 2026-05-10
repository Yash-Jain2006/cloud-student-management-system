from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, courses, files, analytics, faculty

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(faculty.router, prefix="/faculty", tags=["faculty"])
