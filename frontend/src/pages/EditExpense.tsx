import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { expenseApi, userApi, categoryApi, User, Category } from '../services/api';

const EditExpense: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    date: '',
    description: '',
    user_id: '',
  });

  useEffect(() => {
    if (id) {
      fetchExpenseData();
    }
  }, [id]);

  const fetchExpenseData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [expenseResponse, usersResponse, categoriesResponse] = await Promise.all([
        expenseApi.getById(parseInt(id)),
        userApi.getAll(),
        categoryApi.getAll()
      ]);
      
      const expense = expenseResponse.data;
      setFormData({
        amount: expense.amount.toString(),
        category_id: expense.category_id.toString(),
        date: expense.date,
        description: expense.description || '',
        user_id: expense.user_id.toString(),
      });
      
      setUsers(usersResponse.data);
      setCategories(categoriesResponse.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch expense data:', err);
      setError('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !formData.amount || !formData.category_id || !formData.user_id) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id),
        date: formData.date,
        description: formData.description || undefined,
        user_id: parseInt(formData.user_id),
      };

      await expenseApi.update(parseInt(id), updateData);
      navigate('/expenses');
    } catch (err) {
      console.error('Failed to update expense:', err);
      setError('Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewText = () => {
    if (!formData.amount || !formData.category_id || !formData.user_id) return '';
    
    const selectedCategory = categories.find(cat => cat.id.toString() === formData.category_id);
    const selectedUser = users.find(user => user.id.toString() === formData.user_id);
    
    if (!selectedCategory || !selectedUser) return '';
    
    return `$${formData.amount} | ${selectedCategory.name} | ${formData.date} | @${selectedUser.name} | ${formData.description || 'No description'}`;
  };

  if (!id) {
    return <div className="error">Invalid expense ID</div>;
  }

  return (
    <div className="edit-expense">
      <div className="section-header">
        &gt; EDIT EXPENSE #{id}
      </div>
      
      {error && <div className="error-message">Error: {error}</div>}
      
      {loading && formData.amount === '' ? (
        <div className="loading">Loading expense data...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="section-title">─ EXPENSE DETAILS ──────────────────────────────────────────────────</div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="amount">Amount: $</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category_id">Category:</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Date:</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="user_id">Assigned to:</label>
                <select
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      @{user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {getPreviewText() && (
            <div className="form-section">
              <div className="section-title">─ PREVIEW ─────────────────────────────────────────────────────────</div>
              <div className="preview-text">{getPreviewText()}</div>
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? 'Updating...' : 'update'}
            </button>
            <button type="button" onClick={() => navigate('/expenses')} className="secondary-button">
              cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditExpense;