"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_USER_API_URL;

interface DecodedToken {
  role?: string;
  exp?: number;
}

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi đăng nhập");

      // ✅ Lưu token vào cookie để middleware và layout đọc được
      Cookies.set("token", data.token, { expires: 7 });

      // ✅ Decode kiểm tra role
      const decoded = jwtDecode<DecodedToken>(data.token);
      if (decoded.role !== "admin") {
        setError("Tài khoản không có quyền quản trị.");
        Cookies.remove("token");
        return;
      }

      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Lỗi không xác định");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-2xl w-96 shadow-lg border border-gray-700"
      >
        <h1 className="text-2xl font-bold mb-6 text-center"> Login</h1>
        {error && <p className="text-red-400 text-center mb-3">{error}</p>}

        <input
          // type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 bg-gray-700 rounded-lg focus:ring-2 ring-blue-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-3 mb-5 bg-gray-700 rounded-lg focus:ring-2 ring-blue-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition py-2 rounded-lg font-semibold"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
