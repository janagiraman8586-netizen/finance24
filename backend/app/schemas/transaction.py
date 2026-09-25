from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.category import CategoryResponse

class TransactionBase(BaseModel):
    type: str = Field(..., pattern="^(income|expense|transfer)$")
    amount: float = Field(..., gt=0)
    category_id: int
    description: str = Field(..., min_length=1, max_length=255)
    payment_method: Optional[str] = "UPI"
    date: datetime
    status: Optional[str] = "completed"

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    type: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    category_id: Optional[int] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    date: Optional[datetime] = None
    status: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True
