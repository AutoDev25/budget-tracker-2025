import React, { useState, useEffect } from 'react';
import { userApi, summaryApi, User, UserSummary } from '../services/api';
import { format } from 'date-fns';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userSummaries, setUserSummaries] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#667eea',
  });

  const colors = [
    '#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545', '#f093fb',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, summaryResponse] = await Promise.all([
        userApi.getAll(),
        summaryApi.getCurrentMonth()
      ]);
      
      setUsers(usersResponse.data);
      setUserSummaries(summaryResponse.data.users);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter a user name');
      return;
    }

    try {
      if (editingUser) {
        await userApi.update(editingUser.id, formData);
      } else {
        await userApi.create(formData);
      }
      
      setFormData({ name: '', color: '#667eea' });
      setShowAddForm(false);
      setEditingUser(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to save user:', err);
      setError('Failed to save user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, color: user.color });
    setShowAddForm(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.name}"? This will not delete their expenses.`)) {
      return;
    }

    try {
      await userApi.delete(user.id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user');
    }
  };

  const cancelForm = () => {
    setFormData({ name: '', color: '#667eea' });
    setShowAddForm(false);
    setEditingUser(null);
    setError(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getUserExpenseCount = (userName: string) => {
    const summary = userSummaries.find(u => u.user_name === userName);
    return summary ? summary.expense_count : 0;
  };

  const getUserTotalSpent = (userName: string) => {
    const summary = userSummaries.find(u => u.user_name === userName);
    return summary ? summary.total_amount : 0;
  };

  const getTotalSpending = () => {
    return userSummaries.reduce((sum, user) => sum + user.total_amount, 0);
  };

  const getAverageSpending = () => {
    const total = getTotalSpending();
    return users.length > 0 ? total / users.length : 0;
  };

  const getProgressBar = (percentage: number, width: number = 20) => {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error && !showAddForm) return <div className="error">Error: {error}</div>;

  return (
    <div className="users">
      <div className="section-header">
        &gt; USER MANAGEMENT
      </div>
      
      {error && <div className="error-message">Error: {error}</div>}
      
      <div className="form-section">
        <div className="section-title">─ CURRENT USERS ───────────────────────────────────────────────────</div>
        
        {users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <div className="user-table">
            <div className="table-header">
              <span className="col-id">ID</span>
              <span className="col-name">Name</span>
              <span className="col-color">Color</span>
              <span className="col-expenses">Expenses</span>
              <span className="col-total">Total Spent</span>
              <span className="col-actions">Actions</span>
            </div>
            
            {users.map((user, index) => (
              <div key={user.id} className="user-row">
                <span className="col-id">{String(index + 1).padStart(2, '0')}</span>
                <span className="col-name">{user.name}</span>
                <span className="col-color">
                  <span className="color-indicator" style={{ color: user.color }}>●</span>
                  {user.color}
                </span>
                <span className="col-expenses">{getUserExpenseCount(user.name)}</span>
                <span className="col-total">{formatCurrency(getUserTotalSpent(user.name))}</span>
                <span className="col-actions">
                  [<button 
                    onClick={() => handleEditUser(user)} 
                    className="action-link"
                  >
                    edit
                  </button>] [<button 
                    onClick={() => handleDeleteUser(user)} 
                    className="action-link delete-button"
                  >
                    delete
                  </button>]
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="form-section">
        <div className="section-title">
          ─ {editingUser ? 'EDIT USER' : 'ADD NEW USER'} ────────────────────────────────────────────────────
        </div>
        
        {!showAddForm && !editingUser ? (
          <div className="add-user-prompt">
            <button onClick={() => setShowAddForm(true)} className="primary-button">
              Add New User
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter user name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Color:</label>
                <div className="color-picker">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                    >
                      <span className="color-dot" style={{ color }}>●</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingUser ? 'update user' : 'add user'}
              </button>
              <button type="button" onClick={cancelForm} className="secondary-button">
                cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
      {userSummaries.length > 0 && (
        <div className="form-section">
          <div className="section-title">─ RESPONSIBILITY SUMMARY ──────────────────────────────────────────</div>
          
          <div className="summary-header">
            {format(new Date(), 'MMMM yyyy')} Breakdown:
          </div>
          
          <div className="responsibility-list">
            {userSummaries.map(user => (
              <div key={user.user_name} className="responsibility-row">
                <span className="user-name">{user.user_name}</span>
                <span className="progress-bar">{getProgressBar(user.percentage)}</span>
                <span className="user-amount">{formatCurrency(user.total_amount)} ({Math.round(user.percentage)}%)</span>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div>Total: {formatCurrency(getTotalSpending())}</div>
            <div>Average: {formatCurrency(getAverageSpending())} per person</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;