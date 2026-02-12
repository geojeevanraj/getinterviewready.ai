import api from '../utils/axios';

// Register user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Login user
export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Get user profile
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Change user password
export const changePassword = async (data) => {
  const response = await api.put('/auth/change-password', data);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
