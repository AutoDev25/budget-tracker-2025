// API Configuration
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://budget-tracker-api.onrender.com/api'  // Update this with your actual API URL
  : 'http://localhost:8000/api';

export { API_BASE_URL };