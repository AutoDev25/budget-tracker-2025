import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseApi, userApi, categoryApi, User, Category, CreateExpenseData } from '../services/api';
import { format } from 'date-fns';

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Get local date string to avoid timezone issues
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    date: getLocalDateString(),
    description: '',
    user_id: '',
  });

  useEffect(() => {
    fetchFormData();
  }, []);

  const updateDefaultCategory = (categoriesList: Category[]) => {
    const defaultCategory = categoriesList.find(cat => cat.name.toLowerCase() === 'food');
    
    if (defaultCategory) {
      setFormData(prev => ({ ...prev, category_id: defaultCategory.id.toString() }));
    }
  };

  const fetchFormData = async () => {
    try {
      const [usersResponse, categoriesResponse] = await Promise.all([
        userApi.getAll(),
        categoryApi.getAll()
      ]);
      
      setUsers(usersResponse.data);
      setCategories(categoriesResponse.data);
      
      // Set default user if only one exists
      if (usersResponse.data.length === 1) {
        setFormData(prev => ({ ...prev, user_id: usersResponse.data[0].id.toString() }));
      }
      
      // Set default category
      updateDefaultCategory(categoriesResponse.data);
    } catch (err) {
      console.error('Failed to fetch form data:', err);
      setError('Failed to load form data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category_id || !formData.user_id) {
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
      
      const expenseData: CreateExpenseData = {
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id),
        date: formData.date,
        description: formData.description || undefined,
        user_id: parseInt(formData.user_id),
      };

      await expenseApi.create(expenseData);
      navigate('/');
    } catch (err) {
      console.error('Failed to create expense:', err);
      setError('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndAddAnother = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category_id || !formData.user_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const expenseData: CreateExpenseData = {
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id),
        date: formData.date,
        description: formData.description || undefined,
        user_id: parseInt(formData.user_id),
      };

      await expenseApi.create(expenseData);
      
      // Reset form but keep user and use today's date
      setFormData(prev => ({
        ...prev,
        amount: '',
        category_id: '',
        description: '',
        date: getLocalDateString(),
      }));
    } catch (err) {
      console.error('Failed to create expense:', err);
      setError('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCategories = () => {
    return categories;
  };

  const getPreviewText = () => {
    if (!formData.amount || !formData.category_id || !formData.user_id) return '';
    
    const selectedCategory = categories.find(cat => cat.id.toString() === formData.category_id);
    const selectedUser = users.find(user => user.id.toString() === formData.user_id);
    
    if (!selectedCategory || !selectedUser) return '';
    
    return `$${formData.amount} | ${selectedCategory.name} | ${formData.date} | @${selectedUser.name} | ${formData.description || 'No description'}`;
  };

  return (
    <div className="add-expense">
      <div className="section-header">
        &gt; ADD NEW EXPENSE
      </div>
      
      {error && <div className="error-message">Error: {error}</div>}
      
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
                {getFilteredCategories().map(category => (
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
            {loading ? 'Saving...' : 'save'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="secondary-button">
            cancel
          </button>
          <button 
            type="button" 
            onClick={handleSaveAndAddAnother} 
            disabled={loading}
            className="secondary-button"
          >
            {loading ? 'Saving...' : 'save & add another'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;