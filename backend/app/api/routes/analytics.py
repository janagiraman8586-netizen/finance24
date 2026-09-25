from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.auth.security import get_current_user
from app.schemas.analytics import (
    AnalyticsSummaryResponse, MonthlyAnalyticsResponse, CategoryAnalyticsResponse
)
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary", response_model=AnalyticsSummaryResponse)
def summary(
    month: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return analytics_service.get_analytics_summary(db, current_user.id, month)

@router.get("/monthly", response_model=MonthlyAnalyticsResponse)
def monthly(
    year: Optional[int] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return analytics_service.get_monthly_analytics(db, current_user.id, year)

@router.get("/categories", response_model=CategoryAnalyticsResponse)
def categories(
    month: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return analytics_service.get_category_analytics(db, current_user.id, month)
