import sys
import os
from datetime import datetime, timedelta

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import (
    User, Role, UserRole, Category, PaymentMethod, Transaction,
    Income, Expense, Budget, BudgetCategory, SavingsGoal
)
from app.auth.security import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Roles
        role_user = db.query(Role).filter(Role.name == "User").first()
        if not role_user:
            role_user = Role(name="User")
            db.add(role_user)

        role_admin = db.query(Role).filter(Role.name == "Admin").first()
        if not role_admin:
            role_admin = Role(name="Admin")
            db.add(role_admin)

        db.commit()

        # 2. Seed Categories
        categories_data = [
            ("Food & Dining", "expense", "🍔"),
            ("Transportation", "expense", "🚗"),
            ("Shopping", "expense", "🛍️"),
            ("Utilities & Bills", "expense", "⚡"),
            ("Entertainment", "expense", "🎬"),
            ("Healthcare", "expense", "🏥"),
            ("Housing & Rent", "expense", "🏠"),
            ("Education", "expense", "📚"),
            ("Travel", "expense", "✈️"),
            ("Salary", "income", "💰"),
            ("Freelance", "income", "💻"),
            ("Business", "income", "💼"),
            ("Investments", "income", "📈"),
            ("Other Income", "income", "🎁")
        ]

        for name, ctype, icon in categories_data:
            if not db.query(Category).filter(Category.name == name).first():
                db.add(Category(name=name, type=ctype, icon=icon))

        db.commit()

        # 3. Seed Payment Methods
        methods = ["Cash", "UPI", "Debit Card", "Credit Card", "Bank Transfer", "Net Banking", "Other"]
        for m in methods:
            if not db.query(PaymentMethod).filter(PaymentMethod.name == m).first():
                db.add(PaymentMethod(name=m))

        db.commit()

        # 4. Seed User
        user = db.query(User).filter(User.email == "user@example.com").first()
        if not user:
            user = User(
                email="user@example.com",
                username="john_doe",
                hashed_password=hash_password("Password123!"),
                first_name="John",
                last_name="Doe",
                is_active=True
            )
            user.roles.append(role_user)
            db.add(user)
            db.commit()
            db.refresh(user)

        # 5. Seed Admin User
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            admin = User(
                email="admin@example.com",
                username="admin_user",
                hashed_password=hash_password("Admin123!"),
                first_name="Admin",
                last_name="System",
                is_active=True
            )
            admin.roles.append(role_admin)
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # 6. Seed Sample Financial Data for user
        if db.query(Income).filter(Income.user_id == user.id).count() == 0:
            db.add(Income(
                user_id=user.id,
                amount=75000.00,
                source="Salary",
                description="Monthly Software Engineer Salary",
                date=datetime.utcnow() - timedelta(days=5)
            ))
            db.add(Income(
                user_id=user.id,
                amount=15000.00,
                source="Freelance",
                description="Web Design Client Project",
                date=datetime.utcnow() - timedelta(days=2)
            ))

        food_cat = db.query(Category).filter(Category.name == "Food & Dining").first()
        trans_cat = db.query(Category).filter(Category.name == "Transportation").first()
        util_cat = db.query(Category).filter(Category.name == "Utilities & Bills").first()

        if db.query(Expense).filter(Expense.user_id == user.id).count() == 0:
            if food_cat:
                db.add(Expense(
                    user_id=user.id,
                    amount=1850.00,
                    category_id=food_cat.id,
                    description="Weekly Supermarket Grocery",
                    payment_method="UPI",
                    date=datetime.utcnow() - timedelta(days=3)
                ))
            if trans_cat:
                db.add(Expense(
                    user_id=user.id,
                    amount=650.00,
                    category_id=trans_cat.id,
                    description="Fuel Station Refill",
                    payment_method="Credit Card",
                    date=datetime.utcnow() - timedelta(days=1)
                ))
            if util_cat:
                db.add(Expense(
                    user_id=user.id,
                    amount=3200.00,
                    category_id=util_cat.id,
                    description="High-speed Fiber Internet Bill",
                    payment_method="Net Banking",
                    date=datetime.utcnow()
                ))

        db.commit()

        # Seed Budget
        now = datetime.utcnow()
        if db.query(Budget).filter(Budget.user_id == user.id, Budget.month == now.month, Budget.year == now.year).count() == 0:
            b = Budget(user_id=user.id, month=now.month, year=now.year, total_amount=45000.00)
            db.add(b)
            db.flush()
            if food_cat:
                db.add(BudgetCategory(budget_id=b.id, category_id=food_cat.id, allocated_amount=12000.00))
            if trans_cat:
                db.add(BudgetCategory(budget_id=b.id, category_id=trans_cat.id, allocated_amount=5000.00))
            if util_cat:
                db.add(BudgetCategory(budget_id=b.id, category_id=util_cat.id, allocated_amount=8000.00))
            db.commit()

        # Seed Savings Goal
        if db.query(SavingsGoal).filter(SavingsGoal.user_id == user.id).count() == 0:
            db.add(SavingsGoal(
                user_id=user.id,
                title="Emergency Reserve Fund",
                target_amount=150000.00,
                current_amount=45000.00,
                target_date=now + timedelta(days=365),
                status="active"
            ))
            db.commit()

        print("[SUCCESS] Database successfully initialized and seeded!")

    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
