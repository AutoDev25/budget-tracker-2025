// API Configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://budget-tracker-api.onrender.com/api'
  : 'http://localhost:8000/api';

export { API_BASE_URL };