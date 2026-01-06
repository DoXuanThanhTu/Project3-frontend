"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface RegisterFormProps {
  onSuccess?: (accessToken: string) => void;
  onToggleForm: () => void;
}

export default function RegisterForm({
  onSuccess,
  onToggleForm,
}: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { register, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const [localError, setLocalError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    // Reset errors
    setPasswordError("");

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return false;
    }

    // Check password length
    if (formData.password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Gọi hàm register từ auth store
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.email.split("@")[0], // Tạm thời dùng phần trước @ làm tên
        // Hoặc bạn có thể thêm field name vào form nếu cần
      });

      // Register thành công
      if (onSuccess) {
        const token = localStorage.getItem("token");
        if (token) {
          onSuccess(token);
        }
      } else {
        // Mặc định redirect về dashboard
        router.push("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Error đã được xử lý trong store
      const errorMessage =
        error?.response?.data?.message || error?.message || "Đăng ký thất bại";
      setLocalError(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear password error khi người dùng đang nhập
    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      setPasswordError("");
    }
  };

  // Hiển thị error từ store, local error hoặc password error
  const displayError = error || localError || passwordError;
  const isErrorFromPassword = !!passwordError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {displayError && (
        <div
          className={`px-4 py-3 rounded-lg ${
            isErrorFromPassword
              ? "bg-yellow-50 border border-yellow-200 text-yellow-600"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}
        >
          {displayError}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="w-full text-black px-4 py-3 border placeholder:text-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mật khẩu
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          disabled={isLoading}
          className={`w-full px-4 py-3 border text-black placeholder:text-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed ${
            passwordError ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="••••••••"
        />
        <p className="mt-1 text-sm text-gray-500">Ít nhất 6 ký tự</p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Xác nhận mật khẩu
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
          disabled={isLoading}
          className={`w-full px-4 py-3 border text-black placeholder:text-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed ${
            passwordError ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="terms"
          required
          disabled={isLoading}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
          Tôi đồng ý với{" "}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Điều khoản dịch vụ
          </a>{" "}
          và{" "}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Chính sách bảo mật
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Đang xử lý...
          </span>
        ) : (
          "Đăng ký"
        )}
      </button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={onToggleForm}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </form>
  );
}
