from datetime import datetime, timedelta, timezone
from typing import Optional
import hmac

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

# Security Settings are now loaded from settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

_BCRYPT_PREFIXES = ("$2a$", "$2b$", "$2y$")

def verify_password(plain_password, hashed_password):
    if not plain_password or not hashed_password:
        return False

    if not is_password_hash(hashed_password):
        # Backward compatibility for users created before passwords were hashed.
        return hmac.compare_digest(str(plain_password), str(hashed_password))

    try:
        return bcrypt.checkpw(
            str(plain_password).encode("utf-8"),
            str(hashed_password).encode("utf-8"),
        )
    except (TypeError, ValueError):
        return False

def get_password_hash(password):
    password_bytes = str(password).encode("utf-8")
    if len(password_bytes) > 72:
        raise ValueError("Password must be 72 bytes or fewer")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")

def is_password_hash(value):
    return isinstance(value, str) and value.startswith(_BCRYPT_PREFIXES)

def password_needs_rehash(value):
    return not is_password_hash(value)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
