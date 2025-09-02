import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { expenseApi, Expense } from '../services/api';
import { format } from 'date-fns';

const ExpenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [relatedExpenses, setRelatedExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchExpenseDetail();
    }
  }, [id]);

  const fetchExpenseDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const expenseResponse = await expenseApi.getById(parseInt(id));
      setExpense(expenseResponse.data);
      
      // Get related expenses in the same category for the same month
      const expenseDate = new Date(expenseResponse.data.date);
      const startOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);
      const endOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 0);
      
      const relatedResponse = await expenseApi.getAll({
        category_id: expenseResponse.data.category_id,
        start_date: format(startOfMonth, 'yyyy-MM-dd'),
        end_date: format(endOfMonth, 'yyyy-MM-dd'),
        limit: 10
      });
      
      // Filter out the current expense and limit to 5 related ones
      const filtered = relatedResponse.data
        .filter(exp => exp.id !== expenseResponse.data.id)
        .slice(0, 5);
      
      setRelatedExpenses(filtered);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch expense detail:', err);
      setError('Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expense || !id) return;
    
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseApi.delete(parseInt(id));
      navigate('/expenses');
    } catch (err) {
      console.error('Failed to delete expense:', err);
      setError('Failed to delete expense');
    }
  };

  const handleDuplicate = () => {
    if (!expense) return;
    
    // Navigate to add expense page with pre-filled data
    const params = new URLSearchParams({
      amount: expense.amount.toString(),
      category_id: expense.category_id.toString(),
      description: expense.description || '',
      user_id: expense.user_id.toString(),
    });
    
    navigate(`/expenses/add?${params.toString()}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const formatDateTime = (dateTimeString: string) => {
    return format(new Date(dateTimeString), 'yyyy-MM-dd HH:mm:ss');
  };

  const getCategoryTotal = () => {
    if (!expense || relatedExpenses.length === 0) return 0;
    
    const total = relatedExpenses.reduce((sum, exp) => sum + exp.amount, 0) + expense.amount;
    return total;
  };

  if (loading) return <div className="loading">Loading expense details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!expense) return <div className="error">Expense not found</div>;

  return (
    <div className="expense-detail">
      <div className="section-header">
        &gt; EXPENSE DETAILS
      </div>
      
      <div className="form-section">
        <div className="section-title">─ EXPENSE #{expense.id.toString().padStart(6, '0')} ──────────────────────────────────────────────────</div>
        
        <div className="detail-info">
          <div className="detail-row">
            <span className="detail-label">Amount:</span>
            <span className="detail-value expense-amount">
              {formatCurrency(expense.amount)}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">
              <span 
                className="category-indicator" 
                style={{ color: expense.category.color }}
              >
                ●
              </span>
              {expense.category.name}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{formatDate(expense.date)}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Description:</span>
            <span className="detail-value">{expense.description || 'No description'}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Assigned to:</span>
            <span className="detail-value">@{expense.user.name}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Created:</span>
            <span className="detail-value">{formatDateTime(expense.created_at)}</span>
          </div>
          
          {expense.updated_at && (
            <div className="detail-row">
              <span className="detail-label">Modified:</span>
              <span className="detail-value">{formatDateTime(expense.updated_at)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="form-section">
        <div className="section-title">─ ACTIONS ──────────────────────────────────────────────────────────</div>
        <div className="detail-actions">
          <Link to={`/expenses/edit/${expense.id}`} className="primary-button">
            edit expense
          </Link>
          <button onClick={handleDelete} className="secondary-button delete-button">
            delete expense
          </button>
          <button onClick={handleDuplicate} className="secondary-button">
            duplicate
          </button>
          <button className="secondary-button" disabled>
            reassign user
          </button>
        </div>
      </div>
      
      {relatedExpenses.length > 0 && (
        <div className="form-section">
          <div className="section-title">─ RELATED EXPENSES ─────────────────────────────────────────────────</div>
          <div className="related-header">
            Other {expense.category.name} expenses this month:
          </div>
          
          <div className="related-list">
            {relatedExpenses.map((relatedExp) => (
              <div key={relatedExp.id} className="related-expense">
                <span className="related-date">{format(new Date(relatedExp.date), 'MM/dd')}</span>
                <span className="related-separator">|</span>
                <span className="related-amount">{formatCurrency(relatedExp.amount)}</span>
                <span className="related-separator">|</span>
                <span className="related-description">{relatedExp.description || 'No description'}</span>
                <span className="related-separator">|</span>
                <span className="related-user">@{relatedExp.user.name}</span>
              </div>
            ))}
          </div>
          
          <div className="category-total">
            Category total: {formatCurrency(getCategoryTotal())}
          </div>
        </div>
      )}
      
      <div className="navigation-actions">
        <Link to="/expenses" className="secondary-button">back</Link>
        <Link to={`/expenses/edit/${expense.id}`} className="secondary-button">edit</Link>
        <button onClick={handleDelete} className="secondary-button delete-button">delete</button>
        <Link to="/" className="secondary-button">dashboard</Link>
      </div>
    </div>
  );
};

export default ExpenseDetail;