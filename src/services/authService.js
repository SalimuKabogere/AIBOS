import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Don't add auth headers to login/register endpoints
    if (config.url.includes('/login/') || config.url.includes('/register/')) {
      console.log('Skipping auth header for:', config.url);
      return config;
    }
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('No access token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('401 Unauthorized - clearing tokens and redirecting to login');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Don't redirect here, let the component handle it
    }
    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('Attempting registration with:', userData);
      const response = await api.post('/register/', userData);
      console.log('Registration response:', response.data);
      
      // Store tokens
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Registration error details:', error.response || error);
      if (error.response && error.response.data) {
        throw error.response.data;
      } else if (error.request) {
        throw { error: 'Network error: Unable to connect to server. Is the Django server running at http://127.0.0.1:8000?' };
      } else {
        throw { error: 'Registration failed: ' + error.message };
      }
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await api.post('/login/', credentials);
      console.log('Login response:', response.data);
      
      // Store tokens
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Login error details:', error.response || error);
      if (error.response && error.response.data) {
        throw error.response.data;
      } else if (error.request) {
        throw { error: 'Network error: Unable to connect to server. Is the Django server running at http://127.0.0.1:8000?' };
      } else {
        throw { error: 'Login failed: ' + error.message };
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');
      
      if (refreshToken && accessToken) {
        console.log('Attempting logout with both tokens');
        console.log('Access token (first 30 chars):', accessToken.substring(0, 30));
        console.log('Refresh token (first 30 chars):', refreshToken.substring(0, 30));
        
        // Try the logout API call
        const response = await api.post('/logout/', { refresh: refreshToken });
        console.log('Logout API response:', response.status, response.data);
      } else {
        console.log('Missing tokens for logout API call');
        console.log('Access token exists:', !!accessToken);
        console.log('Refresh token exists:', !!refreshToken);
      }
    } catch (error) {
      console.error('Logout API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // If it's a 401, the token might be expired, which is fine for logout
      if (error.response?.status === 401) {
        console.log('401 error during logout - tokens likely expired, proceeding with cleanup');
      } else {
        console.log('Non-401 error during logout:', error.message);
      }
    } finally {
      // Clear storage regardless of API call success
      console.log('Clearing local storage');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user from storage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  // Test current authentication status
  testAuth: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }
      
      // Try to make a simple authenticated request
      const response = await api.get('/test-auth/'); // This endpoint might not exist, but it will test auth
      return response.data;
    } catch (error) {
      console.error('Auth test failed:', error);
      throw error;
    }
  },

  // Debug function to check tokens
  debugTokens: () => {
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    
    console.log('=== TOKEN DEBUG ===');
    console.log('Access Token:', access ? `${access.substring(0, 50)}...` : 'Not found');
    console.log('Refresh Token:', refresh ? `${refresh.substring(0, 50)}...` : 'Not found');
    console.log('User Data:', user ? JSON.parse(user) : 'Not found');
    console.log('===================');
    
    return { access: !!access, refresh: !!refresh, user: !!user };
  },
};

export default authService;