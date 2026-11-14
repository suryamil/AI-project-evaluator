"""
Security module for cryptographic password hashing and JWT token management.
Uses:
- bcrypt for salted password hashing (NIST & OWASP compliant)
- PyJWT for RFC 7519 JSON Web Tokens (HS256)
- PBKDF2 fallback for backward compatibility
"""

import bcrypt
import hashlib
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from app.core.config import settings

# -------------------------------------------------------------
# PASSWORD HASHING (bcrypt)
# -------------------------------------------------------------
def hash_password(password: str) -> str:
    """
    Hashes a plain-text password using bcrypt with automatic random salt.
    Never stores plain-text passwords.
    """
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str, salt: Optional[str] = None) -> bool:
    """
    Verifies that a plain password matches the hashed password.
    Supports bcrypt hashes and PBKDF2 legacy hashes.
    """
    plain_bytes = plain_password.encode('utf-8')
    
    # 1. Check if bcrypt hash (starts with $2b$ or $2a$)
    if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
        try:
            return bcrypt.checkpw(plain_bytes, hashed_password.encode('utf-8'))
        except Exception:
            return False

    # 2. Backward compatibility with PBKDF2 hash + salt
    if salt:
        try:
            derived_key = hashlib.pbkdf2_hmac(
                'sha256',
                plain_bytes,
                bytes.fromhex(salt),
                iterations=100000
            )
            import secrets
            return secrets.compare_digest(derived_key.hex(), hashed_password)
        except Exception:
            return False

    return False

# -------------------------------------------------------------
# JWT ACCESS TOKEN MANAGEMENT
# -------------------------------------------------------------
def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Encodes a signed JWT access token containing user claims and expiration.
    Payload:
    - sub: unique user id
    - email: user email address
    - role: student / faculty / admin
    - exp: expiration timestamp (UTC)
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a JWT access token.
    Raises jwt.PyJWTError if expired, signature invalid, or malformed.
    """
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM]
    )
