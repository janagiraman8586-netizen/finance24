from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    target_amount = Column(Numeric(18, 2), nullable=False)
    current_amount = Column(Numeric(18, 2), default=0.0)
    target_date = Column(DateTime, nullable=False)
    status = Column(String(20), default="active", index=True)  # 'active', 'completed', 'abandoned'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="savings_goals")
    savings_transactions = relationship("SavingsTransaction", back_populates="savings_goal", cascade="all, delete-orphan")
