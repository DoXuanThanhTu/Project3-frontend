"use client";

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

export default function AuthToggle({ isLogin, onToggle }: AuthToggleProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="bg-gray-100 p-1 rounded-lg flex">
        <button
          type="button"
          className={`px-6 py-2 rounded-md transition-all duration-300 ${
            isLogin
              ? "bg-white shadow-sm text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => !isLogin && onToggle()}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          className={`px-6 py-2 rounded-md transition-all duration-300 ${
            !isLogin
              ? "bg-white shadow-sm text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => isLogin && onToggle()}
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
}
