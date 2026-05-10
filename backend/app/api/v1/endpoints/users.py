from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import UserResponse, UserUpdate
from app import models
from app.api.deps import get_current_user, get_db
from app.core.security import get_password_hash
from app.services import user_service

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Attach stats for student dashboard
    stats = user_service.get_student_stats(db, current_user.id)
    current_user.stats = stats
    return current_user


@router.put("/me", response_model=UserResponse)
def update_users_me(
    payload: UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.username and payload.username != current_user.username:
        existing_username = db.query(models.User).filter(models.User.username == payload.username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = payload.username

    if payload.email and payload.email != current_user.email:
        existing_email = db.query(models.User).filter(models.User.email == payload.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = payload.email

    if payload.password:
        try:
            current_user.hashed_password = get_password_hash(payload.password)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    stats = user_service.get_student_stats(db, current_user.id)
    current_user.stats = stats
    return current_user
