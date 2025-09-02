import React, { useState, useEffect } from 'react';
import type { Category } from '../api/api';
import { categoryApi } from '../api/api';

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    budget_limit: '',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please enter a category name');
      return;
    }

    try {
      const data = {
        name: formData.name,
        type: formData.type,
        budget_limit: formData.budget_limit ? parseFloat(formData.budget_limit) : undefined,
      };
      
      await categoryApi.create(data);
      setFormData({ name: '', type: 'expense', budget_limit: '' });
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryApi.delete(id);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="category-manager">
      <div className="header">
        <h2>Categories</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="category-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Category Name"
                required
              />
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <input
                type="number"
                name="budget_limit"
                value={formData.budget_limit}
                onChange={handleChange}
                placeholder="Budget Limit (optional)"
                step="0.01"
                min="0"
              />
              <button type="submit">Add</button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-header">
              <h4>{category.name}</h4>
              <span className={`type-badge ${category.type}`}>
                {category.type}
              </span>
            </div>
            {category.budget_limit && (
              <p className="budget-limit">
                Budget: ${category.budget_limit.toFixed(2)}
              </p>
            )}
            <button
              className="btn-small btn-danger"
              onClick={() => handleDelete(category.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;