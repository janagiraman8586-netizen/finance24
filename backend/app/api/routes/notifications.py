from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth.security import get_current_user
from app.schemas.notification import NotificationResponse
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    skip: int = 0,
    limit: int = 50,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return notification_service.get_user_notifications(db, current_user.id, skip, limit)

@router.get("/unread-count")
def get_unread_count(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = notification_service.get_unread_count(db, current_user.id)
    return {"unread_count": count}

@router.put("/{notification_id}/read")
def mark_read(
    notification_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = notification_service.mark_as_read(db, current_user.id, notification_id)
    return {"success": success}

@router.put("/read-all")
def mark_all_read(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = notification_service.mark_all_as_read(db, current_user.id)
    return {"marked_count": count}
