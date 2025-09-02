import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expenseApi, userApi, categoryApi, Expense, User, Category } from '../services/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState({
    user_id: '',
    category_id: '',
  });

  useEffect(() => {
    fetchData();
  }, [currentDate, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      
      const params = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        user_id: filters.user_id ? parseInt(filters.user_id) : undefined,
        category_id: filters.category_id ? parseInt(filters.category_id) : undefined,
        limit: 100,
      };

      const [expensesResponse, usersResponse, categoriesResponse] = await Promise.all([
        expenseApi.getAll(params),
        userApi.getAll(),
        categoryApi.getAll()
      ]);
      
      setExpenses(expensesResponse.data);
      setUsers(usersResponse.data);
      setCategories(categoriesResponse.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseApi.delete(id);
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (err) {
      console.error('Failed to delete expense:', err);
      setError('Failed to delete expense');
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MM/dd');
  };

  const getCurrentMonthName = () => {
    return format(currentDate, 'MMMM yyyy').toUpperCase();
  };

  const getPreviousMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(currentDate.getMonth() - 1);
    return format(prev, 'MMM');
  };

  const getNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(currentDate.getMonth() + 1);
    return format(next, 'MMM');
  };

  const getTotalAmount = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getAverageAmount = () => {
    return expenses.length > 0 ? getTotalAmount() / expenses.length : 0;
  };

  if (loading) return <div className="loading">Loading expenses...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="expense-list">
      <div className="section-header">
        &gt; {getCurrentMonthName()} EXPENSES
      </div>
      
      <div className="form-section">
        <div className="section-title">─ NAVIGATION ───────────────────────────────────────────────────────</div>
        <div className="navigation-controls">
          <button onClick={() => navigateMonth(-1)} className="nav-button">
            ◄ {getPreviousMonth()}
          </button>
          <span className="current-month">{getCurrentMonthName()}</span>
          <button onClick={() => navigateMonth(1)} className="nav-button">
            {getNextMonth()} ►
          </button>
          
          <div className="filters">
            <label>Filter:</label>
            <select 
              value={filters.user_id} 
              onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>@{user.name}</option>
              ))}
            </select>
            
            <select 
              value={filters.category_id} 
              onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <div className="section-title">─ EXPENSE LIST ────────────────────────────────────────────────────</div>
        
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div>No expenses found for this period.</div>
            <div>[<Link to="/expenses/add" className="action-link">add expense</Link>]</div>
          </div>
        ) : (
          <>
            <div className="expense-table">
              <div className="table-header">
                <span className="col-date">DATE</span>
                <span className="col-category">CATEGORY</span>
                <span className="col-description">DESCRIPTION</span>
                <span className="col-user">USER</span>
                <span className="col-amount">AMOUNT</span>
                <span className="col-actions">⚙</span>
              </div>
              
              {expenses.map((expense) => (
                <div key={expense.id} className="expense-row">
                  <Link to={`/expenses/${expense.id}`} className="col-date expense-link">{formatDate(expense.date)}</Link>
                  <Link to={`/expenses/${expense.id}`} className="col-category expense-link">
                    <span 
                      className="category-indicator" 
                      style={{ color: expense.category.color }}
                    >
                      ●
                    </span>
                    {expense.category.name}
                  </Link>
                  <Link to={`/expenses/${expense.id}`} className="col-description expense-link">{expense.description || 'No description'}</Link>
                  <Link to={`/expenses/${expense.id}`} className="col-user expense-link">@{expense.user.name}</Link>
                  <Link to={`/expenses/${expense.id}`} className="col-amount expense-link">
                    {formatCurrency(expense.amount)}
                  </Link>
                  <span className="col-actions">
                    [<Link to={`/expenses/edit/${expense.id}`} className="action-link">E</Link>]
                    [<button 
                      onClick={() => handleDeleteExpense(expense.id)} 
                      className="action-link delete-button"
                    >
                      D
                    </button>]
                  </span>
                </div>
              ))}
            </div>
            
            <div className="table-actions">
              [<span className="action-link disabled">load more</span>] 
              [<Link to="/expenses/add" className="action-link">add expense</Link>] 
              [<span className="action-link disabled">bulk actions</span>]
            </div>
          </>
        )}
      </div>
      
      <div className="form-section">
        <div className="section-title">─ MONTH SUMMARY ───────────────────────────────────────────────────</div>
        <div className="summary-line">
          Total: {formatCurrency(getTotalAmount())} | Transactions: {expenses.length} | Avg: {formatCurrency(getAverageAmount())} per expense
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;