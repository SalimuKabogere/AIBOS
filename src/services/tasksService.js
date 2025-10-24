import axios from 'axios';

// Allow the API base URL to be configured via environment variable for deployment (REACT_APP_API_BASE_URL)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding auth header to tasks API call');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('401 Unauthorized in tasks API - attempting token refresh');
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('Attempting to refresh access token for tasks API');
          const refreshUrl = `${API_BASE_URL.replace(/\/+$/,'')}/auth/token/refresh/`;
          const response = await fetch(refreshUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken })
          });
          
          if (response.ok) {
            const data = await response.json();
            const newAccessToken = data.access;
            localStorage.setItem('accessToken', newAccessToken);
            console.log('Token refreshed successfully for tasks API');
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } else {
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        console.log('Token refresh failed in tasks API - redirecting to login');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const tasksService = {
  // Categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  createCategory: async (data) => {
    try {
      const response = await api.post('/categories/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const response = await api.patch(`/categories/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.delete(`/categories/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Tasks
  getTasks: async (params = {}) => {
    try {
      const response = await api.get('/tasks/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  createTask: async (data) => {
    try {
      const response = await api.post('/tasks/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  getTask: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  updateTask: async (id, data) => {
    try {
      const response = await api.patch(`/tasks/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  toggleComplete: async (id) => {
    try {
      const response = await api.patch(`/tasks/${id}/toggle_complete/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  },

  getTaskSummary: async () => {
    try {
      const response = await api.get('/tasks/summary/');
      return response.data;
    } catch (error) {
      console.error('Error fetching task summary:', error);
      throw error;
    }
  },
};

export default tasksService;