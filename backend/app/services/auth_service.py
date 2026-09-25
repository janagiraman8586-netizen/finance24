from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from app.models.user import User
from app.models.role import Role
from app.schemas.auth import RegisterRequest, LoginRequest
from app.auth.security import hash_password, verify_password, create_access_token

def register_user(db: Session, req: RegisterRequest):
    if req.password != req.password_confirm:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")
    
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
    
    user_role = db.query(Role).filter(Role.name == "User").first()
    if not user_role:
        user_role = Role(name="User")
        db.add(user_role)
        db.commit()
        db.refresh(user_role)

    user = User(
        email=req.email,
        username=req.username,
        hashed_password=hash_password(req.password),
        first_name=req.first_name,
        last_name=req.last_name,
        is_active=True
    )
    user.roles.append(user_role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, req: LoginRequest):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
    
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    roles = [r.name for r in user.roles]
    token = create_access_token({"sub": str(user.id), "email": user.email, "roles": roles})
    
    user_data = {
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

    return {"access_token": token, "token_type": "bearer", "user": user_data}

def update_user_profile(db: Session, user_id: int, first_name: str = None, last_name: str = None, username: str = None, email: str = None):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if username and username != user.username:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already in use")
        user.username = username

    if email and email != user.email:
        existing_email = db.query(User).filter(User.email == email).first()
        if existing_email:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered by another account")
        user.email = email
    
    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name

    db.commit()
    db.refresh(user)
    return user

def change_user_password(db: Session, user_id: int, current_pwd: str, new_pwd: str, confirm_pwd: str):
    if new_pwd != confirm_pwd:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New passwords do not match")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not verify_password(current_pwd, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    
    user.hashed_password = hash_password(new_pwd)
    db.commit()
    return True
