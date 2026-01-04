import { Lang } from "./../stores/lang.store";
// lib/api.ts
import axios from "axios";
export interface IAppStorage {
  state: {
    theme: "dark" | "light";
    lang: string;
  };
  version: number;
}
const API_URL =
  process.env.NEXT_PUBLIC_ENV === "development"
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

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  try {
    const raw = localStorage.getItem("app-storage");
    if (raw) {
      const appStorage = JSON.parse(raw);
      // const lang = appStorage?.state?.lang || "vi";

      // if (lang) {
      //   config.params = {
      //     ...(config.params ?? {}),
      //     lang,
      //   };
      // }
    }
  } catch (err) {
    console.error("Failed to parse app-storage", err);
  }

  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const authData = JSON.parse(raw);
      const token = authData?.state?.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.error("Failed to parse auth-storage", err);
  }

  return config;
});

// Response interceptor để xử lý lỗi 401
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         // Thử refresh token
//         await api.post("/auth/refresh");
//         return api(originalRequest);
//       } catch (refreshError) {
//         // Nếu refresh thất bại, logout
//         if (typeof window !== "undefined") {
//           localStorage.removeItem("token");
//           window.location.href = "/login";
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default api;
