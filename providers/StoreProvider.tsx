// components/providers/StoreProvider.tsx
"use client";

import { useEffect } from "react";
import useAuthStore from "@/stores/auth.store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const getCurrentUser = useAuthStore((state) => state.getCurrentUser);

  // Khi component mount, lấy thông tin user nếu có token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentUser();
    }
  }, [getCurrentUser]);

  return <>{children}</>;
}
