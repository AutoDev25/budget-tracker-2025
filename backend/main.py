from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional
import csv
import io

import models, schemas, crud
from database import SessionLocal, engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Budget Tracker 2025 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize default data
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        crud.create_default_categories(db)
        crud.create_default_user(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Budget Tracker 2025 API is running!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# User endpoints
@app.post("/api/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@app.get("/api/users", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/api/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/api/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db=db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.delete_user(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# Category endpoints
@app.post("/api/categories", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db=db, category=category)

@app.get("/api/categories", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories

@app.get("/api/categories/{category_id}", response_model=schemas.Category)
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@app.put("/api/categories/{category_id}", response_model=schemas.Category)
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = crud.update_category(db=db, category_id=category_id, category=category)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.delete_category(db=db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

# Expense endpoints
@app.post("/api/expenses", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    return crud.create_expense(db=db, expense=expense)

@app.get("/api/expenses", response_model=List[schemas.Expense])
def read_expenses(
    skip: int = 0, 
    limit: int = 100,
    user_id: Optional[int] = None,
    category_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    expenses = crud.get_expenses(
        db=db, 
        skip=skip, 
        limit=limit,
        user_id=user_id,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date
    )
    return expenses

@app.get("/api/expenses/{expense_id}", response_model=schemas.Expense)
def read_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = crud.get_expense(db, expense_id=expense_id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@app.put("/api/expenses/{expense_id}", response_model=schemas.Expense)
def update_expense(expense_id: int, expense: schemas.ExpenseUpdate, db: Session = Depends(get_db)):
    db_expense = crud.update_expense(db=db, expense_id=expense_id, expense=expense)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = crud.delete_expense(db=db, expense_id=expense_id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

# Summary endpoints
@app.get("/api/summary/monthly/{year}/{month}", response_model=schemas.MonthlySummary)
def get_monthly_summary(year: int, month: int, db: Session = Depends(get_db)):
    return crud.get_monthly_summary(db=db, year=year, month=month)

@app.get("/api/summary/current-month", response_model=schemas.MonthlySummary)
def get_current_month_summary(db: Session = Depends(get_db)):
    now = datetime.now()
    return crud.get_monthly_summary(db=db, year=now.year, month=now.month)

# CSV Import/Export endpoints
@app.post("/api/import/csv/preview")
async def preview_csv_import(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    csv_data = io.StringIO(content.decode('utf-8'))
    reader = csv.DictReader(csv_data)
    
    valid_rows = []
    error_rows = []
    new_users = set()
    
    # Get existing users and categories
    users = {user.name.lower(): user for user in crud.get_users(db)}
    categories = {cat.name.lower(): cat for cat in crud.get_categories(db)}
    
    for i, row in enumerate(reader):
        try:
            # Validate required fields
            if not all(key in row for key in ['date', 'amount', 'category', 'user']):
                error_rows.append({
                    'row': i + 1,
                    'data': row,
                    'error': 'Missing required columns: date, amount, category, user'
                })
                continue
            
            # Validate date format
            try:
                parsed_date = datetime.strptime(row['date'], '%Y-%m-%d').date()
            except ValueError:
                error_rows.append({
                    'row': i + 1,
                    'data': row,
                    'error': 'Invalid date format. Expected YYYY-MM-DD'
                })
                continue
            
            # Validate amount
            try:
                amount = float(row['amount'])
                if amount <= 0:
                    raise ValueError("Amount must be positive")
            except ValueError:
                error_rows.append({
                    'row': i + 1,
                    'data': row,
                    'error': 'Invalid amount. Must be a positive number'
                })
                continue
            
            # Check if user exists
            user_name = row['user'].strip()
            if user_name.lower() not in users:
                new_users.add(user_name)
            
            # Check if category exists
            category_name = row['category'].strip()
            if category_name.lower() not in categories:
                error_rows.append({
                    'row': i + 1,
                    'data': row,
                    'error': f'Unknown category: {category_name}'
                })
                continue
            
            valid_rows.append({
                'row': i + 1,
                'date': parsed_date.isoformat(),
                'amount': amount,
                'category': category_name,
                'description': row.get('description', '').strip(),
                'user': user_name
            })
            
        except Exception as e:
            error_rows.append({
                'row': i + 1,
                'data': row,
                'error': str(e)
            })
    
    return {
        'valid_rows': valid_rows,
        'error_rows': error_rows,
        'new_users': list(new_users),
        'summary': {
            'total_rows': len(valid_rows) + len(error_rows),
            'valid_count': len(valid_rows),
            'error_count': len(error_rows),
            'new_user_count': len(new_users)
        }
    }

@app.post("/api/import/csv/confirm")
async def confirm_csv_import(import_data: dict, db: Session = Depends(get_db)):
    try:
        created_expenses = []
        
        # Get existing users and categories
        users = {user.name.lower(): user for user in crud.get_users(db)}
        categories = {cat.name.lower(): cat for cat in crud.get_categories(db)}
        
        # Create new users if needed
        for user_name in import_data.get('new_users', []):
            if user_name.lower() not in users:
                new_user = crud.create_user(db, schemas.UserCreate(name=user_name))
                users[user_name.lower()] = new_user
        
        # Create expenses
        for row in import_data.get('valid_rows', []):
            user = users[row['user'].lower()]
            category = categories[row['category'].lower()]
            
            expense = schemas.ExpenseCreate(
                amount=row['amount'],
                description=row['description'],
                date=datetime.strptime(row['date'], '%Y-%m-%d').date(),
                user_id=user.id,
                category_id=category.id
            )
            
            created_expense = crud.create_expense(db, expense)
            created_expenses.append(created_expense)
        
        return {
            'message': f'Successfully imported {len(created_expenses)} expenses',
            'created_count': len(created_expenses)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Import failed: {str(e)}')

@app.get("/api/export/csv")
def export_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    user_id: Optional[int] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    expenses = crud.get_expenses(
        db=db,
        skip=0,
        limit=10000,  # Large limit for export
        user_id=user_id,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date
    )
    
    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['date', 'amount', 'category', 'description', 'user'])
    
    # Write data
    for expense in expenses:
        writer.writerow([
            expense.date.isoformat(),
            expense.amount,
            expense.category.name,
            expense.description or '',
            expense.user.name
        ])
    
    csv_content = output.getvalue()
    output.close()
    
    return {
        'csv_content': csv_content,
        'filename': f'expenses_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
