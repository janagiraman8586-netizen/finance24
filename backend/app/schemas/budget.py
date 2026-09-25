from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.category import CategoryResponse

class BudgetCategoryCreate(BaseModel):
    category_id: int
    allocated_amount: float = Field(..., ge=0)

class BudgetCategoryResponse(BaseModel):
    id: int
    category_id: int
    allocated_amount: float
    used_amount: Optional[float] = 0.0
    remaining_amount: Optional[float] = 0.0
    percentage_used: Optional[float] = 0.0
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

class BudgetCreate(BaseModel):
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)
    total_amount: float = Field(..., gt=0)
    category_budgets: List[BudgetCategoryCreate] = []

class BudgetResponse(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    total_amount: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BudgetDetailsResponse(BudgetResponse):
    total_used: float = 0.0
    total_remaining: float = 0.0
    percentage_used: float = 0.0
    status: str = "On Track"  # "On Track", "Caution", "Over Budget"
    categories: List[BudgetCategoryResponse] = []
