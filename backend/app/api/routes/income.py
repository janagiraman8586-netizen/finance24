from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.auth.security import get_current_user
from app.schemas.income import IncomeCreate, IncomeUpdate, IncomeResponse
from app.services import income_service

router = APIRouter(prefix="/income", tags=["Income"])

@router.get("", response_model=dict)
def list_income(
    skip: int = 0,
    limit: int = 10,
    source: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return income_service.get_user_income(
        db, current_user.id, skip, limit, source, start_date, end_date, search
    )

@router.post("", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
def create(
    data: IncomeCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return income_service.create_income(db, current_user.id, data)

@router.put("/{income_id}", response_model=IncomeResponse)
def update(
    income_id: int,
    data: IncomeUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return income_service.update_income(db, current_user.id, income_id, data)

@router.delete("/{income_id}")
def delete(
    income_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    income_service.delete_income(db, current_user.id, income_id)
    return {"message": "Income record deleted successfully"}
