from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime
from fastapi import HTTPException, status
from app.models.income import Income
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.income import IncomeCreate, IncomeUpdate

def get_user_income(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    source: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None
):
    query = db.query(Income).filter(Income.user_id == user_id)
    if source:
        query = query.filter(Income.source.ilike(f"%{source}%"))
    if start_date:
        query = query.filter(Income.date >= start_date)
    if end_date:
        query = query.filter(Income.date <= end_date)
    if search:
        query = query.filter(Income.description.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.order_by(desc(Income.date)).offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_income(db: Session, user_id: int, data: IncomeCreate):
    income = Income(
        user_id=user_id,
        amount=data.amount,
        source=data.source,
        description=data.description,
        date=data.date,
        notes=data.notes
    )
    db.add(income)

    # Sync to transactions ledger
    income_category = db.query(Category).filter(Category.name.ilike(data.source)).first()
    if not income_category:
        income_category = db.query(Category).filter(Category.type == "income").first()
    
    cat_id = income_category.id if income_category else 1

    tx = Transaction(
        user_id=user_id,
        type="income",
        amount=data.amount,
        category_id=cat_id,
        description=data.description or f"Income from {data.source}",
        payment_method="Bank Transfer",
        date=data.date,
        status="completed"
    )
    db.add(tx)

    db.commit()
    db.refresh(income)
    return income

def update_income(db: Session, user_id: int, income_id: int, data: IncomeUpdate):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == user_id).first()
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income record not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(income, key, value)
    
    db.commit()
    db.refresh(income)
    return income

def delete_income(db: Session, user_id: int, income_id: int):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == user_id).first()
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income record not found")
    
    db.delete(income)
    db.commit()
    return True
