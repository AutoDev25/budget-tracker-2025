import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  is_default: number;
  created_at: string;
}

export interface Expense {
  id: number;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
  user_id: number;
  category_id: number;
  user: User;
  category: Category;
}

export interface CategorySummary {
  category_name: string;
  category_color: string;
  total_amount: number;
  expense_count: number;
  percentage: number;
}

export interface UserSummary {
  user_name: string;
  user_color: string;
  total_amount: number;
  expense_count: number;
  percentage: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  total_amount: number;
  expense_count: number;
  daily_average: number;
  categories: CategorySummary[];
  users: UserSummary[];
}

export interface CreateExpenseData {
  amount: number;
  description?: string;
  date: string;
  user_id: number;
  category_id: number;
}

export interface CreateUserData {
  name: string;
  color?: string;
}

export interface CreateCategoryData {
  name: string;
  color?: string;
  is_default?: number;
}

// User API
export const userApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserData) => api.post<User>('/users', data),
  update: (id: number, data: Partial<CreateUserData>) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Category API
export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories'),
  getById: (id: number) => api.get<Category>(`/categories/${id}`),
  create: (data: CreateCategoryData) => api.post<Category>('/categories', data),
  update: (id: number, data: CreateCategoryData) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Expense API
export const expenseApi = {
  getAll: (params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
    category_id?: number;
    start_date?: string;
    end_date?: string;
  }) => api.get<Expense[]>('/expenses', { params }),
  getById: (id: number) => api.get<Expense>(`/expenses/${id}`),
  create: (data: CreateExpenseData) => api.post<Expense>('/expenses', data),
  update: (id: number, data: Partial<CreateExpenseData>) => api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};

// Summary API
export const summaryApi = {
  getMonthly: (year: number, month: number) => api.get<MonthlySummary>(`/summary/monthly/${year}/${month}`),
  getCurrentMonth: () => api.get<MonthlySummary>('/summary/current-month'),
};

// CSV Import/Export API
export const csvApi = {
  previewImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/csv/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  confirmImport: (data: any) => api.post('/import/csv/confirm', data),
  export: (params?: {
    start_date?: string;
    end_date?: string;
    user_id?: number;
    category_id?: number;
  }) => api.get('/export/csv', { params }),
};

export default api;