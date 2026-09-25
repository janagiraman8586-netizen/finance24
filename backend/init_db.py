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

        # 4. Seed Primary User (kpraman8586@gmail.com)
        raman_user = db.query(User).filter(User.email == "kpraman8586@gmail.com").first()
        if not raman_user:
            raman_user = User(
                email="kpraman8586@gmail.com",
                username="raman_janagiraman",
                hashed_password=hash_password("Password123!"),
                first_name="Raman",
                last_name="Janagiraman",
                is_active=True
            )
            raman_user.roles.append(role_user)
            raman_user.roles.append(role_admin)
            db.add(raman_user)
            db.commit()
            db.refresh(raman_user)
        else:
            if role_admin not in raman_user.roles:
                raman_user.roles.append(role_admin)
            raman_user.is_active = True
            db.commit()

        # 5. Seed Demo User
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

        # 6. Seed Admin User
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

        # 7. Seed Sample Financial Data for raman_user and demo user
        now = datetime.utcnow()
        food_cat = db.query(Category).filter(Category.name == "Food & Dining").first()
        trans_cat = db.query(Category).filter(Category.name == "Transportation").first()
        util_cat = db.query(Category).filter(Category.name == "Utilities & Bills").first()

        for target_u, base_income in [(raman_user, 95000.00), (user, 75000.00)]:
            if not target_u:
                continue
            if db.query(Income).filter(Income.user_id == target_u.id).count() == 0:
                db.add(Income(
                    user_id=target_u.id,
                    amount=base_income,
                    source="Salary",
                    description="Monthly Primary Salary",
                    date=now - timedelta(days=5)
                ))
                db.add(Income(
                    user_id=target_u.id,
                    amount=20000.00,
                    source="Freelance",
                    description="Project Consultation & Services",
                    date=now - timedelta(days=2)
                ))

            if db.query(Expense).filter(Expense.user_id == target_u.id).count() == 0:
                if food_cat:
                    db.add(Expense(
                        user_id=target_u.id,
                        amount=2450.00,
                        category_id=food_cat.id,
                        description="Weekly Supermarket Grocery",
                        payment_method="UPI",
                        date=now - timedelta(days=3)
                    ))
                if trans_cat:
                    db.add(Expense(
                        user_id=target_u.id,
                        amount=850.00,
                        category_id=trans_cat.id,
                        description="Fuel & Transport",
                        payment_method="Credit Card",
                        date=now - timedelta(days=1)
                    ))
                if util_cat:
                    db.add(Expense(
                        user_id=target_u.id,
                        amount=3200.00,
                        category_id=util_cat.id,
                        description="High-speed Fiber Internet Bill",
                        payment_method="Net Banking",
                        date=now
                    ))

            if db.query(Budget).filter(Budget.user_id == target_u.id, Budget.month == now.month, Budget.year == now.year).count() == 0:
                b = Budget(user_id=target_u.id, month=now.month, year=now.year, total_amount=50000.00)
                db.add(b)
                db.flush()
                if food_cat:
                    db.add(BudgetCategory(budget_id=b.id, category_id=food_cat.id, allocated_amount=15000.00))
                if trans_cat:
                    db.add(BudgetCategory(budget_id=b.id, category_id=trans_cat.id, allocated_amount=8000.00))
                if util_cat:
                    db.add(BudgetCategory(budget_id=b.id, category_id=util_cat.id, allocated_amount=10000.00))

            if db.query(SavingsGoal).filter(SavingsGoal.user_id == target_u.id).count() == 0:
                db.add(SavingsGoal(
                    user_id=target_u.id,
                    title="Emergency & Wealth Fund",
                    target_amount=300000.00,
                    current_amount=75000.00,
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
