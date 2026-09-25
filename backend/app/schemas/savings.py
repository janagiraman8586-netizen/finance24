from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SavingsTransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    note: Optional[str] = None

class SavingsTransactionResponse(BaseModel):
    id: int
    savings_goal_id: int
    amount: float
    type: str  # 'deposit', 'withdrawal'
    date: datetime

    class Config:
        from_attributes = True

class SavingsGoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    target_amount: float = Field(..., gt=0)
    target_date: datetime

class SavingsGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0)
    target_date: Optional[datetime] = None
    status: Optional[str] = None

class SavingsGoalResponse(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    current_amount: float
    target_date: datetime
    status: str
    percentage_completed: float = 0.0
    days_remaining: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
