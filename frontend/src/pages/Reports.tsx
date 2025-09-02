import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { summaryApi, MonthlySummary } from '../services/api';
import { format, subMonths } from 'date-fns';

interface MonthlyData {
  month: string;
  amount: number;
}

const Reports: React.FC = () => {
  const [currentSummary, setCurrentSummary] = useState<MonthlySummary | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Get current month summary
      const currentResponse = await summaryApi.getCurrentMonth();
      setCurrentSummary(currentResponse.data);
      
      // Fetch last 6 months of data for trends
      const trends: MonthlyData[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth() + 1;
        
        try {
          const response = await summaryApi.getMonthly(year, month);
          trends.push({
            month: format(monthDate, 'MMM'),
            amount: response.data.total_amount
          });
        } catch {
          trends.push({
            month: format(monthDate, 'MMM'),
            amount: 0
          });
        }
      }
      
      setMonthlyTrends(trends);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setError('Failed to load report data');
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

  const getProgressBar = (percentage: number, width: number = 20) => {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  const renderSpendingChart = () => {
    if (monthlyTrends.length === 0) return null;
    
    const maxAmount = Math.max(...monthlyTrends.map(t => t.amount), 3000);
    const chartHeight = 10;
    const chartWidth = 60;
    
    // Create ASCII chart
    const chart: string[] = [];
    
    // Y-axis labels
    const yLabels = [3000, 2500, 2000, 1500, 1000];
    
    for (let row = 0; row < chartHeight; row++) {
      let line = '';
      
      // Add Y-axis label
      if (row % 2 === 0) {
        const labelIndex = Math.floor(row / 2);
        if (labelIndex < yLabels.length) {
          line = `     $${yLabels[labelIndex]} ┤`;
        } else {
          line = '           │';
        }
      } else {
        line = '           │';
      }
      
      // Add chart content
      const threshold = maxAmount - (row * maxAmount / chartHeight);
      
      for (let col = 0; col < monthlyTrends.length; col++) {
        const xPos = Math.floor((col / (monthlyTrends.length - 1)) * (chartWidth - line.length - 10));
        const spaces = ' '.repeat(Math.max(0, xPos));
        
        if (monthlyTrends[col].amount >= threshold && monthlyTrends[col].amount >= threshold - (maxAmount / chartHeight)) {
          // Draw point
          if (row === Math.floor((1 - monthlyTrends[col].amount / maxAmount) * chartHeight)) {
            line += spaces + '●';
          } else if (col > 0 && row > Math.floor((1 - monthlyTrends[col].amount / maxAmount) * chartHeight) && 
                     row < Math.floor((1 - monthlyTrends[col - 1].amount / maxAmount) * chartHeight)) {
            // Draw connecting line
            line += spaces + '╱';
          } else if (col < monthlyTrends.length - 1 && 
                     row < Math.floor((1 - monthlyTrends[col].amount / maxAmount) * chartHeight) && 
                     row > Math.floor((1 - monthlyTrends[col + 1].amount / maxAmount) * chartHeight)) {
            line += spaces + '╲';
          }
        }
      }
      
      chart.push(line);
    }
    
    // Add X-axis
    chart.push('           └─────┬─────┬─────┬─────┬─────┬─────');
    const xLabels = '               ' + monthlyTrends.map(t => t.month).join('   ');
    chart.push(xLabels);
    
    return chart.map((line, i) => <div key={i}>{line}</div>);
  };

  const getUserComparison = () => {
    if (!currentSummary || currentSummary.users.length < 2) return null;
    
    const [user1, user2] = currentSummary.users;
    const difference = Math.abs(user1.total_amount - user2.total_amount);
    const higherSpender = user1.total_amount > user2.total_amount ? user1 : user2;
    const percentMore = ((difference / Math.min(user1.total_amount, user2.total_amount)) * 100).toFixed(0);
    
    return {
      user1,
      user2,
      difference,
      higherSpender,
      percentMore
    };
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!currentSummary) return <div className="error">No data available</div>;

  const currentMonth = format(new Date(), 'MMMM yyyy');
  const comparison = getUserComparison();

  return (
    <div className="reports">
      <div className="section-header">
        &gt; MONTHLY REPORTS - {currentMonth}
      </div>
      
      <div className="form-section">
        <div className="section-title">─ SPENDING TRENDS ──────────────────────────────────────────────────</div>
        <div className="chart-container">
          {monthlyTrends.length > 0 ? (
            <pre className="ascii-chart">{renderSpendingChart()}</pre>
          ) : (
            <div className="empty-state">No trend data available</div>
          )}
        </div>
      </div>
      
      <div className="form-section">
        <div className="section-title">─ TOP CATEGORIES ───────────────────────────────────────────────────</div>
        {currentSummary.categories.length === 0 ? (
          <div className="empty-state">No expense data</div>
        ) : (
          currentSummary.categories.slice(0, 5).map((category, index) => (
            <div key={category.category_name} className="category-report-row">
              <span className="category-rank">{index + 1}.</span>
              <span className="category-name">{category.category_name}</span>
              <span className="category-progress">{getProgressBar(category.percentage)}</span>
              <span className="category-amount">{formatCurrency(category.total_amount)} ({Math.round(category.percentage)}%)</span>
            </div>
          ))
        )}
      </div>
      
      {comparison && (
        <div className="form-section">
          <div className="section-title">─ USER COMPARISON ──────────────────────────────────────────────────</div>
          <div className="user-comparison">
            <div className="comparison-row">
              <span className="user-label">@{comparison.user1.user_name}:</span>
              <span className="user-amount">{formatCurrency(comparison.user1.total_amount)}</span>
              <span className="user-bar">{getProgressBar(comparison.user1.percentage, 30)}</span>
              <span className="user-percent">({Math.round(comparison.user1.percentage)}%)</span>
            </div>
            <div className="comparison-row">
              <span className="user-label">@{comparison.user2.user_name}:</span>
              <span className="user-amount">{formatCurrency(comparison.user2.total_amount)}</span>
              <span className="user-bar">{getProgressBar(comparison.user2.percentage, 30)}</span>
              <span className="user-percent">({Math.round(comparison.user2.percentage)}%)</span>
            </div>
            <div className="comparison-summary">
              <div>Difference: {formatCurrency(comparison.difference)} ({comparison.higherSpender.user_name} spent {comparison.percentMore}% more)</div>
              <div>Shared expenses: {formatCurrency(0)}</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="report-actions">
        <button className="primary-button" onClick={() => window.print()}>
          export report
        </button>
        <button className="secondary-button" disabled>
          previous month
        </button>
        <Link to="/" className="secondary-button">
          dashboard
        </Link>
        <button className="secondary-button" disabled>
          settings
        </button>
      </div>
    </div>
  );
};

export default Reports;