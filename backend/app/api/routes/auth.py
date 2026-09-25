from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    RegisterRequest, LoginRequest, LoginResponse, UserResponse,
    ForgotPasswordRequest, ResetPasswordRequest, ProfileUpdateRequest, ChangePasswordRequest
)
from app.services.auth_service import (
    register_user, authenticate_user, update_user_profile, change_user_password
)
from app.services.audit_service import log_audit
from app.auth.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, req)
    log_audit(db, user.id, "user_register", "users", user.id, f"User registered: {user.email}")
    return {"message": "User registered successfully", "user_id": user.id}

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    resp = authenticate_user(db, req)
    log_audit(db, resp["user"]["id"], "login", "users", resp["user"]["id"], f"User logged in: {req.email}")
    return resp

@router.post("/logout")
def logout(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit(db, current_user.id, "logout", "users", current_user.id, f"User logged out: {current_user.email}")
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    return {"message": "If the email is registered, a password reset link will be sent."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    return {"message": "Password reset successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user = Depends(get_current_user)):
    roles = [r.name for r in current_user.roles]
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "is_active": current_user.is_active,
        "roles": roles,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login
    }

@router.put("/profile", response_model=UserResponse)
def update_profile(
    req: ProfileUpdateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = update_user_profile(db, current_user.id, req.first_name, req.last_name, req.username)
    log_audit(db, current_user.id, "profile_update", "users", user.id, "Profile updated")
    roles = [r.name for r in user.roles]
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_active": user.is_active,
        "roles": roles,
        "created_at": user.created_at,
        "last_login": user.last_login
    }

@router.put("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    change_user_password(db, current_user.id, req.current_password, req.new_password, req.confirm_password)
    log_audit(db, current_user.id, "password_change", "users", current_user.id, "Password changed")
    return {"message": "Password changed successfully"}
