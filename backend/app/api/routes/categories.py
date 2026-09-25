from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.auth.security import get_current_user
from app.services.audit_service import log_audit

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Category)
    if type:
        query = query.filter(Category.type == type)
    return query.order_by(Category.name.asc()).all()

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Category).filter(Category.name == data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category with this name already exists")
    
    cat = Category(name=data.name, type=data.type, icon=data.icon or "📁")
    db.add(cat)
    db.commit()
    db.refresh(cat)
    log_audit(db, current_user.id, "category_create", "categories", cat.id, f"Created category: {cat.name}")
    return cat

@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(
    cat_id: int,
    data: CategoryUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    if data.name:
        cat.name = data.name
    if data.type:
        cat.type = data.type
    if data.icon is not None:
        cat.icon = data.icon

    db.commit()
    db.refresh(cat)
    log_audit(db, current_user.id, "category_update", "categories", cat.id, f"Updated category: {cat.name}")
    return cat

@router.delete("/{cat_id}")
def delete_category(
    cat_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    cat_name = cat.name
    db.delete(cat)
    db.commit()
    log_audit(db, current_user.id, "category_delete", "categories", cat_id, f"Deleted category: {cat_name}")
    return {"message": "Category deleted successfully"}
