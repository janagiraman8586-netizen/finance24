from sqlalchemy.orm import Session
from typing import Optional, Any, Dict
from datetime import datetime
from app.models.audit_log import AuditLog

def log_audit(
    db: Session,
    admin_id: Optional[int],
    action: str,
    resource: Optional[str] = None,
    resource_id: Optional[int] = None,
    description: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    try:
        log_entry = AuditLog(
            admin_id=admin_id,
            action=action,
            resource=resource,
            resource_id=resource_id,
            description=description,
            details=details,
            created_at=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception as err:
        db.rollback()
        print(f"[AuditLog Error] Failed to log action {action}: {err}")
        return None
