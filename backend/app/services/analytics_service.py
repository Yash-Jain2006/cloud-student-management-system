from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from datetime import datetime, timedelta

def get_admin_analytics(db: Session):
    """Aggregate high-level analytics for the admin dashboard."""
    
    # 1. Enrollment Trends (last 6 months)
    # Note: Simplified for now as we don't have created_at in all models yet
    # In a real app, we'd group by month
    
    # 2. Course Popularity (Top 5)
    popularity = db.query(
        models.Course.title,
        func.count(models.Enrollment.id).label('student_count')
    ).join(models.Enrollment).group_by(models.Course.id).order_by(func.count(models.Enrollment.id).desc()).limit(5).all()
    
    # 3. User Breakdown
    role_counts = db.query(
        models.User.role,
        func.count(models.User.id)
    ).group_by(models.User.role).all()
    
    return {
        "popularity": [{"name": p[0], "value": p[1]} for p in popularity],
        "user_breakdown": [{"role": r[0], "count": r[1]} for r in role_counts],
        "total_enrollments": db.query(models.Enrollment).count()
    }
