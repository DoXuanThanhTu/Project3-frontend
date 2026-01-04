"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  Star,
  History,
  Heart,
  Award,
  Clock,
  Edit,
  Settings,
  LogOut,
  PlayCircle,
  Users,
  TrendingUp,
  Lock,
  X,
  Camera,
} from "lucide-react";
// import ImageUploadPopup from "@/components/images/ImageUploadPopup";
import { IMovieResponse } from "@/types/response.type";
import api from "@/lib/api";
import { useAppStore } from "@/stores";
import Link from "next/link";
import Image from "next/image";
import useAuthStore from "@/stores/auth.store";
export interface ICommentUser {
  id: string;
  displayName: string;
  avatar: string;
}
export interface ICommentReactionUser {
  _id: string;
  displayName: string;
  avatar: string;
}
const PLAYER_SETTINGS_KEY = "playerSettings";

type PlayerSettings = {
  volume: number;
  speedrate: number;
  autoPlay: boolean;
  isfullScreen: boolean;
};
export interface IComment {
  id: string;

  user: ICommentUser;

  content: string;

  parent: string | null;

  replyCount: number;

  likes: ICommentReactionUser[];
  dislikes: ICommentReactionUser[];
  useful: ICommentReactionUser[];
  shares: ICommentReactionUser[];

  totalLike: number;
  totalDislike: number;
  totalUseful: number;
  totalShare: number;

  isEdited: boolean;
  isDeleted: boolean;

  createdAt: string; // ISO string
  updatedAt: string; // ISO string

  movieName: string;
  episodeOrLabel: string;
}
export interface IWatchHistoryItem {
  _id: string;
  movieId: string;

  title: {
    vi?: string;
    en?: string;
  };

  thumbnail: string;
  poster: string;
  banner: string;

  type: "TV" | "MOVIE";

  slug: {
    vi?: string;
    en?: string;
  };

  genres: {
    _id: string;
    name: {
      vi: string;
      en: string;
    };
    slug: {
      vi: string;
      en: string;
    };
  }[];

  ratingAvg: number;

  totalEpisodes: number;
  currentEpisode: number;

  episodeId: string | null;

  currentTime: number;
  duration: number;
  watchDuration: number;
  watchedPercentage: number;

  lastWatchedAt: string;
  watchCount: number;

  episode?: {
    _id: string;
    title: {
      vi: string;
    };
    slug: {
      vi: string;
    };
    episodeOrLabel: string;
  };
  createdAt: string;
  updatedAt: string;
}
export interface IFavoriteMovie {
  _id: string;
  movieId: string;

  title: {
    vi?: string;
    en?: string;
  };

  thumbnail: string;
  poster: string;
  banner: string;

  type: string;

  slug: {
    vi?: string;
    en?: string;
  };

  genres: any[];

  ratingAvg: number;
  totalViews: number;
  favorites: number;

  addedAt: string;
}

// Tách các interface ra file riêng
interface IUserStats {
  totalWatched: number;
  totalHours: number;
  favorites: number;
  reviews: number;
  followers: number;
  following: number;
}

interface IUserPreferences {
  favoriteGenres: string[];
  languages: string[];
  quality: string[];
  autoPlay: boolean;
  notifications: boolean;
}

interface IAchievement {
  id: number;
  name: string;
  icon: string;
  description: string;
}

interface IUserData {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phone: string;
  avatar: string;
  coverImage: string;
  joinDate: string;
  membership: string;
  level: number;
  points: number;
  stats: IUserStats;
  preferences: IUserPreferences;
  createdAt: string;
  achievements: IAchievement[];
}

interface UserProfileProps {
  userId?: string;
}

// Component Popup đổi mật khẩu
const ChangePasswordPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gọi API đổi mật khẩu
      await api.post("/auth/change-password", {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }, 2000);
    } catch (err: any) {
      console.error("Change password error:", err);
      setError(
        err.response?.data?.message ||
          "Đổi mật khẩu thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock size={20} />
            Đổi mật khẩu
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
              Đổi mật khẩu thành công!
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium">Mật khẩu cũ</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập mật khẩu cũ"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Mật khẩu mới</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Component Popup chỉnh sửa thông tin
const EditProfilePopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  userData: IUserData;
  onUpdate: (updatedData: Partial<IUserData>) => void;
}> = ({ isOpen, onClose, userData, onUpdate }) => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    displayName: userData.displayName || "",
    email: userData.email || "",
    phone: userData.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        displayName: userData.displayName || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
  }, [isOpen, userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Gọi API cập nhật thông tin
      const response = await api.patch("/profile/update", formData);

      onUpdate(response.data.data);
      setSuccess(true);
      setUser(response.data);
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Update profile error:", err);
      setError(
        err.response?.data?.message ||
          "Cập nhật thông tin thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Edit size={20} />
            Chỉnh sửa thông tin
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
              Cập nhật thông tin thành công!
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium">Tên hiển thị</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập tên hiển thị"
            />
          </div>

          {/* <div className="space-y-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập số điện thoại"
            />
          </div> */}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Component con cho Stats Card
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  iconBgColor: string;
}> = ({ icon, label, value, color, iconBgColor }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
    <div className="flex items-center gap-3">
      <div className={`p-2 ${iconBgColor} rounded-lg`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

// Component con cho Tab Button
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 font-medium text-sm md:text-base whitespace-nowrap ${
      active
        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
    }`}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </button>
);

// Component con cho History Item
const HistoryItem: React.FC<{
  item: IWatchHistoryItem;
  lang: string;
  formatDateTime: (date: string) => string;
}> = ({ item, lang, formatDateTime }) => (
  <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
    <div className="relative w-20 h-12 shrink-0">
      <img
        src={item.thumbnail}
        alt={item.title?.["vi"] || "Movie"}
        className="w-full h-full object-cover rounded"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <Link
          href={`/watch/${item.slug["vi"]}?ep=${item.episode?.episodeOrLabel}`}
          className="flex gap-1 items-center"
        >
          <PlayCircle size={20} className="text-white" />
        </Link>
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <h3 className="font-semibold truncate">
        {item.title?.["vi"] || "Unknown Title"}
      </h3>
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{formatDateTime(item.lastWatchedAt)}</span>
        {item.episode?.episodeOrLabel && (
          <span>Tập {item.episode.episodeOrLabel}</span>
        )}
      </div>
    </div>

    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
      <Link
        href={`/watch/${item.slug["vi"]}?ep=${item.episode?.episodeOrLabel}`}
        className="flex gap-1 items-center"
      >
        Xem tiếp
        <PlayCircle size={20} />
      </Link>
    </button>
  </div>
);

// Component con cho Review Item
const ReviewItem: React.FC<{
  review: IComment;
  formatDate: (date: string) => string;
}> = ({ review, formatDate }) => (
  <div className="border-b dark:border-gray-700 pb-4 last:border-0">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">
        {review.movieName}
        {review.episodeOrLabel && (
          <span className="text-sm text-gray-500 ml-2">
            • Tập {review.episodeOrLabel}
          </span>
        )}
      </h3>
    </div>

    <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
      {review.content}
    </p>

    <div className="flex items-center justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
      <span>{formatDate(review.updatedAt)}</span>

      <div className="flex items-center gap-4">
        {review.totalLike > 0 && <span>❤️ {review.totalLike} thích</span>}
        <button className="text-blue-600 dark:text-blue-400 hover:underline">
          Xem chi tiết
        </button>
      </div>
    </div>
  </div>
);

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "favorites" | "reviews"
  >("overview");
  const [showImageUploadPopup, setShowImageUploadPopup] = useState(false);
  const [uploadType, setUploadType] = useState<"avatar" | "cover">("avatar");
  const lang = useAppStore((state) => state.lang);
  const user = useAuthStore((state) => state.user);
  const { setUser } = useAuthStore();
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [history, setHistory] = useState<IWatchHistoryItem[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<IFavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [updatingAutoPlay, setUpdatingAutoPlay] = useState(false);

  // State cho các popup
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [showEditProfilePopup, setShowEditProfilePopup] = useState(false);
  const [showEditAvatarPopup, setShowEditAvatarPopup] = useState(false);
  const [showEditCoverPopup, setShowEditCoverPopup] = useState(false);

  const getPlayerSettings = (): PlayerSettings => {
    if (typeof window === "undefined") {
      return {
        volume: 100,
        speedrate: 1,
        autoPlay: false,
        isfullScreen: false,
      };
    }

    try {
      const raw = localStorage.getItem(PLAYER_SETTINGS_KEY);
      if (!raw) {
        return {
          volume: 100,
          speedrate: 1,
          autoPlay: false,
          isfullScreen: false,
        };
      }
      return JSON.parse(raw);
    } catch {
      return {
        volume: 100,
        speedrate: 1,
        autoPlay: false,
        isfullScreen: false,
      };
    }
  };

  const setPlayerSettings = (settings: PlayerSettings) => {
    localStorage.setItem(PLAYER_SETTINGS_KEY, JSON.stringify(settings));
  };

  // Format functions
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const formatDateTime = useCallback((dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, reviewRes, historyRes, favoritesRes] =
          await Promise.all([
            api.get("/profile/me"),
            api.get("/comment/me/comments"),
            api.get("/watchHistory"),
            api.get("/favorite/my-favorites"),
          ]);

        setUserData(profileRes.data.data);
        setAutoPlay(profileRes.data.data.preferences.autoPlay);
        setComments(reviewRes.data.data.comments || []);
        setHistory(historyRes.data.data.history || []);
        setFavoriteMovies(favoritesRes.data.data.favorites || []);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tính toán giá trị thống kê từ dữ liệu thực
  const stats = useMemo(() => {
    if (!userData) return null;

    return {
      totalWatched: history.length,
      totalHours: Math.round(
        history.reduce((acc, item) => acc + (item.watchDuration || 0), 0) / 3600
      ),
      favorites: favoriteMovies.length,
      reviews: comments.length,
      followers: userData.stats?.followers || 0,
      following: userData.stats?.following || 0,
    };
  }, [history, favoriteMovies.length, comments.length, userData]);

  const handleToggleAutoPlay = async () => {
    if (updatingAutoPlay) return;

    const nextValue = !autoPlay;

    setAutoPlay(nextValue);
    setUpdatingAutoPlay(true);
    const currentSettings = getPlayerSettings();

    setPlayerSettings({
      ...currentSettings,
      autoPlay: nextValue,
    });
    try {
      await api.patch("/profile/preferences", {
        autoPlay: nextValue,
      });
    } catch (error) {
      console.error("Update autoplay failed:", error);
      setAutoPlay(!nextValue);
    } finally {
      setUpdatingAutoPlay(false);
    }
  };

  const handleUpdateUserData = (updatedData: Partial<IUserData>) => {
    if (userData) {
      setUserData({ ...userData, ...updatedData });
    }
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    // Xóa token và thông tin đăng nhập
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Chuyển hướng về trang đăng nhập
    window.location.href = "/login";
  };

  // Nếu đang loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Đang tải thông tin...
          </p>
        </div>
      </div>
    );
  }

  // Nếu có lỗi
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Nếu không có dữ liệu người dùng
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">
          Không tìm thấy thông tin người dùng
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Popup Components */}
      <ChangePasswordPopup
        isOpen={showChangePasswordPopup}
        onClose={() => setShowChangePasswordPopup(false)}
      />

      <EditProfilePopup
        isOpen={showEditProfilePopup}
        onClose={() => setShowEditProfilePopup(false)}
        userData={userData}
        onUpdate={handleUpdateUserData}
      />

      {/* Popup chỉnh sửa avatar (đơn giản) */}
      {showEditAvatarPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Camera size={20} />
                Chỉnh sửa ảnh đại diện
              </h2>
              <button
                onClick={() => setShowEditAvatarPopup(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tính năng đang được phát triển. Vui lòng quay lại sau!
              </p>
              <button
                onClick={() => setShowEditAvatarPopup(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup chỉnh sửa ảnh bìa (đơn giản) */}
      {showEditCoverPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Camera size={20} />
                Chỉnh sửa ảnh bìa
              </h2>
              <button
                onClick={() => setShowEditCoverPopup(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tính năng đang được phát triển. Vui lòng quay lại sau!
              </p>
              <button
                onClick={() => setShowEditCoverPopup(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img
          src={userData.coverImage || "/default-cover.jpg"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Edit Cover Button */}
        <button
          onClick={() => setShowEditCoverPopup(true)}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Camera size={16} />
          <span className="hidden md:inline">Chỉnh sửa ảnh bìa</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden">
              <img
                src={userData.avatar || "/default-avatar.png"}
                alt={userData.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>

            {/* Edit Avatar Button */}
            <button
              onClick={() => setShowEditAvatarPopup(true)}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {userData.displayName}
                  </h1>
                  {userData.membership && (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full">
                      {userData.membership}
                    </span>
                  )}
                </div>
                {userData.username && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    @{userData.username}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {userData.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <span>{userData.email}</span>
                      <button
                        onClick={() => setShowEditProfilePopup(true)}
                        className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  )}
                  {userData.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <span>{userData.phone}</span>
                      <button
                        onClick={() => setShowEditProfilePopup(true)}
                        className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span>Tham gia: {formatDate(userData.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowEditProfilePopup(true)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 transition"
                >
                  <Edit size={18} />
                  <span>Chỉnh sửa thông tin</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition"
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
            <StatCard
              icon={
                <Eye className="text-blue-600 dark:text-blue-400" size={20} />
              }
              label="Đã xem"
              value={stats.totalWatched}
              color="blue"
              iconBgColor="bg-blue-100 dark:bg-blue-900"
            />

            <StatCard
              icon={
                <Heart className="text-pink-600 dark:text-pink-400" size={20} />
              }
              label="Yêu thích"
              value={stats.favorites}
              color="pink"
              iconBgColor="bg-pink-100 dark:bg-pink-900"
            />

            <StatCard
              icon={
                <Star
                  className="text-yellow-600 dark:text-yellow-400"
                  size={20}
                />
              }
              label="Bình luận"
              value={stats.reviews}
              color="yellow"
              iconBgColor="bg-yellow-100 dark:bg-yellow-900"
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 overflow-x-auto">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              icon={<User size={18} className="inline" />}
              label="Tổng quan"
            />
            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon={<History size={18} className="inline" />}
              label="Lịch sử xem"
            />
            <TabButton
              active={activeTab === "favorites"}
              onClick={() => setActiveTab("favorites")}
              icon={<Heart size={18} className="inline" />}
              label="Yêu thích"
            />
            <TabButton
              active={activeTab === "reviews"}
              onClick={() => setActiveTab("reviews")}
              icon={<Star size={18} className="inline" />}
              label="Đánh giá"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Recent Watch History */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <History size={20} />
                      Lịch sử xem gần đây
                    </h2>
                    <button
                      onClick={() => setActiveTab("history")}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Xem tất cả
                    </button>
                  </div>

                  <div className="space-y-4">
                    {history.slice(0, 3).map((item) => (
                      <HistoryItem
                        key={item._id}
                        item={item}
                        lang={"vi"}
                        formatDateTime={formatDateTime}
                      />
                    ))}
                    {history.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Chưa có lịch sử xem
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Star size={20} />
                    Bình luận gần đây
                  </h2>

                  <div className="space-y-4">
                    {comments.slice(0, 3).map((review) => (
                      <ReviewItem
                        key={review.id}
                        review={review}
                        formatDate={formatDate}
                      />
                    ))}
                    {comments.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Chưa có bình luận nào
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Preferences */}
                {userData.preferences && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                      <Settings size={20} />
                      Tùy chọn
                    </h2>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span>Tự động phát</span>

                        <button
                          type="button"
                          onClick={handleToggleAutoPlay}
                          disabled={updatingAutoPlay}
                          className={`w-12 h-6 rounded-full transition relative ${
                            autoPlay
                              ? "bg-blue-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          } ${
                            updatingAutoPlay
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <span
                            className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow transform transition ${
                              autoPlay ? "translate-x-6" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Đổi mật khẩu */}
                      <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Lock size={18} className="text-gray-500" />
                          <span>Đổi mật khẩu</span>
                        </div>
                        <button
                          onClick={() => setShowChangePasswordPopup(true)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          Đổi mật khẩu
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {userData.achievements && userData.achievements.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                      <Award size={20} />
                      Thành tựu
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                      {userData.achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="text-2xl mb-2">
                            {achievement.icon}
                          </div>
                          <h3 className="font-semibold text-sm mb-1">
                            {achievement.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {achievement.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Points */}
                {/* <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow p-6 text-white">
                  <h2 className="text-xl font-bold mb-4">Điểm tích lũy</h2>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {userData.points}
                    </div>
                    <p className="text-purple-100">
                      Điểm có thể đổi quà và nâng cấp VIP
                    </p>

                    <div className="mt-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cấp {userData.level}</span>
                        <span>Cấp {userData.level + 1}</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${(userData.points % 1000) / 10}%` }}
                        ></div>
                      </div>
                      <div className="text-xs mt-2 text-center">
                        Cần {1000 - (userData.points % 1000)} điểm để lên cấp
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Lịch sử xem</h2>

              <div className="space-y-4">
                {history.map((item) => (
                  <HistoryItem
                    key={item._id}
                    item={item}
                    lang={"vi"}
                    formatDateTime={formatDateTime}
                  />
                ))}
                {history.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có lịch sử xem
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Phim yêu thích</h2>

              {favoriteMovies.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Chưa có phim yêu thích
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {favoriteMovies.map((movie) => (
                    <div key={movie._id} className="group relative">
                      <Link
                        href={`/movie/${
                          movie.slug?.["vi"] || movie.slug?.vi || movie.slug?.en
                        }`}
                      >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden">
                          <img
                            src={movie.thumbnail}
                            alt={
                              movie.title?.["vi"] ||
                              movie.title?.vi ||
                              movie.title?.en ||
                              "Movie"
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      <div className="mt-3">
                        <h3 className="font-semibold truncate">
                          {movie.title?.["vi"] ||
                            movie.title?.vi ||
                            movie.title?.en}
                        </h3>

                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{movie.type}</span>
                          <div className="flex items-center gap-1">
                            <Star
                              size={14}
                              className="text-yellow-500 fill-yellow-500"
                            />
                            <span>{movie.ratingAvg}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Bình luận của tôi</h2>

              <div className="space-y-6">
                {comments.map((review) => (
                  <div
                    key={review.id}
                    className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-bold">
                            {review.movieName}
                            {review.episodeOrLabel && (
                              <span className="text-sm text-gray-500 ml-2">
                                • Tập {review.episodeOrLabel}
                              </span>
                            )}
                          </h3>
                        </div>

                        <div className="mt-4">
                          <p className="text-gray-700 dark:text-gray-300">
                            {review.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500">
                              <Heart size={18} />
                              <span>{review.totalLike} thích</span>
                            </button>

                            <button className="text-gray-500 hover:text-blue-500">
                              Trả lời
                            </button>

                            {!review.isDeleted && (
                              <button className="text-gray-500 hover:text-blue-500">
                                Chỉnh sửa
                              </button>
                            )}
                          </div>

                          <span className="text-sm text-gray-500">
                            {formatDate(review.updatedAt)}
                            {review.isEdited && " (đã chỉnh sửa)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có bình luận nào
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
