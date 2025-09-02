import React, { useState, useEffect } from 'react';
import type { BudgetSummary } from '../api/api';
import { summaryApi } from '../api/api';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  });

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const params = dateRange.start_date || dateRange.end_date ? dateRange : undefined;
      const response = await summaryApi.get(params);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleFilter = () => {
    fetchSummary();
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!summary) return <div>No data available</div>;

  return (
    <div className="dashboard">
      <h2>Budget Dashboard</h2>
      
      <div className="date-filter">
        <input
          type="date"
          name="start_date"
          value={dateRange.start_date}
          onChange={handleDateChange}
          placeholder="Start Date"
        />
        <input
          type="date"
          name="end_date"
          value={dateRange.end_date}
          onChange={handleDateChange}
          placeholder="End Date"
        />
        <button onClick={handleFilter}>Filter</button>
      </div>

      <div className="summary-cards">
        <div className="card income">
          <h3>Total Income</h3>
          <p className="amount">${summary.total_income.toFixed(2)}</p>
        </div>
        <div className="card expense">
          <h3>Total Expenses</h3>
          <p className="amount">${summary.total_expenses.toFixed(2)}</p>
        </div>
        <div className="card balance">
          <h3>Balance</h3>
          <p className={`amount ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
            ${summary.balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="categories-spending">
        <h3>Spending by Category</h3>
        <div className="category-list">
          {Object.entries(summary.categories_spending).map(([category, amount]) => (
            <div key={category} className="category-item">
              <span className="category-name">{category}</span>
              <span className="category-amount">${amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;