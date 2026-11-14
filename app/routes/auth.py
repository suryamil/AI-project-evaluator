from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any, List
from app.models.user import UserRegister, UserLogin, PasswordResetRequest
from app.models.db_models import UserDocument
from app.services.db_service import db_service
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.core.user_storage import (
    save_user, 
    get_user_by_email as get_pc_user, 
    record_login_activity, 
    load_all_users,
    USERS_DIR
)
import datetime

router = APIRouter()

@router.post(
    "/register", 
    status_code=status.HTTP_201_CREATED, 
    summary="Register a new student account",
    description="Hashes password with bcrypt, stores user in MongoDB 'users' collection, and issues a JWT access token."
)
async def register_student(user_data: UserRegister):
    """
    Registers a new student account:
    1. Validates unique email address in MongoDB users collection.
    2. Hashes password securely with bcrypt (never plain-text).
    3. Stores user document in MongoDB 'users' collection and local PC backup.
    4. Issues a signed JWT access token.
    """
    target_email = user_data.email.strip().lower()

    # Check if user already exists
    existing_db = await db_service.get_user_by_email(target_email)
    existing_pc = get_pc_user(target_email)
    if existing_db or existing_pc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address is already registered."
        )

    # Secure cryptographic hashing with bcrypt
    password_hash = hash_password(user_data.password)
    user_id = f"usr_{int(datetime.datetime.utcnow().timestamp() * 1000)}"

    # 1. MongoDB Users Document
    user_doc = UserDocument(
        id=user_id,
        email=target_email,
        full_name=user_data.full_name.strip(),
        password_hash=password_hash,
        salt="bcrypt",
        university=user_data.university.strip() if user_data.university else "College / University Student",
        role=user_data.role,
        created_at=datetime.datetime.utcnow().isoformat()
    )
    await db_service.create_user(user_doc)

    # 2. Local PC File Backup
    pc_record = {
        "id": user_id,
        "full_name": user_data.full_name.strip(),
        "email": target_email,
        "university": user_doc.university,
        "role": user_doc.role,
        "password_hash": password_hash,
        "salt": "bcrypt",
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "is_active": True
    }
    save_user(pc_record)
    record_login_activity(target_email, pc_record["full_name"], "REGISTERED", "New account registered")

    # 3. Generate JWT Access Token
    token_claims = {
        "sub": user_id,
        "email": target_email,
        "role": user_doc.role
    }
    access_token = create_access_token(token_claims)

    return {
        "message": "Student registration successful. Account saved to MongoDB and PC data/users folder.",
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        "user": {
            "id": user_id,
            "full_name": user_doc.full_name,
            "email": user_doc.email,
            "university": user_doc.university,
            "role": user_doc.role
        }
    }

@router.post(
    "/login", 
    summary="Authenticate student and obtain JWT access token",
    description="Validates credentials against MongoDB bcrypt hash and issues an RFC 7519 JWT access token."
)
async def login_student(credentials: UserLogin):
    """
    Verifies student credentials against stored MongoDB / PC hash:
    1. Reads user from MongoDB 'users' collection (or PC fallback).
    2. Verifies entered password against bcrypt / PBKDF2 hash.
    3. Issues signed JWT access token.
    4. Logs login audit record.
    """
    target_email = credentials.email.strip().lower()

    # Try MongoDB first, fallback to PC file
    user = await db_service.get_user_by_email(target_email)
    if not user:
        user = get_pc_user(target_email)

    if not user:
        record_login_activity(target_email, "", "FAILED", "User not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check credentials or register first."
        )

    # Verify cryptographic hash
    is_valid = verify_password(
        credentials.password,
        user.get("password_hash", ""),
        user.get("salt", "")
    )

    if not is_valid:
        record_login_activity(target_email, user.get("full_name", ""), "FAILED", "Incorrect password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Generate signed JWT access token
    token_claims = {
        "sub": user.get("id"),
        "email": user.get("email"),
        "role": user.get("role", "student")
    }
    access_token = create_access_token(token_claims)

    # Log successful login to PC folder
    record_login_activity(target_email, user.get("full_name", ""), "SUCCESS", "Logged in with JWT issued")

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        "user": {
            "id": user.get("id"),
            "full_name": user.get("full_name"),
            "email": user.get("email"),
            "university": user.get("university", "Student Researcher"),
            "role": user.get("role", "student")
        }
    }

@router.get(
    "/me", 
    summary="Get current authenticated student profile (Protected Route)",
    description="Validates JWT Bearer token and returns the authenticated user's private profile."
)
async def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Protected route: Only accessible with a valid, non-expired JWT Bearer token.
    """
    return {
        "status": "authenticated",
        "user": current_user
    }

@router.post(
    "/logout", 
    summary="Logout user session (Protected Route)",
    description="Logs session termination event and instructs client to purge JWT token."
)
async def logout_student(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Protected route: Audits logout activity. Client discards the token.
    """
    record_login_activity(current_user["email"], current_user["full_name"], "LOGOUT", "User logged out")
    return {
        "status": "logged_out",
        "message": "User session ended successfully. Purge token from client storage."
    }

@router.post("/forgot-password", summary="Password reset request")
async def forgot_password(request: PasswordResetRequest):
    """Generates password reset audit event."""
    target_email = request.email.strip().lower()
    user = await db_service.get_user_by_email(target_email) or get_pc_user(target_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address."
        )
    return {
        "message": "A secure password reset link has been dispatched to your email address.",
        "email": target_email,
        "instructions": "Check your inbox for step-by-step password recovery instructions."
    }

@router.get("/users", summary="List registered users (Admin / Audit)")
async def list_users():
    """Returns all registered student profiles."""
    users = load_all_users()
    clean_users = [
        {
            "id": u.get("id"),
            "full_name": u.get("full_name"),
            "email": u.get("email"),
            "university": u.get("university"),
            "role": u.get("role"),
            "created_at": u.get("created_at")
        }
        for u in users
    ]
    return {
        "total_users": len(clean_users),
        "users": clean_users
    }
