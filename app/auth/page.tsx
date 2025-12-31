"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthToggle from "@/components/auth/AuthToggle";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import useAuthStore from "@/stores/auth.store";

export default function AuthPage() {
  const router = useRouter();

  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  /* ================= Redirect nếu đã login ================= */
  useEffect(() => {
    if (user) {
      startTransition(() => {
        setShowSuccessMessage(true);
      });
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, router]);

  /* ================= Toggle form ================= */
  const handleToggle = () => setIsLogin((prev) => !prev);

  /* ================= Loading ================= */
  if (isLoading) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Đang xử lý...</p>
        </div>
      </div>
    );
  }

  /* ================= Success ================= */
  if (showSuccessMessage) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng nhập thành công!
          </h2>
          <p className="text-gray-600 mb-6">
            Đang chuyển hướng về trang chủ...
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" />
          </div>

          <p className="mt-4 text-sm text-gray-500">Chuyển hướng sau 3 giây</p>
        </div>
      </div>
    );
  }

  /* ================= Form ================= */
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </h1>
          <p className="text-gray-600">
            {isLogin
              ? "Đăng nhập để tiếp tục"
              : "Đăng ký để bắt đầu trải nghiệm"}
          </p>
        </div>

        <AuthToggle isLogin={isLogin} onToggle={handleToggle} />

        {isLogin ? (
          <LoginForm onToggleForm={handleToggle} />
        ) : (
          <RegisterForm onToggleForm={handleToggle} />
        )}

        {/* ===== Social ===== */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500 mb-4">
            Hoặc tiếp tục với
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button className="border rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50">
              Google
            </button>
            <button className="border rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50">
              GitHub
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        Bằng việc đăng nhập, bạn đồng ý với{" "}
        <span className="text-blue-600 cursor-pointer">
          Điều khoản & Chính sách
        </span>
      </div>
    </div>
  );
}
