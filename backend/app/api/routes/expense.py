from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.auth.security import get_current_user
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.services import expense_service

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.get("", response_model=dict)
def list_expenses(
    skip: int = 0,
    limit: int = 10,
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    sort_by: Optional[str] = "date",
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return expense_service.get_user_expenses(
        db, current_user.id, skip, limit, category_id, start_date, end_date, sort_by
    )

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create(
    data: ExpenseCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return expense_service.create_expense(db, current_user.id, data)

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update(
    expense_id: int,
    data: ExpenseUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return expense_service.update_expense(db, current_user.id, expense_id, data)

@router.delete("/{expense_id}")
def delete(
    expense_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense_service.delete_expense(db, current_user.id, expense_id)
    return {"message": "Expense record deleted successfully"}
