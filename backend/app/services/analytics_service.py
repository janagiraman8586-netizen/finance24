from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc
from typing import Optional
from datetime import datetime, timedelta
from app.models.income import Income
from app.models.expense import Expense
from app.models.category import Category

def get_analytics_summary(db: Session, user_id: int, month: Optional[str] = None):
    now = datetime.utcnow()
    if month:
        try:
            year, m = map(int, month.split("-"))
        except ValueError:
            year, m = now.year, now.month
    else:
        year, m = now.year, now.month

    tot_income = db.query(func.sum(Income.amount)).filter(
        Income.user_id == user_id,
        extract('month', Income.date) == m,
        extract('year', Income.date) == year
    ).scalar() or 0.0

    tot_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        extract('month', Expense.date) == m,
        extract('year', Expense.date) == year
    ).scalar() or 0.0

    tot_income = float(tot_income)
    tot_expenses = float(tot_expenses)
    tot_savings = max(0.0, tot_income - tot_expenses)
    savings_rate = (tot_savings / tot_income * 100.0) if tot_income > 0 else 0.0

    # Avg daily spending
    days_in_month = 30
    avg_daily = tot_expenses / days_in_month

    # Largest expense
    largest = db.query(Expense).filter(
        Expense.user_id == user_id,
        extract('month', Expense.date) == m,
        extract('year', Expense.date) == year
    ).order_by(desc(Expense.amount)).first()

    largest_dict = None
    if largest:
        largest_dict = {
            "id": largest.id,
            "amount": float(largest.amount),
            "description": largest.description or "N/A",
            "category": largest.category.name if largest.category else "Uncategorized"
        }

    # Top income source
    top_src = db.query(Income.source, func.sum(Income.amount).label("total")).filter(
        Income.user_id == user_id,
        extract('month', Income.date) == m,
        extract('year', Income.date) == year
    ).group_by(Income.source).order_by(desc("total")).first()

    top_source_name = top_src[0] if top_src else "None"

    # Financial health
    if savings_rate >= 40:
        health = "Excellent"
    elif savings_rate >= 25:
        health = "Good"
    elif savings_rate >= 10:
        health = "Average"
    else:
        health = "Poor"

    return {
        "total_income": tot_income,
        "total_expenses": tot_expenses,
        "total_savings": tot_savings,
        "savings_rate": round(savings_rate, 2),
        "average_daily_spending": round(avg_daily, 2),
        "largest_expense": largest_dict,
        "top_income_source": top_source_name,
        "financial_health": health
    }

def get_monthly_analytics(db: Session, user_id: int, year: Optional[int] = None):
    year = year or datetime.utcnow().year
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    results = []

    for m in range(1, 13):
        inc = db.query(func.sum(Income.amount)).filter(
            Income.user_id == user_id,
            extract('month', Income.date) == m,
            extract('year', Income.date) == year
        ).scalar() or 0.0

        exp = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == user_id,
            extract('month', Expense.date) == m,
            extract('year', Expense.date) == year
        ).scalar() or 0.0

        inc = float(inc)
        exp = float(exp)
        sav = max(0.0, inc - exp)
        rate = (sav / inc * 100.0) if inc > 0 else 0.0

        results.append({
            "month": month_names[m - 1],
            "income": inc,
            "expenses": exp,
            "savings": sav,
            "savings_rate": round(rate, 2)
        })

    return {"months": results}

def get_category_analytics(db: Session, user_id: int, month: Optional[str] = None):
    now = datetime.utcnow()
    if month:
        try:
            year, m = map(int, month.split("-"))
        except ValueError:
            year, m = now.year, now.month
    else:
        year, m = now.year, now.month

    tot_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        extract('month', Expense.date) == m,
        extract('year', Expense.date) == year
    ).scalar() or 0.0
    tot_expenses = float(tot_expenses)

    rows = db.query(
        Category.name,
        Category.icon,
        func.sum(Expense.amount).label("amount")
    ).join(Expense, Expense.category_id == Category.id).filter(
        Expense.user_id == user_id,
        extract('month', Expense.date) == m,
        extract('year', Expense.date) == year
    ).group_by(Category.name, Category.icon).all()

    categories = []
    for r in rows:
        amt = float(r.amount)
        pct = (amt / tot_expenses * 100.0) if tot_expenses > 0 else 0.0
        categories.append({
            "name": r.name,
            "icon": r.icon,
            "amount": amt,
            "percentage": round(pct, 2)
        })

    return {"categories": categories}
