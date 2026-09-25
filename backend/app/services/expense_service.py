from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime
from fastapi import HTTPException, status
from app.models.expense import Expense
from app.models.transaction import Transaction
from app.schemas.expense import ExpenseCreate, ExpenseUpdate

def get_user_expenses(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    sort_by: Optional[str] = "date"
):
    query = db.query(Expense).filter(Expense.user_id == user_id)
    if category_id:
        query = query.filter(Expense.category_id == category_id)
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)

    if sort_by == "amount":
        query = query.order_by(desc(Expense.amount))
    else:
        query = query.order_by(desc(Expense.date))

    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_expense(db: Session, user_id: int, data: ExpenseCreate):
    expense = Expense(
        user_id=user_id,
        amount=data.amount,
        category_id=data.category_id,
        description=data.description,
        payment_method=data.payment_method,
        date=data.date,
        notes=data.notes
    )
    db.add(expense)

    # Sync to main transactions ledger
    tx = Transaction(
        user_id=user_id,
        type="expense",
        amount=data.amount,
        category_id=data.category_id,
        description=data.description or "Expense payment",
        payment_method=data.payment_method or "Cash",
        date=data.date,
        status="completed"
    )
    db.add(tx)

    db.commit()
    db.refresh(expense)
    return expense

def update_expense(db: Session, user_id: int, expense_id: int, data: ExpenseUpdate):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, key, value)

    db.commit()
    db.refresh(expense)
    return expense

def delete_expense(db: Session, user_id: int, expense_id: int):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")

    db.delete(expense)
    db.commit()
    return True
