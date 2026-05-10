from app.db.database import SessionLocal
from app import models
from app.core.security import is_password_hash

def check_users():
    db = SessionLocal()
    users = db.query(models.User).all()
    print(f"Total users: {len(users)}")
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Role: {user.role}")
        print(f"  Password hashed: {is_password_hash(user.hashed_password)}")
    db.close()

if __name__ == "__main__":
    check_users()
