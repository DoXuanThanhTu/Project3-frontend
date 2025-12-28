"use client";

import { useState, useEffect, useRef } from "react";
import { User, LogOut, Settings, Heart, Clock } from "lucide-react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";

interface DecodedToken {
  id: string;
  username: string;
  avatar?: string;
  exp?: number;
}

export default function UserMenu() {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Lấy token từ cookie
  const getTokenFromCookie = () => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const token = getTokenFromCookie();
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setTimeout(() => setUser(decoded), 0);
      } catch (err) {
        console.error("Token không hợp lệ", err);
        setTimeout(() => setUser(null), 0);
      }
    }
  }, []);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    window.location.href = "/";
  };

  // Hover menu
  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => setIsOpen(true), 400);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => setIsOpen(false), 200);
    setHoverTimeout(timeout);
  };

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Nút user */}
      {!user ? (
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition font-medium"
        >
          <User className="w-5 h-5" />
          <span className="hidden xl:inline">Đăng nhập</span>
        </Link>
      ) : (
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition font-medium"
        >
          {/* <img
            src={user?.avatar?.trim() ? user.avatar : "/default-avatar.png"}
            alt="avatar"
            className="w-8 h-8 rounded-full border border-gray-300 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-avatar.png";
            }}
          /> */}
          <Image
            src={user?.avatar?.trim() ? user.avatar : "/default-avatar.png"}
            alt="avatar"
            className="w-8 h-8 rounded-full border border-gray-300 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-avatar.png";
            }}
            width={32}
            height={32}
          />
          <span className="hidden xl:inline">
            {user?.username || "Người dùng"}
          </span>
        </button>
      )}

      {/* Popup menu */}
      {user && isOpen && (
        <div
          className="absolute right-0 top-full w-56 bg-gray-800 border border-gray-700 
          rounded-xl shadow-lg py-2 text-sm animate-fadeIn z-50"
        >
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition"
          >
            <Settings className="w-4 h-4" /> Chỉnh sửa thông tin
          </Link>
          <Link
            href="/favorites"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition"
          >
            <Heart className="w-4 h-4" /> Phim yêu thích
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition"
          >
            <Clock className="w-4 h-4" /> Phim đã xem
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-700 transition"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
