import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/lib/api";
import { User, LoginCredentials, RegisterData } from "../types/auth.type";

/* ================= TYPES ================= */

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Auth operations
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

/* ================= STORE ================= */

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      /* ---------- Initial State ---------- */
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      /* ---------- Setters ---------- */
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user && !!get().accessToken,
        }),

      setAccessToken: (accessToken) =>
        set({
          accessToken,
          isAuthenticated: !!accessToken && !!get().user,
        }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      /* ---------- Login ---------- */
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });

          const { data } = await api.post("/auth/login", credentials);
          const { user, accessToken } = data;

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          const message = error.response?.data?.message || "Login failed";

          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          });

          throw error;
        }
      },

      /* ---------- Register ---------- */
      register: async (payload) => {
        try {
          set({ isLoading: true, error: null });

          const { data } = await api.post("/auth/register", payload);
          const { user, accessToken } = data;

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          }); // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Registration failed";

          set({ error: message, isLoading: false });
          throw error;
        }
      },

      /* ---------- Logout ---------- */
      logout: async () => {
        try {
          set({ isLoading: true });
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      /* ---------- Get Current User ---------- */
      getCurrentUser: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          set({ isLoading: true, error: null });

          const { data } = await api.get("/auth/me");

          set({
            user: data,
            isAuthenticated: true,
            isLoading: false,
          }); // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          if (error.response?.status === 401) {
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      },

      /* ---------- Update Profile ---------- */
      updateProfile: async (payload) => {
        try {
          set({ isLoading: true, error: null });

          const { data } = await api.put("/auth/profile", payload);

          set({
            user: data,
            isLoading: false,
          }); // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Update profile failed";

          set({ error: message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),

      /* Chỉ persist những gì cần thiết */
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),

      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && state?.user) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);

export default useAuthStore;
