import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    # Local development - SQLite
    DATABASE_URL = "sqlite:///./budget.db"
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    # Production - PostgreSQL (Render)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://")
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String)
    budget_limit = Column(Float, nullable=True)
    transactions = relationship("Transaction", back_populates="category")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    amount = Column(Float)
    date = Column(Date)
    category_id = Column(Integer, ForeignKey("categories.id"))
    type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    category = relationship("Category", back_populates="transactions")

# Create tables
Base.metadata.create_all(bind=engine)

# Seed default data
def seed_default_data():
    db = SessionLocal()
    try:
        # Check if categories exist
        if db.query(Category).count() == 0:
            default_categories = [
                {"name": "Food", "type": "expense", "budget_limit": None},
                {"name": "Transportation", "type": "expense", "budget_limit": None},
                {"name": "Entertainment", "type": "expense", "budget_limit": None},
                {"name": "Shopping", "type": "expense", "budget_limit": None},
                {"name": "Bills", "type": "expense", "budget_limit": None},
                {"name": "Healthcare", "type": "expense", "budget_limit": None},
                {"name": "Other", "type": "expense", "budget_limit": None},
            ]
            
            for cat_data in default_categories:
                category = Category(**cat_data)
                db.add(category)
            
            db.commit()
            print("Default categories created")
    finally:
        db.close()

# Seed data on startup
seed_default_data()

# Pydantic Models
class CategoryCreate(BaseModel):
    name: str
    type: str
    budget_limit: Optional[float] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    type: str
    budget_limit: Optional[float]
    
    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    description: str
    amount: float
    date: date
    category_id: int
    type: str

class TransactionResponse(BaseModel):
    id: int
    description: str
    amount: float
    date: date
    category_id: int
    type: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class BudgetSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    categories_spending: dict

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI app
app = FastAPI(title="Budget Tracker 2025 API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Budget Tracker 2025 API is running!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

# Category endpoints
@app.post("/api/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/api/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    # Try to get categories from database
    try:
        categories = db.query(Category).all()
        if len(categories) > 0:
            return categories
    except Exception as e:
        print(f"Database error: {e}")
    
    # Fallback to hardcoded categories if database is empty or fails
    return [
        {"id": 1, "name": "Food", "type": "expense", "budget_limit": None},
        {"id": 2, "name": "Transportation", "type": "expense", "budget_limit": None},
        {"id": 3, "name": "Entertainment", "type": "expense", "budget_limit": None},
        {"id": 4, "name": "Shopping", "type": "expense", "budget_limit": None},
        {"id": 5, "name": "Bills", "type": "expense", "budget_limit": None},
        {"id": 6, "name": "Healthcare", "type": "expense", "budget_limit": None},
        {"id": 7, "name": "Other", "type": "expense", "budget_limit": None},
    ]

@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}

# Transaction endpoints
@app.post("/api/transactions", response_model=TransactionResponse)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/api/transactions", response_model=List[TransactionResponse])
def get_transactions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    
    transactions = query.order_by(Transaction.date.desc()).all()
    return transactions

@app.get("/api/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@app.put("/api/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(transaction_id: int, transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    for key, value in transaction.model_dump().items():
        setattr(db_transaction, key, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}

# Summary endpoint
@app.get("/api/summary", response_model=BudgetSummary)
def get_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.all()
    
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    
    categories_spending = {}
    for transaction in transactions:
        if transaction.type == "expense" and transaction.category:
            if transaction.category.name not in categories_spending:
                categories_spending[transaction.category.name] = 0
            categories_spending[transaction.category.name] += transaction.amount
    
    return BudgetSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        balance=total_income - total_expenses,
        categories_spending=categories_spending
    )

# User endpoints (for frontend compatibility)
@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    # Return a default user for simplicity
    return [{"id": 1, "name": "Default User", "color": "#00ff00", "created_at": "2025-01-01T00:00:00"}]

# Expense endpoints (aliases for transactions)
@app.get("/api/expenses")
def get_expenses(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    category_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    
    # Apply pagination
    transactions = query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()
    
    # Convert to expense format (add user and category info if needed)
    return transactions

@app.post("/api/expenses")
def create_expense(transaction: TransactionCreate, db: Session = Depends(get_db)):
    return create_transaction(transaction, db)

@app.get("/api/expenses/{expense_id}")
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    return get_transaction(expense_id, db)

@app.put("/api/expenses/{expense_id}")
def update_expense(expense_id: int, transaction: TransactionCreate, db: Session = Depends(get_db)):
    return update_transaction(expense_id, transaction, db)

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    return delete_transaction(expense_id, db)

# Summary endpoints
@app.get("/api/summary/current-month")
def get_current_month_summary(db: Session = Depends(get_db)):
    from datetime import datetime
    now = datetime.now()
    start_date = now.replace(day=1).date()
    
    # Get the basic summary
    basic_summary = get_summary(start_date=start_date, db=db)
    
    # Add the missing fields that frontend expects
    return {
        "year": now.year,
        "month": now.month,
        "total_amount": basic_summary.total_expenses,
        "expense_count": 0,  # Would need to count transactions
        "daily_average": 0,  # Would need to calculate
        "categories": [],  # Empty for now
        "users": []  # Empty for now - fixes the undefined error
    }

if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable for Render
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)