import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'x-tenant-id': import.meta.env.VITE_TENANT_ID || '' }
});

// Ejemplo de interceptor para loguear errores (opcional)
api.interceptors.response.use(
  r => r,
  err => {
    console.error('API error:', err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);
