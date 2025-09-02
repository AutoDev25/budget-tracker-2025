import React, { useState, useEffect } from 'react';
import type { Transaction, Category } from '../api/api';
import { transactionApi } from '../api/api';

interface TransactionFormProps {
  transaction: Transaction | null;
  categories: Category[];
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  categories,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: 0,
    type: 'expense',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        date: transaction.date,
        category_id: transaction.category_id,
        type: transaction.type,
      });
    }
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category_id) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id.toString()),
      };

      if (transaction) {
        await transactionApi.update(transaction.id, data);
      } else {
        await transactionApi.create(data);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value={0}>Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;