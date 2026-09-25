from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.category import CategoryResponse

class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0)
    category_id: int
    description: Optional[str] = None
    payment_method: Optional[str] = "Cash"
    date: datetime
    notes: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    category_id: Optional[int] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True
