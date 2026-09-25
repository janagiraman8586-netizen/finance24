from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional
from datetime import datetime
from fastapi import HTTPException, status
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services.audit_service import log_audit
from app.services.notification_service import create_notification

def get_user_transactions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    tx_type: Optional[str] = None,
    category_id: Optional[int] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    status_val: Optional[str] = None,
    sort_by: Optional[str] = "date",
    sort_order: Optional[str] = "desc"
):
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    
    if tx_type:
        query = query.filter(Transaction.type == tx_type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if payment_method:
        query = query.filter(Transaction.payment_method == payment_method)
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)
    if status_val:
        query = query.filter(Transaction.status == status_val)

    total = query.count()

    # Sorting
    sort_col = getattr(Transaction, sort_by, Transaction.date)
    if sort_order == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_transaction(db: Session, user_id: int, data: TransactionCreate):
    tx = Transaction(
        user_id=user_id,
        type=data.type,
        amount=data.amount,
        category_id=data.category_id,
        description=data.description,
        payment_method=data.payment_method,
        date=data.date,
        status=data.status or "completed"
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    # Large expense notification check (> 25000)
    if tx.type == "expense" and float(tx.amount) >= 25000:
        create_notification(
            db, user_id, "large_expense",
            f"Large expense recorded: ₹{float(tx.amount):,.2f} for '{tx.description}'"
        )

    log_audit(db, user_id, "transaction_create", "transactions", tx.id, f"Created {tx.type} transaction: ₹{float(tx.amount)}")
    return tx

def update_transaction(db: Session, user_id: int, tx_id: int, data: TransactionUpdate):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(tx, key, value)

    db.commit()
    db.refresh(tx)
    log_audit(db, user_id, "transaction_update", "transactions", tx.id, f"Updated transaction: ₹{float(tx.amount)}")
    return tx

def delete_transaction(db: Session, user_id: int, tx_id: int):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    
    db.delete(tx)
    db.commit()
    log_audit(db, user_id, "transaction_delete", "transactions", tx_id, "Deleted transaction")
    return True
