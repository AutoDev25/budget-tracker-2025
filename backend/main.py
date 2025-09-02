from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import uvicorn
from decimal import Decimal

app = FastAPI(title="Budget Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///./budget.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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

Base.metadata.create_all(bind=engine)

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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Budget Tracker API", "version": "1.0.0"}

@app.post("/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate):
    db = next(get_db())
    try:
        db_category = Category(**category.dict())
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
    finally:
        db.close()

@app.get("/categories", response_model=List[CategoryResponse])
def get_categories():
    db = next(get_db())
    try:
        categories = db.query(Category).all()
        return categories
    finally:
        db.close()

@app.delete("/categories/{category_id}")
def delete_category(category_id: int):
    db = next(get_db())
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        db.delete(category)
        db.commit()
        return {"message": "Category deleted successfully"}
    finally:
        db.close()

@app.post("/transactions", response_model=TransactionResponse)
def create_transaction(transaction: TransactionCreate):
    db = next(get_db())
    try:
        db_transaction = Transaction(**transaction.dict())
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    finally:
        db.close()

@app.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None
):
    db = next(get_db())
    try:
        query = db.query(Transaction)
        
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        if category_id:
            query = query.filter(Transaction.category_id == category_id)
        
        transactions = query.order_by(Transaction.date.desc()).all()
        return transactions
    finally:
        db.close()

@app.get("/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int):
    db = next(get_db())
    try:
        transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction
    finally:
        db.close()

@app.put("/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(transaction_id: int, transaction: TransactionCreate):
    db = next(get_db())
    try:
        db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not db_transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        for key, value in transaction.dict().items():
            setattr(db_transaction, key, value)
        
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    finally:
        db.close()

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int):
    db = next(get_db())
    try:
        transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        db.delete(transaction)
        db.commit()
        return {"message": "Transaction deleted successfully"}
    finally:
        db.close()

@app.get("/summary", response_model=BudgetSummary)
def get_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    db = next(get_db())
    try:
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
    finally:
        db.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)