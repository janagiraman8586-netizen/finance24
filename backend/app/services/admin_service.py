from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, Any
from datetime import datetime
from fastapi import HTTPException, status
from app.models.user import User
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.notification import Notification
from app.models.audit_log import AuditLog

def log_admin_action(
    db: Session,
    admin_id: int,
    action: str,
    resource: Optional[str] = None,
    resource_id: Optional[int] = None,
    description: Optional[str] = None,
    details: Optional[Any] = None
):
    log = AuditLog(
        admin_id=admin_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        description=description,
        details=details,
        created_at=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    return log

def get_admin_users(db: Session, skip: int = 0, limit: int = 20, search: Optional[str] = None, status_filter: Optional[bool] = None):
    query = db.query(User)
    if status_filter is not None:
        query = query.filter(User.is_active == status_filter)
    if search:
        query = query.filter((User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))

    total = query.count()
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()

    user_items = []
    for u in users:
        tx_count = db.query(Transaction).filter(Transaction.user_id == u.id).count()
        roles = [r.name for r in u.roles]
        user_items.append({
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "is_active": u.is_active,
            "roles": roles,
            "created_at": u.created_at,
            "last_login": u.last_login,
            "total_transactions": tx_count
        })

    return {"total_users": total, "users": user_items}

def toggle_user_status(db: Session, admin_id: int, user_id: int, is_active: bool, reason: Optional[str] = None):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = is_active
    db.commit()

    log_admin_action(
        db=db,
        admin_id=admin_id,
        action="status_change",
        resource="User",
        resource_id=user_id,
        description=f"User account {'activated' if is_active else 'deactivated'}",
        details={"reason": reason}
    )

    return user

def delete_user_by_admin(db: Session, admin_id: int, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()

    log_admin_action(
        db=db,
        admin_id=admin_id,
        action="delete",
        resource="User",
        resource_id=user_id,
        description=f"Deleted user ID {user_id}"
    )

    return True

def get_admin_statistics(db: Session):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_tx = db.query(Transaction).count()

    tot_inc = db.query(func.sum(Transaction.amount)).filter(Transaction.type == "income").scalar() or 0.0
    tot_exp = db.query(func.sum(Transaction.amount)).filter(Transaction.type == "expense").scalar() or 0.0

    return {
        "user_statistics": {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users
        },
        "financial_statistics": {
            "total_platform_income": float(tot_inc),
            "total_platform_expenses": float(tot_exp),
            "total_volume": float(tot_inc) + float(tot_exp)
        },
        "platform_statistics": {
            "total_transactions": total_tx,
            "system_health": "Optimal"
        }
    }

def get_audit_logs(db: Session, skip: int = 0, limit: int = 100):
    total = db.query(AuditLog).count()
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()
    return {"total_logs": total, "logs": logs}
