import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { summaryApi, expenseApi, MonthlySummary, Expense } from '../services/api';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryResponse, expensesResponse] = await Promise.all([
        summaryApi.getCurrentMonth(),
        expenseApi.getAll({ limit: 5 })
      ]);
      
      setSummary(summaryResponse.data);
      setRecentExpenses(expensesResponse.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  const getProgressBar = (percentage: number, width: number = 20) => {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!summary) return <div className="error">No data available</div>;

  const currentMonth = format(new Date(), 'MMMM yyyy');
  const budgetTotal = 4000; // Default budget
  const budgetRemaining = budgetTotal - summary.total_amount;
  const budgetUsedPercentage = (summary.total_amount / budgetTotal) * 100;

  return (
    <div className="dashboard">
      <div className="section-header">
        &gt; BUDGET DASHBOARD - {currentMonth}
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-section quick-stats">
          <div className="section-title">─ QUICK STATS ─────────────────────────</div>
          <div className="stat-line">Total Spent: {formatCurrency(summary.total_amount)}</div>
          <div className="stat-line">Budget Remaining: {formatCurrency(budgetRemaining)}</div>
          <div className="stat-line">Daily Average: {formatCurrency(summary.daily_average)}</div>
          <div className="stat-line"></div>
          <div className="progress-line">
            [{getProgressBar(budgetUsedPercentage)}] {Math.round(budgetUsedPercentage)}% used
          </div>
        </div>

        <div className="dashboard-section recent-expenses">
          <div className="section-title">─ RECENT EXPENSES ─────────</div>
          {recentExpenses.length === 0 ? (
            <div className="empty-state">No expenses yet</div>
          ) : (
            recentExpenses.map((expense) => (
              <div key={expense.id} className="expense-row">
                <span className="expense-date">{formatDate(expense.date)}</span>
                <span className="expense-category">| {expense.category.name}</span>
                <span className="expense-amount">| {formatCurrency(expense.amount)}</span>
                <div className="expense-details">
                  <span className="expense-user">| @{expense.user.name}</span>
                  <span className="expense-description">| {expense.description || 'No description'}</span>
                </div>
              </div>
            ))
          )}
          <div className="section-actions">
            [<Link to="/expenses" className="action-link">show all</Link>] [<Link to="/expenses/add" className="action-link">add expense</Link>]
          </div>
        </div>

        <div className="dashboard-section user-breakdown">
          <div className="section-title">─ USER BREAKDOWN ──────────────────</div>
          {summary.users.length === 0 ? (
            <div className="empty-state">No expense data</div>
          ) : (
            summary.users.map((user) => (
              <div key={user.user_name} className="user-row">
                <span className="user-name">{user.user_name}:</span>
                <span className="user-amount">{formatCurrency(user.total_amount)} ({Math.round(user.percentage)}%)</span>
              </div>
            ))
          )}
          <div className="section-actions">
            [<Link to="/users" className="action-link">view details</Link>] [<span className="action-link disabled">settle up</span>]
          </div>
        </div>

        <div className="dashboard-section category-breakdown">
          <div className="section-title">─ CATEGORY BREAKDOWN ─────────────────────────────────────────────────</div>
          {summary.categories.length === 0 ? (
            <div className="empty-state">No expense data</div>
          ) : (
            summary.categories.map((category) => (
              <div key={category.category_name} className="category-row">
                <span className="category-name">{category.category_name}</span>
                <span className="category-progress">{getProgressBar(category.percentage, 15)}</span>
                <span className="category-amount">{formatCurrency(category.total_amount)} ({Math.round(category.percentage)}%)</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;