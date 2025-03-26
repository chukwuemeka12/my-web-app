// API configuration
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://1c1b1750-b456-4de3-b215-884e58fd75ee.herokuapp.com'
  : 'http://localhost:5000';
