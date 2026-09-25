from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.auth.security import get_current_admin
from app.schemas.admin import UserStatusUpdate
from app.services import admin_service, transaction_service
from app.models.category import Category
from app.models.notification import Notification

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/statistics")
def get_statistics(
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return admin_service.get_admin_statistics(db)

@router.get("/users")
def get_users(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    status: Optional[bool] = None,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return admin_service.get_admin_users(db, skip, limit, search, status)

@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    data: UserStatusUpdate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return admin_service.toggle_user_status(db, current_admin.id, user_id, data.is_active, data.reason)

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    admin_service.delete_user_by_admin(db, current_admin.id, user_id)
    return {"message": "User deleted successfully"}

@router.get("/transactions")
def get_all_transactions(
    skip: int = 0,
    limit: int = 50,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    from app.models.transaction import Transaction
    total = db.query(Transaction).count()
    items = db.query(Transaction).order_by(Transaction.date.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

@router.get("/transactions/suspicious")
def get_suspicious_transactions(
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    from app.models.transaction import Transaction
    # Filter transactions > 25,000 as large/suspicious flags
    items = db.query(Transaction).filter(Transaction.amount > 25000).all()
    return {"suspicious_count": len(items), "items": items}

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/categories", status_code=status.HTTP_201_CREATED)
def create_category(
    name: str,
    type: str,
    icon: Optional[str] = None,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = Category(name=name, type=type, icon=icon)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/categories/{cat_id}")
def delete_category(
    cat_id: int,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if cat:
        db.delete(cat)
        db.commit()
    return {"message": "Category deleted"}

@router.get("/notifications")
def get_notifications(
    skip: int = 0,
    limit: int = 50,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    items = db.query(Notification).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": len(items), "items": items}

@router.get("/audit-logs")
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return admin_service.get_audit_logs(db, skip, limit)
