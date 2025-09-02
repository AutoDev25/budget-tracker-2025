from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

# User schemas
class UserBase(BaseModel):
    name: str
    color: Optional[str] = "#667eea"

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Category schemas
class CategoryBase(BaseModel):
    name: str
    color: Optional[str] = "#667eea"

class CategoryCreate(CategoryBase):
    is_default: Optional[int] = 0

class Category(CategoryBase):
    id: int
    is_default: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Expense schemas
class ExpenseBase(BaseModel):
    amount: float
    description: Optional[str] = None
    date: date
    user_id: int
    category_id: int

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[date] = None
    user_id: Optional[int] = None
    category_id: Optional[int] = None

class Expense(ExpenseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: User
    category: Category
    
    class Config:
        from_attributes = True

# CSV Import schemas
class CSVRow(BaseModel):
    date: str
    amount: str
    category: str
    description: Optional[str] = None
    user: str

class ImportPreview(BaseModel):
    valid_rows: List[dict]
    error_rows: List[dict]
    new_users: List[str]
    summary: dict

# Dashboard/Summary schemas
class CategorySummary(BaseModel):
    category_name: str
    category_color: str
    total_amount: float
    expense_count: int
    percentage: float

class UserSummary(BaseModel):
    user_name: str
    user_color: str
    total_amount: float
    expense_count: int
    percentage: float

class MonthlySummary(BaseModel):
    year: int
    month: int
    total_amount: float
    expense_count: int
    daily_average: float
    categories: List[CategorySummary]
    users: List[UserSummary]