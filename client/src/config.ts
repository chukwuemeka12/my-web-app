// API configuration
export const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.VITE_API_URL || 'https://your-backend-url.herokuapp.com'
  : 'http://localhost:5000';
