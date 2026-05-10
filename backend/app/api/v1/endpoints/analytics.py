from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, RoleChecker
from app import models
from app.services import analytics_service

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker([models.UserRole.admin]))
):
    """Fetch high-level analytics summary for admins."""
    return analytics_service.get_admin_analytics(db)
