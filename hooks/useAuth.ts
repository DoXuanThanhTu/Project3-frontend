// hooks/useAuth.ts
import useAuthStore from "@/stores/auth.store";

export const useAuth = () => {
  const {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    setError,
    clearError,
  } = useAuthStore();

  return {
    // State
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    error,

    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    setError,
    clearError,
  };
};
