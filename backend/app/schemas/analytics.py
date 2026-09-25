from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AnalyticsSummaryResponse(BaseModel):
    total_income: float
    total_expenses: float
    total_savings: float
    savings_rate: float
    average_daily_spending: float
    largest_expense: Optional[Dict[str, Any]] = None
    top_income_source: Optional[str] = None
    financial_health: str  # 'Excellent', 'Good', 'Average', 'Poor'

class MonthlyAnalyticsItem(BaseModel):
    month: str
    income: float
    expenses: float
    savings: float
    savings_rate: float

class MonthlyAnalyticsResponse(BaseModel):
    months: List[MonthlyAnalyticsItem]

class DailySpendingItem(BaseModel):
    date: str
    spent: float
    income: float
    transaction_count: int

class DailySpendingResponse(BaseModel):
    days: List[DailySpendingItem]

class CategoryAnalyticsItem(BaseModel):
    name: str
    amount: float
    percentage: float
    icon: Optional[str] = None

class CategoryAnalyticsResponse(BaseModel):
    categories: List[CategoryAnalyticsItem]

class TrendsResponse(BaseModel):
    income_trend: List[float]
    expense_trend: List[float]
    savings_trend: List[float]
    months: List[str]
    averages: Dict[str, float]
