import React, { useState, useEffect } from 'react';
import type { Transaction, Category } from '../api/api';
import { transactionApi, categoryApi } from '../api/api';
import TransactionForm from './TransactionForm';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState({
    start_date: '',
    end_date: '',
    category_id: 0,
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        ...(filter.start_date && { start_date: filter.start_date }),
        ...(filter.end_date && { end_date: filter.end_date }),
        ...(filter.category_id > 0 && { category_id: filter.category_id }),
      };
      const response = await transactionApi.getAll(params);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionApi.delete(id);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
    fetchTransactions();
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: name === 'category_id' ? parseInt(value) : value });
  };

  const handleFilterSubmit = () => {
    fetchTransactions();
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="transaction-list">
      <div className="header">
        <h2>Transactions</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add Transaction
        </button>
      </div>

      <div className="filters">
        <input
          type="date"
          name="start_date"
          value={filter.start_date}
          onChange={handleFilterChange}
          placeholder="Start Date"
        />
        <input
          type="date"
          name="end_date"
          value={filter.end_date}
          onChange={handleFilterChange}
          placeholder="End Date"
        />
        <select
          name="category_id"
          value={filter.category_id}
          onChange={handleFilterChange}
        >
          <option value={0}>All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button onClick={handleFilterSubmit}>Filter</button>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          categories={categories}
          onClose={handleFormClose}
        />
      )}

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.description}</td>
                <td>{getCategoryName(transaction.category_id)}</td>
                <td>
                  <span className={`type-badge ${transaction.type}`}>
                    {transaction.type}
                  </span>
                </td>
                <td className={transaction.type === 'income' ? 'income' : 'expense'}>
                  ${transaction.amount.toFixed(2)}
                </td>
                <td>
                  <button
                    className="btn-small"
                    onClick={() => handleEdit(transaction)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;