// lib/api.ts
import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_BACKEND_DEVELOPMENT_API_URL
    : process.env.NEXT_PUBLIC_BACKEND_PRODUCTION_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor để tự động thêm token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const appStorage = localStorage.getItem("app-storage");
    const { lang } = appStorage ? JSON.parse(appStorage) : { lang: "vi" };

    // Thêm query param lang
    if (config.params) {
      config.params.lang = lang;
    } else {
      config.params = { lang };
    }

    // Thêm token như trước
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Response interceptor để xử lý lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Thử refresh token
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại, logout
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
