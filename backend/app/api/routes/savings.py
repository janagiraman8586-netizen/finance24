from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.auth.security import get_current_user
from app.schemas.savings import (
    SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse, SavingsTransactionCreate
)
from app.services import savings_service

router = APIRouter(prefix="/savings", tags=["Savings Goals"])

@router.get("", response_model=List[SavingsGoalResponse])
def list_goals(
    status: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return savings_service.get_savings_goals(db, current_user.id, status)

@router.post("", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    data: SavingsGoalCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return savings_service.create_savings_goal(db, current_user.id, data)

@router.put("/{goal_id}", response_model=SavingsGoalResponse)
def update_goal(
    goal_id: int,
    data: SavingsGoalUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return savings_service.update_savings_goal(db, current_user.id, goal_id, data)

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    savings_service.delete_savings_goal(db, current_user.id, goal_id)
    return {"message": "Savings goal deleted successfully"}

@router.get("/{goal_id}/transactions")
def get_goal_transactions(
    goal_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return savings_service.get_savings_transactions(db, current_user.id, goal_id)

@router.post("/{goal_id}/add", response_model=SavingsGoalResponse)
def add_money(
    goal_id: int,
    data: SavingsTransactionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return savings_service.deposit_to_savings_goal(db, current_user.id, goal_id, data)

@router.post("/{goal_id}/withdraw", response_model=SavingsGoalResponse)
def withdraw_money(
    goal_id: int,
    data: SavingsTransactionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return savings_service.withdraw_from_savings_goal(db, current_user.id, goal_id, data)
