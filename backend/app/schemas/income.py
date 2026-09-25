from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class IncomeBase(BaseModel):
    amount: float = Field(..., gt=0)
    source: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    date: datetime
    notes: Optional[str] = None

class IncomeCreate(IncomeBase):
    pass

class IncomeUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    source: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None

class IncomeResponse(IncomeBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
