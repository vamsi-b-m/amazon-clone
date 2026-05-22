import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

export const productAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  search: (q) => api.get('/api/products/search', { params: { q } }),
  getCategories: () => api.get('/api/products/categories'),
  addReview: (id, data) => api.post(`/api/products/${id}/reviews`, data),
};

export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addItem: (data) => api.post('/api/cart/items', data),
  updateItem: (productId, quantity) => api.put(`/api/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/api/cart/items/${productId}`),
  clearCart: () => api.delete('/api/cart'),
};

export const orderAPI = {
  createOrder: (data) => api.post('/api/orders', data),
  getOrders: () => api.get('/api/orders'),
  getOrder: (id) => api.get(`/api/orders/${id}`),
  cancelOrder: (id) => api.put(`/api/orders/${id}/cancel`),
};

export default api;
