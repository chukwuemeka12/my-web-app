// API configuration
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://chi-dashboard-app.herokuapp.com'
  : 'http://localhost:5000';
