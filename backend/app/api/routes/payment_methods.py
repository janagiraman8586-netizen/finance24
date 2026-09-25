from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field
from app.database import get_db
from app.models.payment_method import PaymentMethod
from app.auth.security import get_current_user
from app.services.audit_service import log_audit

router = APIRouter(prefix="/payment-methods", tags=["Payment Methods"])

class PaymentMethodCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)

class PaymentMethodResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[PaymentMethodResponse])
def get_payment_methods(db: Session = Depends(get_db)):
    return db.query(PaymentMethod).order_by(PaymentMethod.id.asc()).all()

@router.post("", response_model=PaymentMethodResponse, status_code=status.HTTP_201_CREATED)
def create_payment_method(
    data: PaymentMethodCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(PaymentMethod).filter(PaymentMethod.name == data.name).first()
    if existing:
        return existing
    
    pm = PaymentMethod(name=data.name)
    db.add(pm)
    db.commit()
    db.refresh(pm)
    log_audit(db, current_user.id, "payment_method_create", "payment_methods", pm.id, f"Added payment method: {pm.name}")
    return pm

@router.delete("/{pm_id}")
def delete_payment_method(
    pm_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pm = db.query(PaymentMethod).filter(PaymentMethod.id == pm_id).first()
    if not pm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment method not found")
    
    name = pm.name
    db.delete(pm)
    db.commit()
    log_audit(db, current_user.id, "payment_method_delete", "payment_methods", pm_id, f"Deleted payment method: {name}")
    return {"message": "Payment method deleted successfully"}
