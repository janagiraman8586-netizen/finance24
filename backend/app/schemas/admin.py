from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from app.schemas.auth import UserResponse

class UserStatusUpdate(BaseModel):
    is_active: bool
    reason: Optional[str] = None

class AdminUserItem(UserResponse):
    total_transactions: int = 0
    total_spent: float = 0.0

class AdminUserListResponse(BaseModel):
    total_users: int
    users: List[AdminUserItem]

class AdminStatsResponse(BaseModel):
    user_statistics: dict
    financial_statistics: dict
    platform_statistics: dict

class AuditLogResponse(BaseModel):
    id: int
    admin_id: Optional[int] = None
    action: str
    resource: Optional[str] = None
    resource_id: Optional[int] = None
    description: Optional[str] = None
    details: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogListResponse(BaseModel):
    total_logs: int
    logs: List[AuditLogResponse]
