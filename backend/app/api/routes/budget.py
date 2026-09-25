from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.auth.security import get_current_user
from app.schemas.budget import BudgetCreate, BudgetDetailsResponse
from app.services import budget_service

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=Optional[BudgetDetailsResponse])
def get_budget(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return budget_service.get_or_create_monthly_budget(db, current_user.id, month, year)

@router.get("/{budget_id}/details", response_model=BudgetDetailsResponse)
def get_details(
    budget_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return budget_service.get_budget_details(db, budget_id, current_user.id)

@router.post("", response_model=BudgetDetailsResponse, status_code=status.HTTP_201_CREATED)
def create_or_update(
    data: BudgetCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return budget_service.create_or_update_budget(db, current_user.id, data)

@router.delete("/{budget_id}")
def delete(
    budget_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget_service.delete_budget(db, current_user.id, budget_id)
    return {"message": "Budget deleted successfully"}
