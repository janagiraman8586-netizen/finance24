from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.auth.security import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from app.services import transaction_service
from app.models.transaction import Transaction

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=dict)
def list_transactions(
    skip: int = 0,
    limit: int = 20,
    type: Optional[str] = None,
    category_id: Optional[int] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    status_val: Optional[str] = None,
    sort_by: Optional[str] = "date",
    sort_order: Optional[str] = "desc",
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return transaction_service.get_user_transactions(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        tx_type=type,
        category_id=category_id,
        payment_method=payment_method,
        search=search,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amount,
        max_amount=max_amount,
        status_val=status_val,
        sort_by=sort_by,
        sort_order=sort_order
    )

@router.get("/{tx_id}", response_model=TransactionResponse)
def get_transaction_detail(
    tx_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return tx

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create(
    data: TransactionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return transaction_service.create_transaction(db, current_user.id, data)

@router.put("/{tx_id}", response_model=TransactionResponse)
def update(
    tx_id: int,
    data: TransactionUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return transaction_service.update_transaction(db, current_user.id, tx_id, data)

@router.delete("/{tx_id}")
def delete(
    tx_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction_service.delete_transaction(db, current_user.id, tx_id)
    return {"message": "Transaction deleted successfully"}
