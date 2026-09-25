import csv
import io
from fastapi import APIRouter, Depends, Response, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.auth.security import get_current_user
from app.models.transaction import Transaction
from app.models.income import Income
from app.models.expense import Expense
from app.models.budget import Budget
from app.models.savings_goal import SavingsGoal
from app.models.category import Category
from app.services import analytics_service, expense_service, income_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary")
def generate_period_report(
    period: str = Query("monthly", pattern="^(daily|weekly|monthly|yearly|custom)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    
    if period == "daily":
        s_date = datetime(now.year, now.month, now.day)
        e_date = s_date + timedelta(days=1)
    elif period == "weekly":
        s_date = now - timedelta(days=7)
        e_date = now
    elif period == "yearly":
        s_date = datetime(now.year, 1, 1)
        e_date = datetime(now.year, 12, 31, 23, 59, 59)
    elif period == "custom" and start_date and end_date:
        s_date = start_date
        e_date = end_date
    else:  # monthly default
        s_date = datetime(now.year, now.month, 1)
        # next month first day
        if now.month == 12:
            e_date = datetime(now.year + 1, 1, 1)
        else:
            e_date = datetime(now.year, now.month + 1, 1)

    tot_income = db.query(func.sum(Income.amount)).filter(
        Income.user_id == current_user.id,
        Income.date >= s_date,
        Income.date < e_date
    ).scalar() or 0.0

    tot_expense = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.date >= s_date,
        Expense.date < e_date
    ).scalar() or 0.0

    tot_income = float(tot_income)
    tot_expense = float(tot_expense)
    net_cashflow = tot_income - tot_expense
    savings_rate = (net_cashflow / tot_income * 100.0) if tot_income > 0 else 0.0

    # Category breakdown for period
    category_rows = db.query(
        Category.name,
        Category.icon,
        func.sum(Expense.amount).label("amount")
    ).join(Expense, Expense.category_id == Category.id).filter(
        Expense.user_id == current_user.id,
        Expense.date >= s_date,
        Expense.date < e_date
    ).group_by(Category.name, Category.icon).all()

    category_breakdown = [
        {
            "category": r.name,
            "icon": r.icon,
            "amount": float(r.amount),
            "percentage": round((float(r.amount) / tot_expense * 100.0), 2) if tot_expense > 0 else 0.0
        }
        for r in category_rows
    ]

    return {
        "period": period,
        "start_date": s_date.isoformat(),
        "end_date": e_date.isoformat(),
        "total_income": tot_income,
        "total_expenses": tot_expense,
        "net_cashflow": net_cashflow,
        "savings_rate": round(savings_rate, 2),
        "categories": category_breakdown
    }

@router.get("/monthly")
def generate_monthly_report(
    month: Optional[int] = None,
    year: Optional[int] = None,
    format: str = Query("json", pattern="^(json|csv|excel)$"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    m = month or now.month
    y = year or now.year

    month_str = f"{y}-{m:02d}"
    summary = analytics_service.get_analytics_summary(db, current_user.id, month_str)
    expenses = expense_service.get_user_expenses(db, current_user.id, limit=500)["items"]
    income = income_service.get_user_income(db, current_user.id, limit=500)["items"]

    if format in ("csv", "excel"):
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["MONTHLY FINANCIAL REPORT", f"{m}/{y}"])
        writer.writerow([])
        writer.writerow(["SUMMARY METRICS"])
        writer.writerow(["Total Income", summary["total_income"]])
        writer.writerow(["Total Expenses", summary["total_expenses"]])
        writer.writerow(["Total Savings", summary["total_savings"]])
        writer.writerow(["Savings Rate (%)", summary["savings_rate"]])
        writer.writerow(["Financial Health", summary["financial_health"]])
        writer.writerow([])

        writer.writerow(["EXPENSES LEDGER"])
        writer.writerow(["Date", "Category", "Description", "Amount", "Payment Method"])
        for exp in expenses:
            cat_name = exp.category.name if exp.category else "N/A"
            writer.writerow([exp.date.strftime('%Y-%m-%d') if exp.date else "", cat_name, exp.description or "", exp.amount, exp.payment_method or ""])

        writer.writerow([])
        writer.writerow(["INCOME LEDGER"])
        writer.writerow(["Date", "Source", "Description", "Amount"])
        for inc in income:
            writer.writerow([inc.date.strftime('%Y-%m-%d') if inc.date else "", inc.source, inc.description or "", inc.amount])

        media_type = "application/vnd.ms-excel" if format == "excel" else "text/csv"
        ext = "csv" if format == "csv" else "xls"
        response = Response(content=output.getvalue(), media_type=media_type)
        response.headers["Content-Disposition"] = f"attachment; filename=financial_report_{m}_{y}.{ext}"
        return response

    return {
        "report_period": f"{m}/{y}",
        "summary": summary,
        "expense_count": len(expenses),
        "income_count": len(income)
    }

@router.get("/export/transactions")
def export_transactions(
    format: str = Query("csv", pattern="^(csv|excel)$"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Transaction ID", "Date", "Type", "Category", "Amount", "Payment Method", "Status", "Description"])

    for tx in transactions:
        cat_name = tx.category.name if tx.category else "N/A"
        writer.writerow([
            tx.id,
            tx.date.strftime('%Y-%m-%d') if tx.date else "",
            tx.type.upper(),
            cat_name,
            float(tx.amount),
            tx.payment_method or "N/A",
            tx.status,
            tx.description or ""
        ])

    media_type = "application/vnd.ms-excel" if format == "excel" else "text/csv"
    ext = "csv" if format == "csv" else "xls"
    response = Response(content=output.getvalue(), media_type=media_type)
    response.headers["Content-Disposition"] = f"attachment; filename=transactions_export.{ext}"
    return response

@router.get("/export/budgets")
def export_budgets(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Month/Year", "Total Budget Amount", "Category", "Allocated Amount"])

    for b in budgets:
        for bc in b.budget_categories:
            writer.writerow([
                f"{b.month}/{b.year}",
                float(b.total_amount),
                bc.category.name if bc.category else "N/A",
                float(bc.allocated_amount)
            ])

    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=budgets_export.csv"
    return response

@router.get("/export/savings")
def export_savings(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Goal ID", "Title", "Target Amount", "Current Amount", "Target Date", "Status", "Progress %"])

    for g in goals:
        target = float(g.target_amount)
        current = float(g.current_amount or 0)
        pct = (current / target * 100) if target > 0 else 0
        writer.writerow([
            g.id,
            g.title,
            target,
            current,
            g.target_date.strftime('%Y-%m-%d') if g.target_date else "",
            g.status,
            f"{pct:.1f}%"
        ])

    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=savings_goals_export.csv"
    return response
