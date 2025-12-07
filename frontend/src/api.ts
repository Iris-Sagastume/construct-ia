// src/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Interceptor de request: tenant + token Firebase
api.interceptors.request.use(
  (config) => {
    // Aseguramos que headers exista
    config.headers = config.headers ?? {};

    // Tenant
    const tenant =
      localStorage.getItem("constructia_tenant") ||
      import.meta.env.VITE_TENANT_ID ||
      "default";

    (config.headers as any)["x-tenant-id"] = tenant;

    // Token (por si alguna vez lo usas)
    const token =
      localStorage.getItem("constructia_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("firebase_token");

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    // No tocar Content-Type: Axios lo ajusta solo
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiHelper = {
  get: <T>(url: string, params?: any): Promise<T> =>
    api.get(url, { params }).then((r) => r.data),

  post: <T>(url: string, data?: any): Promise<T> =>
    api.post(url, data).then((r) => r.data),

  put: <T>(url: string, data?: any): Promise<T> =>
    api.put(url, data).then((r) => r.data),

  // 🔹 NUEVO: eliminar recursos
  delete: <T = void>(url: string, params?: any): Promise<T> =>
    api.delete(url, { params }).then((r) => r.data),

  // 🔹 Subir archivos (multipart/form-data)
  upload: <T>(url: string, formData: FormData): Promise<T> =>
    api.post(url, formData).then((r) => r.data),
};

