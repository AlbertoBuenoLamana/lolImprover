import axios from 'axios';

// Configure axios with base URL and default headers
const instance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure axios follows redirects automatically
  maxRedirects: 5,
  validateStatus: status => status < 400
});

// Add a request interceptor to include the auth token in requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Using token for request:', config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized request. Token may be invalid or expired.', error.config?.url);
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
