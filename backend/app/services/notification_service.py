from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.notification import Notification

def create_notification(db: Session, user_id: int, notif_type: str, message: str) -> Notification:
    try:
        notif = Notification(
            user_id=user_id,
            type=notif_type,
            message=message,
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif
    except Exception as e:
        db.rollback()
        print(f"[Notification Error] {e}")
        return None

def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 50) -> List[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_unread_count(db: Session, user_id: int) -> int:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read == False)
        .count()
    )

def mark_as_read(db: Session, user_id: int, notification_id: int) -> bool:
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
        return True
    return False

def mark_all_as_read(db: Session, user_id: int) -> int:
    unread = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).all()
    count = len(unread)
    for n in unread:
        n.is_read = True
    db.commit()
    return count
