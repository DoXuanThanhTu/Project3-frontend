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

export default function UserMenu({ onLogout }: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    sessionStorage.clear();
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
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Nút user */}
      <button
        type="button"
        onClick={toggleMenu}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-gray-800 to-gray-700 text-white hover:from-gray-700 hover:to-gray-600 transition-all font-medium shadow-lg group"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-blue-400/50 group-hover:border-blue-400 transition-colors">
          <img
            src={user?.avatar?.trim() ? user.avatar : "/default-avatar.png"}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="hidden xl:inline max-w-30 truncate">
          {user?.displayName || "Người dùng"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popup menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg py-2 text-sm animate-fadeIn z-50">
          {/* Thông tin user */}
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={
                    user?.avatar?.trim() ? user.avatar : "/default-avatar.png"
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {user?.displayName || "Người dùng"}
                </p>
                {/* <p className="text-xs text-gray-400 truncate">{displayName}</p> */}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700/50 transition-colors text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4" />
            <span>Chỉnh sửa thông tin</span>
          </Link>
          {/* <Link
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
          </Link> */}

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
