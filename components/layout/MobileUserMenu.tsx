"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  LogOut,
  Settings,
  Heart,
  Clock,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/stores/auth.store";

interface UserMenuProps {
  onLogout?: () => void;
}

export default function MobileUserMenu({ onLogout }: UserMenuProps) {
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Lấy state và action từ store
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const getCurrentUser = useAuthStore((state) => state.getCurrentUser);

  // Khi mount, gọi API lấy user hiện tại
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    if (onLogout) onLogout();
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

  const toggleMenu = () => setIsOpen(!isOpen);
  if (!user) {
    return <Link href={"/auth"}>Đăng nhập</Link>;
  }
  return (
    <div
      className="relative"
      ref={mobileMenuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Nút user */}

      {/* Popup menu */}
      {user && (
        <div className="absolute mt-2 w-56 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg py-2 text-sm animate-fadeIn z-50">
          {/* Menu items */}
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700/50 transition-colors text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4" />
            <span>Chỉnh sửa thông tin</span>
          </Link>
          <Link
            href="/favorites"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700/50 transition-colors text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            <Heart className="w-4 h-4" />
            <span>Phim yêu thích</span>
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700/50 transition-colors text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            <Clock className="w-4 h-4" />
            <span>Phim đã xem</span>
          </Link>

          {/* Divider */}
          <div className="my-2 border-t border-gray-700"></div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-700/50 transition-colors hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}
