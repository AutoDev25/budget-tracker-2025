import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Category {
  id: number;
  name: string;
  type: string;
  budget_limit?: number;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category_id: number;
  type: string;
  created_at: string;
}

export interface BudgetSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  categories_spending: { [key: string]: number };
}

export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (data: Omit<Category, 'id'>) => api.post<Category>('/categories', data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const transactionApi = {
  getAll: (params?: { start_date?: string; end_date?: string; category_id?: number }) =>
    api.get<Transaction[]>('/transactions', { params }),
  getById: (id: number) => api.get<Transaction>(`/transactions/${id}`),
  create: (data: Omit<Transaction, 'id' | 'created_at'>) =>
    api.post<Transaction>('/transactions', data),
  update: (id: number, data: Omit<Transaction, 'id' | 'created_at'>) =>
    api.put<Transaction>(`/transactions/${id}`, data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
};

export const summaryApi = {
  get: (params?: { start_date?: string; end_date?: string }) =>
    api.get<BudgetSummary>('/summary', { params }),
};

export default api;