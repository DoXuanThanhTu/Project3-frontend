"use client";

import React, { useState } from "react";
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
  Film,
  PlayCircle,
  Users,
  TrendingUp,
} from "lucide-react";
// import MovieCard from "@/components/movie/MovieCard";
import { IMovie } from "@/types/movie.type";

// Mock data cho người dùng
const mockUserData = {
  id: "user_001",
  username: "phimyeuthich",
  displayName: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone: "+84 123 456 789",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=phimyeuthich",
  coverImage:
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  joinDate: "2023-05-15",
  membership: "Premium",
  level: 15,
  points: 2450,

  stats: {
    totalWatched: 127,
    totalHours: 342,
    favorites: 45,
    reviews: 28,
    followers: 1234,
    following: 567,
  },

  preferences: {
    favoriteGenres: ["Hành động", "Khoa học viễn tưởng", "Tâm lý", "Hài"],
    languages: ["Tiếng Việt", "Tiếng Anh", "Phụ đề Việt"],
    quality: ["1080p", "4K"],
    autoPlay: true,
    notifications: true,
  },

  achievements: [
    { id: 1, name: "Mọt phim cấp 5", icon: "🎬", description: "Xem 100+ phim" },
    {
      id: 2,
      name: "Đánh giá viên",
      icon: "⭐",
      description: "Viết 20+ review",
    },
    {
      id: 3,
      name: "Chuyên gia hành động",
      icon: "💥",
      description: "Xem 50 phim hành động",
    },
    {
      id: 4,
      name: "Thức đêm",
      icon: "🌙",
      description: "Xem phim sau 12h đêm 30 lần",
    },
  ],
};

// Mock data cho lịch sử xem
const mockWatchHistory: Array<{
  id: string;
  movie: IMovie;
  watchedAt: string;
  progress: number; // 0-100
  duration: number; // phút
}> = [
  {
    id: "hist_001",
    movie: {
      id: "movie_001",
      title: "Inception",
      thumbnail:
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      genres: ["Khoa học viễn tưởng", "Hành động"],
      ratingAvg: 8.8,
      duration: "148",
    },
    watchedAt: "2024-01-15 20:30",
    progress: 100,
    duration: 148,
  },
  {
    id: "hist_002",
    movie: {
      id: "movie_002",
      title: "Interstellar",
      thumbnail:
        "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      genres: ["Khoa học viễn tưởng", "Phiêu lưu"],
      ratingAvg: 8.6,
      duration: "169",
    },
    watchedAt: "2024-01-14 19:15",
    progress: 75,
    duration: 169,
  },
  {
    id: "hist_003",
    movie: {
      id: "movie_003",
      title: "The Dark Knight",
      thumbnail:
        "https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      genres: ["Hành động", "Tội phạm"],
      ratingAvg: 9.0,
      duration: "152",
    },
    watchedAt: "2024-01-13 21:00",
    progress: 100,
    duration: 152,
  },
  {
    id: "hist_004",
    movie: {
      id: "movie_004",
      title: "Parasite",
      thumbnail:
        "https://images.unsplash.com/photo-1595769812725-4c6564f70466?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      genres: ["Tâm lý", "Kinh dị"],
      ratingAvg: 8.6,
      duration: "132",
    },
    watchedAt: "2024-01-12 18:45",
    progress: 100,
    duration: 132,
  },
];

// Mock data cho phim yêu thích
const mockFavoriteMovies: IMovie[] = [
  {
    id: "fav_001",
    title: "Avatar: The Way of Water",
    thumbnail:
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    genres: ["Khoa học viễn tưởng", "Phiêu lưu"],
    ratingAvg: 7.9,
    relasedYear: 2022,
  },
  {
    id: "fav_002",
    title: "Spider-Man: No Way Home",
    thumbnail:
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    genres: ["Hành động", "Phiêu lưu"],
    ratingAvg: 8.3,
    relasedYear: 2021,
  },
  {
    id: "fav_003",
    title: "Dune",
    thumbnail:
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    genres: ["Khoa học viễn tưởng", "Phiêu lưu"],
    ratingAvg: 8.0,
    relasedYear: 2021,
  },
  {
    id: "fav_004",
    title: "Everything Everywhere All at Once",
    thumbnail:
      "https://images.unsplash.com/photo-1574267432553-4b4628081c31?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    genres: ["Hành động", "Hài", "Khoa học viễn tưởng"],
    ratingAvg: 7.9,
    relasedYear: 2022,
  },
];

// Mock data cho đánh giá gần đây
const mockRecentReviews = [
  {
    id: "review_001",
    movieId: "movie_001",
    movieTitle: "Inception",
    rating: 5,
    comment:
      "Phim hay, cốt truyện phức tạp nhưng logic. Christopher Nolan thực sự là thiên tài!",
    date: "2024-01-15",
    likes: 45,
  },
  {
    id: "review_002",
    movieId: "movie_002",
    movieTitle: "Interstellar",
    rating: 5,
    comment:
      "Cảm xúc dâng trào, hình ảnh đẹp, âm nhạc tuyệt vời. Một kiệt tác của Nolan!",
    date: "2024-01-14",
    likes: 32,
  },
  {
    id: "review_003",
    movieId: "movie_003",
    movieTitle: "The Dark Knight",
    rating: 4,
    comment: "Joker của Heath Ledger quá xuất sắc! Diễn xuất đỉnh cao.",
    date: "2024-01-13",
    likes: 28,
  },
];

interface UserProfileProps {
  userId?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "favorites" | "reviews"
  >("overview");
  const [userData] = useState(mockUserData);
  const [watchHistory] = useState(mockWatchHistory);
  const [favoriteMovies] = useState(mockFavoriteMovies);
  const [recentReviews] = useState(mockRecentReviews);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format date time
  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img
          src={userData.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Edit Cover Button */}
        <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
          <Edit size={16} />
          <span className="hidden md:inline">Chỉnh sửa ảnh bìa</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={userData.avatar}
              alt={userData.displayName}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-xl"
            />
            <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>

            {/* Edit Avatar Button */}
            <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg">
              <Edit size={16} />
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
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full">
                    {userData.membership}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  @{userData.username}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-500" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span>{userData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span>Tham gia: {formatDate(userData.joinDate)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 transition">
                  <Settings size={18} />
                  <span>Cài đặt</span>
                </button>
                <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition">
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Eye className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Đã xem
                </p>
                <p className="text-2xl font-bold">
                  {userData.stats.totalWatched}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock
                  className="text-green-600 dark:text-green-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Giờ xem
                </p>
                <p className="text-2xl font-bold">
                  {userData.stats.totalHours}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                <Heart className="text-pink-600 dark:text-pink-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Yêu thích
                </p>
                <p className="text-2xl font-bold">{userData.stats.favorites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Star
                  className="text-yellow-600 dark:text-yellow-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Đánh giá
                </p>
                <p className="text-2xl font-bold">{userData.stats.reviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users
                  className="text-purple-600 dark:text-purple-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Người theo dõi
                </p>
                <p className="text-2xl font-bold">{userData.stats.followers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingUp
                  className="text-orange-600 dark:text-orange-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cấp độ
                </p>
                <p className="text-2xl font-bold">{userData.level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-3 font-medium text-sm md:text-base whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <User size={18} className="inline mr-2" />
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-3 font-medium text-sm md:text-base whitespace-nowrap ${
                activeTab === "history"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <History size={18} className="inline mr-2" />
              Lịch sử xem
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-4 py-3 font-medium text-sm md:text-base whitespace-nowrap ${
                activeTab === "favorites"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Heart size={18} className="inline mr-2" />
              Yêu thích
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-3 font-medium text-sm md:text-base whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Star size={18} className="inline mr-2" />
              Đánh giá
            </button>
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
                    {watchHistory.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        <div className="relative w-20 h-12 flex-shrink-0">
                          <img
                            src={item.movie.thumbnail}
                            alt={item.movie.title}
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <PlayCircle size={20} className="text-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {item.movie.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatDateTime(item.watchedAt)}</span>
                            <span>{item.duration} phút</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Tiến độ xem</span>
                              <span>{item.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <PlayCircle size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Star size={20} />
                    Đánh giá gần đây
                  </h2>

                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b dark:border-gray-700 pb-4 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{review.movieTitle}</h3>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300 dark:text-gray-600"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {review.comment}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatDate(review.date)}</span>
                          <div className="flex items-center gap-4">
                            <span>❤️ {review.likes} thích</span>
                            <button className="text-blue-600 dark:text-blue-400 hover:underline">
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Preferences */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Settings size={20} />
                    Tùy chọn
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Thể loại yêu thích</h3>
                      <div className="flex flex-wrap gap-2">
                        {userData.preferences.favoriteGenres.map(
                          (genre, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                            >
                              {genre}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Ngôn ngữ</h3>
                      <div className="flex flex-wrap gap-2">
                        {userData.preferences.languages.map((lang, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Tự động phát</span>
                      <div
                        className={`w-12 h-6 rounded-full transition ${
                          userData.preferences.autoPlay
                            ? "bg-blue-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 bg-white rounded-full shadow transform transition ${
                            userData.preferences.autoPlay ? "translate-x-6" : ""
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Thông báo</span>
                      <div
                        className={`w-12 h-6 rounded-full transition ${
                          userData.preferences.notifications
                            ? "bg-blue-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 bg-white rounded-full shadow transform transition ${
                            userData.preferences.notifications
                              ? "translate-x-6"
                              : ""
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
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
                        <div className="text-2xl mb-2">{achievement.icon}</div>
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

                {/* Points */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow p-6 text-white">
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
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Lịch sử xem</h2>

              <div className="space-y-4">
                {watchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition group"
                  >
                    <div className="relative w-24 h-16 flex-shrink-0">
                      <img
                        src={item.movie.thumbnail}
                        alt={item.movie.title}
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <PlayCircle size={24} className="text-white" />
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {item.progress === 100 ? "Đã xem" : `${item.progress}%`}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {item.movie.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Star
                                size={16}
                                className="text-yellow-500 fill-yellow-500"
                              />
                              <span>{item.movie.ratingAvg}</span>
                            </div>
                            <span className="text-gray-500 dark:text-gray-400">
                              {item.movie.genres?.join(", ")}
                            </span>
                          </div>
                        </div>

                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <PlayCircle size={20} />
                        </button>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                          <span>Xem lúc: {formatDateTime(item.watchedAt)}</span>
                          <span>Thời lượng: {item.duration} phút</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.progress === 100
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Phim yêu thích</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {favoriteMovies.map((movie) => (
                  <div key={movie.id} className="group relative">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden">
                      <img
                        src={movie.thumbnail}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition">
                            Bỏ yêu thích
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-semibold truncate">{movie.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{movie.relasedYear}</span>
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
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Đánh giá của tôi</h2>

              <div className="space-y-6">
                {recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-bold">
                            {review.movieTitle}
                          </h3>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={18}
                                className={
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300 dark:text-gray-600"
                                }
                              />
                            ))}
                            <span className="ml-2 font-semibold">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-gray-700 dark:text-gray-300">
                            {review.comment}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition">
                              <Heart size={18} />
                              <span>{review.likes} thích</span>
                            </button>
                            <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition">
                              Trả lời
                            </button>
                            <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition">
                              Chỉnh sửa
                            </button>
                          </div>

                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(review.date)}
                          </span>
                        </div>
                      </div>

                      <button className="ml-4 text-gray-400 hover:text-red-500">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
