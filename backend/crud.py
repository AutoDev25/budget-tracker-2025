from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from datetime import datetime, date
import models, schemas
from typing import List, Optional

# User CRUD operations
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(name=user.name, color=user.color)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# Category CRUD operations
def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()

def update_category(db: Session, category_id: int, category: schemas.CategoryCreate):
    db_category = get_category(db, category_id)
    if db_category:
        update_data = category.model_dump()
        for field, value in update_data.items():
            setattr(db_category, field, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category

# Expense CRUD operations
def create_expense(db: Session, expense: schemas.ExpenseCreate):
    db_expense = models.Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_expenses(db: Session, skip: int = 0, limit: int = 100, 
                user_id: Optional[int] = None, category_id: Optional[int] = None,
                start_date: Optional[date] = None, end_date: Optional[date] = None):
    query = db.query(models.Expense)
    
    if user_id:
        query = query.filter(models.Expense.user_id == user_id)
    if category_id:
        query = query.filter(models.Expense.category_id == category_id)
    if start_date:
        query = query.filter(models.Expense.date >= start_date)
    if end_date:
        query = query.filter(models.Expense.date <= end_date)
        
    return query.order_by(models.Expense.date.desc()).offset(skip).limit(limit).all()

def get_expense(db: Session, expense_id: int):
    return db.query(models.Expense).filter(models.Expense.id == expense_id).first()

def update_expense(db: Session, expense_id: int, expense: schemas.ExpenseUpdate):
    db_expense = get_expense(db, expense_id)
    if db_expense:
        update_data = expense.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_expense, field, value)
        db.commit()
        db.refresh(db_expense)
    return db_expense

def delete_expense(db: Session, expense_id: int):
    db_expense = get_expense(db, expense_id)
    if db_expense:
        db.delete(db_expense)
        db.commit()
    return db_expense

# Summary and analytics operations
def get_monthly_summary(db: Session, year: int, month: int) -> schemas.MonthlySummary:
    # Get expenses for the month
    expenses_query = db.query(models.Expense).filter(
        and_(
            extract('year', models.Expense.date) == year,
            extract('month', models.Expense.date) == month
        )
    )
    
    expenses = expenses_query.all()
    total_amount = sum(expense.amount for expense in expenses)
    expense_count = len(expenses)
    daily_average = total_amount / 30 if expense_count > 0 else 0
    
    # Category summary
    category_totals = db.query(
        models.Category.name,
        models.Category.color,
        func.sum(models.Expense.amount).label('total'),
        func.count(models.Expense.id).label('count')
    ).join(models.Expense).filter(
        and_(
            extract('year', models.Expense.date) == year,
            extract('month', models.Expense.date) == month
        )
    ).group_by(models.Category.id).all()
    
    categories = []
    for cat_name, cat_color, cat_total, cat_count in category_totals:
        percentage = (cat_total / total_amount * 100) if total_amount > 0 else 0
        categories.append(schemas.CategorySummary(
            category_name=cat_name,
            category_color=cat_color,
            total_amount=cat_total,
            expense_count=cat_count,
            percentage=percentage
        ))
    
    # User summary
    user_totals = db.query(
        models.User.name,
        models.User.color,
        func.sum(models.Expense.amount).label('total'),
        func.count(models.Expense.id).label('count')
    ).join(models.Expense).filter(
        and_(
            extract('year', models.Expense.date) == year,
            extract('month', models.Expense.date) == month
        )
    ).group_by(models.User.id).all()
    
    users = []
    for user_name, user_color, user_total, user_count in user_totals:
        percentage = (user_total / total_amount * 100) if total_amount > 0 else 0
        users.append(schemas.UserSummary(
            user_name=user_name,
            user_color=user_color,
            total_amount=user_total,
            expense_count=user_count,
            percentage=percentage
        ))
    
    return schemas.MonthlySummary(
        year=year,
        month=month,
        total_amount=total_amount,
        expense_count=expense_count,
        daily_average=daily_average,
        categories=categories,
        users=users
    )

def create_default_categories(db: Session):
    """Create default expense categories"""
    default_categories = [
        {"name": "Food", "color": "#ff6b6b", "is_default": 1},
        {"name": "Transportation", "color": "#4ecdc4", "is_default": 1},
        {"name": "Utilities", "color": "#45b7d1", "is_default": 1},
        {"name": "Entertainment", "color": "#96ceb4", "is_default": 1},
        {"name": "Shopping", "color": "#ffeaa7", "is_default": 1},
        {"name": "Healthcare", "color": "#dda0dd", "is_default": 1},
        {"name": "Education", "color": "#fab1a0", "is_default": 1},
        {"name": "Travel", "color": "#74b9ff", "is_default": 1},
        {"name": "Insurance", "color": "#a29bfe", "is_default": 1},
        {"name": "Other", "color": "#636e72", "is_default": 1}
    ]
    
    for cat_data in default_categories:
        existing = get_category_by_name(db, cat_data["name"])
        if not existing:
            category = schemas.CategoryCreate(**cat_data)
            create_category(db, category)

def create_default_user(db: Session):
    """Create default user if no users exist"""
    users = get_users(db, limit=1)
    if not users:
        default_user = schemas.UserCreate(name="You", color="#667eea")
        create_user(db, default_user)