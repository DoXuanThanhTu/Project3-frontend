"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Flame,
  TrendingUp,
  Star,
  Eye,
  Heart,
  Search,
  Clock,
  Calendar,
  TrendingDown,
  Film,
  Users,
  Zap,
  Crown,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ===== Types =====
interface Movie {
  id: string;
  _id?: string;
  title: string;
  name?: string;
  slug: string;
  description: string | null;
  poster: string;
  thumbnail: string;
  type: string;
  ratingAvg: number;
  ratingCount: number;
  views: number;
  favorites: number;
  duration: number;
  releaseYear: number;
  createdAt: string;
  updatedAt: string;
  genres: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  media?: {
    poster_url?: string;
    thumbnail_url?: string;
  };
  season_number?: number;
  total_episodes?: number;
}

interface SearchKeyword {
  id: string;
  keyword: string;
  count: number;
  lastSearched: string;
}

interface RankingCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  color: string;
  apiType: "movie" | "search";
}

interface ViewStat {
  movie_id: string;
  date: string;
  count: number;
}

// ===== Constants =====
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const MOVIE_API_URL =
  process.env.NEXT_PUBLIC_MOVIE_API_URL || "http://localhost:3000/api";

// ===== Time Periods =====
const timePeriods = [
  { id: "all", name: "Mọi thời đại" },
  { id: "today", name: "Hôm nay" },
  { id: "week", name: "Tuần này" },
  { id: "month", name: "Tháng này" },
  { id: "year", name: "Năm nay" },
];

const detailTimePeriods = [
  { id: "day", name: "Theo ngày" },
  { id: "week", name: "Theo tuần" },
  { id: "month", name: "Tháng này" },
  { id: "year", name: "Năm nay" },
  { id: "all", name: "Tất cả" },
  { id: "custom", name: "Cụ thể" },
];

type FilterOption = "day" | "week" | "month" | "year" | "all" | "custom";

// ===== Ranking Categories =====
const rankingCategories: RankingCategory[] = [
  {
    id: "trending",
    name: "Đang Hot",
    description: "Phim đang được xem nhiều nhất hiện tại",
    icon: <Flame className="w-5 h-5" />,
    endpoint: "/movies/ranking/trending",
    color: "from-orange-500 to-red-500",
    apiType: "movie",
  },
  {
    id: "views",
    name: "Lượt Xem",
    description: "Phim có lượt xem cao nhất",
    icon: <Eye className="w-5 h-5" />,
    endpoint: "/movies/ranking/views",
    color: "from-blue-500 to-cyan-500",
    apiType: "movie",
  },
  {
    id: "rating",
    name: "Đánh Giá",
    description: "Phim được đánh giá cao nhất",
    icon: <Star className="w-5 h-5" />,
    endpoint: "/movies/ranking/rating",
    color: "from-yellow-500 to-amber-500",
    apiType: "movie",
  },
  {
    id: "favorites",
    name: "Yêu Thích",
    description: "Phim được thêm vào danh sách yêu thích nhiều nhất",
    icon: <Heart className="w-5 h-5" />,
    endpoint: "/movies/ranking/favorites",
    color: "from-pink-500 to-rose-500",
    apiType: "movie",
  },
  {
    id: "recent",
    name: "Mới Nhất",
    description: "Phim mới được thêm gần đây",
    icon: <Clock className="w-5 h-5" />,
    endpoint: "/movies/ranking/recent",
    color: "from-green-500 to-emerald-500",
    apiType: "movie",
  },
  {
    id: "search",
    name: "Tìm Kiếm",
    description: "Từ khóa được tìm kiếm nhiều nhất",
    icon: <Search className="w-5 h-5" />,
    endpoint: "/search/ranking/keywords",
    color: "from-purple-500 to-violet-500",
    apiType: "search",
  },
  {
    id: "watchtime",
    name: "Thời Gian Xem",
    description: "Phim có tổng thời gian xem nhiều nhất",
    icon: <Film className="w-5 h-5" />,
    endpoint: "/movies/ranking/watchtime",
    color: "from-indigo-500 to-blue-500",
    apiType: "movie",
  },
  {
    id: "completion",
    name: "Hoàn Thành",
    description: "Phim có tỷ lệ xem hết cao nhất",
    icon: <TrendingUp className="w-5 h-5" />,
    endpoint: "/movies/ranking/completion",
    color: "from-teal-500 to-cyan-500",
    apiType: "movie",
  },
];

// ===== Components =====

// Movie Card Component
const MovieRankingCard: React.FC<{
  movie: Movie;
  rank: number;
  category: string;
}> = ({ movie, rank, category }) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-amber-500";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-300";
      case 3:
        return "bg-gradient-to-r from-amber-700 to-amber-600";
      default:
        return "bg-gradient-to-r from-gray-800 to-gray-700";
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-300" />;
    if (rank === 2) return <Trophy className="w-4 h-4 text-gray-300" />;
    if (rank === 3) return <Trophy className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs font-bold">{rank}</span>;
  };

  const getCategoryIcon = (category: string) => {
    const cat = rankingCategories.find((c) => c.id === category);
    return cat?.icon || <Eye className="w-4 h-4" />;
  };

  const getCategoryValue = (movie: Movie, category: string) => {
    switch (category) {
      case "views":
        return `${movie.views.toLocaleString()} lượt xem`;
      case "rating":
        return `${movie.ratingAvg}/10 (${movie.ratingCount} đánh giá)`;
      case "favorites":
        return `${movie.favorites.toLocaleString()} lượt thích`;
      case "recent":
        return new Date(movie.createdAt).toLocaleDateString("vi-VN");
      case "trending":
        return `${Math.floor(movie.views / 1000)}K lượt xem`;
      default:
        return `${movie.views.toLocaleString()} lượt xem`;
    }
  };

  const posterUrl =
    movie.poster ||
    movie.thumbnail ||
    movie.media?.poster_url ||
    movie.media?.thumbnail_url ||
    "";
  const movieTitle = movie.title || movie.name || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/30"
    >
      <Link href={`/movie/${movie.slug}`}>
        <div className="flex items-center p-4 space-x-4">
          {/* Rank Badge */}
          <div
            className={`shrink-0 w-10 h-10 rounded-full ${getRankColor(
              rank
            )} flex items-center justify-center text-white font-bold text-lg relative`}
          >
            {getRankIcon(rank)}
            {rank <= 3 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-linear-to-r from-yellow-500 to-amber-500 animate-pulse" />
              </div>
            )}
          </div>

          {/* Movie Poster */}
          <div className="shrink-0 w-16 h-24 rounded-lg overflow-hidden relative">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={movieTitle}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 64px) 100vw, 64px"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <Film className="w-8 h-8 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            {movie.type === "SERIES" || movie.type === "series" ? (
              <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                Series
              </span>
            ) : null}
            {movie.season_number ? (
              <span className="absolute top-1 right-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded">
                S{movie.season_number}
              </span>
            ) : null}
          </div>

          {/* Movie Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg truncate group-hover:text-blue-400 transition-colors">
                {movieTitle}
              </h3>
              <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full">
                {movie.releaseYear || new Date(movie.createdAt).getFullYear()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                {getCategoryIcon(category)}
                <span>{getCategoryValue(movie, category)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span>{movie.ratingAvg?.toFixed(1) || "N/A"}</span>
              </div>
              {movie.total_episodes ? (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <span>Tập: {movie.total_episodes}</span>
                </div>
              ) : null}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {movie.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.id}
                    className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-300"
                  >
                    {genre.name}
                  </span>
                ))}
                {movie.genres.length > 2 && (
                  <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-400">
                    +{movie.genres.length - 2}
                  </span>
                )}
              </div>
            ) : null}
          </div>

          {/* Trend Indicator */}
          <div className="shrink-0">
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-800 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">
                {/* +{Math.floor(Math.random() * 50) + 10}% */}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Keyword Card Component
const KeywordRankingCard: React.FC<{
  keyword: SearchKeyword;
  rank: number;
}> = ({ keyword, rank }) => {
  const getTrendIcon = (rank: number) => {
    if (rank <= 3) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (rank <= 10) return <TrendingUp className="w-4 h-4 text-blue-500" />;
    return <TrendingDown className="w-4 h-4 text-gray-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-600 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              rank <= 3
                ? "bg-linear-to-r from-yellow-500 to-amber-500 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            {rank}
          </div>
          <div>
            <h4 className="font-semibold group-hover:text-blue-400 transition-colors">
              {keyword.keyword}
            </h4>
            <p className="text-sm text-gray-400">
              {keyword.count.toLocaleString()} lượt tìm kiếm
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon(rank)}
          <span className="text-xs text-gray-400">
            {new Date(keyword.lastSearched).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  change: number;
  color: string;
}> = ({ title, value, icon, change, color }) => (
  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>{icon}</div>
      <span
        className={`text-sm font-medium ${
          change >= 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        {change >= 0 ? "+" : ""}
        {change}%
      </span>
    </div>
    <h3 className="text-2xl font-bold mb-2">{value}</h3>
    <p className="text-gray-400 text-sm">{title}</p>
  </div>
);

// ===== Main Page Component =====
export default function RankingPage() {
  const today = new Date().toISOString().split("T")[0];

  const [activeCategory, setActiveCategory] = useState(rankingCategories[0]);
  const [timePeriod, setTimePeriod] = useState("all");
  const [detailFilter, setDetailFilter] = useState<FilterOption>("day");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [appliedFromDate, setAppliedFromDate] = useState<string>("");
  const [appliedToDate, setAppliedToDate] = useState<string>("");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [keywords, setKeywords] = useState<SearchKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalMovies: 0,
    totalUsers: 0,
    avgRating: 0,
  });

  // Check if current category uses detailed filtering (views category)
  const useDetailFilter = activeCategory.id === "views";

  // Fetch ranking data
  const fetchData = async (from?: string, to?: string) => {
    setLoading(true);
    try {
      // Fetch movies based on category
      if (activeCategory.id === "search") {
        const response = await axios.get(
          `${API_URL}${activeCategory.endpoint}?period=${timePeriod}`
        );
        setKeywords(response.data.data || response.data);
        setMovies([]);
      } else if (
        useDetailFilter &&
        (from || to || appliedFromDate || appliedToDate)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {};
        if (detailFilter === "custom") {
          const fromD = from || appliedFromDate || fromDate;
          const toD = to || appliedToDate || toDate;
          if (fromD && toD) {
            params.fromDate = fromD;
            params.toDate = toD;
          }
        } else {
          params.period = detailFilter;
        }

        try {
          // Try to fetch from detailed stats endpoint
          const response = await axios.get(`${MOVIE_API_URL}/views/stats`, {
            params,
          });

          // If we get stats data, we need to process it
          if (Array.isArray(response.data)) {
            const stats = response.data;
            // Process stats to get movie rankings
            const viewsMap: Record<string, number> = {};
            stats.forEach((item: ViewStat) => {
              viewsMap[item.movie_id] =
                (viewsMap[item.movie_id] || 0) + item.count;
            });

            // Fetch movies
            const moviesResponse = await axios.get(`${MOVIE_API_URL}/movies`);
            const moviesData: Movie[] =
              moviesResponse.data?.data?.items || moviesResponse.data || [];

            // Merge views with movies
            const moviesWithViews: Movie[] = moviesData
              .filter(
                (movie) =>
                  (movie.id || movie._id) && viewsMap[movie.id || movie._id!]
              )
              .map((movie) => ({
                ...movie,
                id: movie.id || movie._id!,
                title: movie.title || movie.name || "",
                poster:
                  movie.poster ||
                  movie.thumbnail ||
                  movie.media?.poster_url ||
                  "",
                thumbnail: movie.thumbnail || movie.media?.thumbnail_url || "",
                views: viewsMap[movie.id || movie._id!] || 0,
                ratingAvg: movie.ratingAvg || 0,
                ratingCount: movie.ratingCount || 0,
                favorites: movie.favorites || 0,
                releaseYear:
                  movie.releaseYear ||
                  new Date(movie.createdAt || "").getFullYear(),
                genres: movie.genres || [],
              }));

            moviesWithViews.sort((a, b) => b.views - a.views);
            setMovies(moviesWithViews);
            setKeywords([]);
          }
        } catch (error) {
          console.error("Error fetching detailed stats:", error);
          // Fallback to regular endpoint
          const response = await axios.get(
            `${API_URL}${activeCategory.endpoint}?period=${detailFilter}`
          );
          setMovies(response.data.data || response.data);
          setKeywords([]);
        }
      } else {
        // Regular category with time period
        const response = await axios.get(
          `${API_URL}${activeCategory.endpoint}?period=${timePeriod}`
        );
        setMovies(response.data.data || response.data);
        setKeywords([]);
      }

      // Fetch overall stats
      const statsResponse = await axios.get(`${API_URL}/stats/overall`);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching ranking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory, timePeriod, detailFilter]);

  // Get top 3 for featured section
  const featuredItems = useMemo(() => {
    if (activeCategory.id === "search") {
      return keywords.slice(0, 3);
    }
    return movies.slice(0, 3);
  }, [movies, keywords, activeCategory]);

  const statsData = [
    {
      title: "Tổng lượt xem",
      value: `${(stats.totalViews / 1000000).toFixed(1)}M`,
      icon: <Eye className="w-6 h-6 text-blue-500" />,
      change: 12.5,
      color: "bg-blue-500/20",
    },
    {
      title: "Tổng số phim",
      value: stats.totalMovies.toLocaleString(),
      icon: <Film className="w-6 h-6 text-green-500" />,
      change: 5.2,
      color: "bg-green-500/20",
    },
    {
      title: "Người dùng",
      value: `${(stats.totalUsers / 1000).toFixed(1)}K`,
      icon: <Users className="w-6 h-6 text-purple-500" />,
      change: 8.7,
      color: "bg-purple-500/20",
    },
    {
      title: "Đánh giá trung bình",
      value: stats.avgRating.toFixed(1),
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      change: 1.3,
      color: "bg-yellow-500/20",
    },
  ];

  const getRankingTitle = () => {
    if (useDetailFilter && appliedFromDate && appliedToDate) {
      return `Bảng xếp hạng từ ${appliedFromDate} đến ${appliedToDate}`;
    }

    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    if (useDetailFilter) {
      switch (detailFilter) {
        case "day":
          return `Bảng xếp hạng ngày ${day}/${month}/${year}`;
        case "week": {
          const firstDayOfWeek = new Date();
          firstDayOfWeek.setDate(
            firstDayOfWeek.getDate() - firstDayOfWeek.getDay()
          );
          const lastDayOfWeek = new Date(firstDayOfWeek);
          lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
          return `Bảng xếp hạng tuần ${firstDayOfWeek.toLocaleDateString(
            "vi-VN"
          )} - ${lastDayOfWeek.toLocaleDateString("vi-VN")}`;
        }
        case "month":
          return `Bảng xếp hạng tháng ${month}/${year}`;
        case "year":
          return `Bảng xếp hạng năm ${year}`;
        case "all":
          return `Bảng xếp hạng tất cả thời gian`;
        case "custom":
          return "Bảng xếp hạng (Cụ thể)";
        default:
          return "Bảng xếp hạng";
      }
    } else {
      switch (timePeriod) {
        case "today":
          return `Bảng xếp hạng hôm nay - ${day}/${month}/${year}`;
        case "week":
          return `Bảng xếp hạng tuần này`;
        case "month":
          return `Bảng xếp hạng tháng này`;
        case "year":
          return `Bảng xếp hạng năm nay`;
        default:
          return `Bảng xếp hạng mọi thời đại`;
      }
    }
  };

  const isDateValid = () => {
    if (!fromDate || !toDate) return false;
    const f = new Date(fromDate);
    const t = new Date(toDate);
    const nowD = new Date(today);
    return f <= t && t <= nowD;
  };

  const handleApplyCustomDate = () => {
    if (isDateValid()) {
      setAppliedFromDate(fromDate);
      setAppliedToDate(toDate);
      fetchData(fromDate, toDate);
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-red-500";
      case 1:
        return "text-orange-400";
      case 2:
        return "text-yellow-400";
      case 3:
        return "text-yellow-300";
      case 4:
        return "text-yellow-200";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 to-black text-gray-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
              <h1 className="text-5xl font-bold bg-linear-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                Bảng Xếp Hạng
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Khám phá những bộ phim và từ khóa được yêu thích nhất, cập nhật
              liên tục theo thời gian thực
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {statsData.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Categories */}
            <div className="lg:w-1/4">
              <div className="sticky top-24">
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    Danh mục xếp hạng
                  </h3>
                  <div className="space-y-2">
                    {rankingCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveCategory(category);
                          // Reset filters when changing category
                          if (category.id !== "views") {
                            setDetailFilter("day");
                            setAppliedFromDate("");
                            setAppliedToDate("");
                          }
                        }}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                          activeCategory.id === category.id
                            ? `bg-linear-to-r ${category.color} text-white shadow-lg`
                            : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {category.icon}
                          <div>
                            <div className="font-semibold">{category.name}</div>
                            <div className="text-sm opacity-80">
                              {category.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Period Filter */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    Thời gian
                  </h3>

                  {useDetailFilter ? (
                    <>
                      {/* Desktop tabs for detailed filter */}
                      <div className="hidden sm:flex flex-col gap-2 mb-4">
                        {detailTimePeriods.map((period) => (
                          <button
                            key={period.id}
                            onClick={() => {
                              setDetailFilter(period.id as FilterOption);
                              setAppliedFromDate("");
                              setAppliedToDate("");
                            }}
                            className={`px-4 py-3 rounded-lg transition-all text-left ${
                              detailFilter === period.id
                                ? "bg-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            {period.name}
                          </button>
                        ))}
                      </div>

                      {/* Mobile dropdown for detailed filter */}
                      <div className="sm:hidden w-full mb-4">
                        <select
                          value={detailFilter}
                          onChange={(e) => {
                            setDetailFilter(e.target.value as FilterOption);
                            setAppliedFromDate("");
                            setAppliedToDate("");
                          }}
                          className="w-full border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {detailTimePeriods.map((period) => (
                            <option key={period.id} value={period.id}>
                              {period.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Custom date range */}
                      {detailFilter === "custom" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-3 mt-4"
                        >
                          <div className="flex flex-col gap-2">
                            <label className="text-gray-300">Từ:</label>
                            <input
                              type="date"
                              value={fromDate}
                              max={today}
                              onChange={(e) => setFromDate(e.target.value)}
                              className="border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-gray-300">Đến:</label>
                            <input
                              type="date"
                              value={toDate}
                              max={today}
                              onChange={(e) => setToDate(e.target.value)}
                              className="border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            disabled={!isDateValid()}
                            onClick={handleApplyCustomDate}
                            className={`w-full py-2 rounded-lg text-white transition ${
                              isDateValid()
                                ? "bg-blue-600 hover:bg-blue-500"
                                : "bg-gray-500 cursor-not-allowed"
                            }`}
                          >
                            Áp dụng
                          </button>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {timePeriods.map((period) => (
                        <button
                          key={period.id}
                          onClick={() => setTimePeriod(period.id)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            timePeriod === period.id
                              ? "bg-purple-600 text-white"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          {period.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Ranking Area */}
            <div className="lg:w-3/4">
              {/* Ranking Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{getRankingTitle()}</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <Filter className="w-4 h-4" />
                  <span>Đang xem: {activeCategory.name}</span>
                  {useDetailFilter && appliedFromDate && appliedToDate && (
                    <span className="ml-2 px-2 py-1 bg-gray-800 rounded-lg text-xs">
                      {appliedFromDate} → {appliedToDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Featured Top 3 */}
              {!loading && featuredItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-12"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                      Top 3 {activeCategory.name.toLowerCase()}
                    </h2>
                    <div
                      className={`px-4 py-2 rounded-lg bg-linear-to-r ${activeCategory.color}`}
                    >
                      <span className="font-bold">TOP RANKED</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredItems.map((item, index) =>
                      activeCategory.id === "search" ? (
                        <KeywordRankingCard
                          key={item.id}
                          keyword={item as SearchKeyword}
                          rank={index + 1}
                        />
                      ) : (
                        <MovieRankingCard
                          key={item.id}
                          movie={item as Movie}
                          rank={index + 1}
                          category={activeCategory.id}
                        />
                      )
                    )}
                  </div>
                </motion.div>
              )}

              {/* Full Ranking List */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {activeCategory.name} - Top 100
                  </h2>
                  <span className="text-gray-400">
                    Cập nhật: {new Date().toLocaleDateString("vi-VN")}
                  </span>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {activeCategory.id === "search" ? (
                      <motion.div
                        key="keywords"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        {keywords.slice(0, 100).map((keyword, index) => (
                          <KeywordRankingCard
                            key={keyword.id}
                            keyword={keyword}
                            rank={index + 1}
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="movies"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {movies.slice(0, 100).map((movie, index) => (
                          <div key={movie.id} className="relative">
                            <MovieRankingCard
                              movie={movie}
                              rank={index + 1}
                              category={activeCategory.id}
                            />
                            {/* Optional: Simple rank number for mobile */}
                            <div className="lg:hidden absolute top-4 left-4">
                              <span
                                className={`text-lg font-bold ${getRankColor(
                                  index
                                )}`}
                              >
                                {index + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Empty State */}
                {!loading &&
                  (activeCategory.id === "search"
                    ? keywords.length === 0
                    : movies.length === 0) && (
                    <div className="text-center py-12">
                      <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Không có dữ liệu
                      </h3>
                      <p className="text-gray-400">
                        Không tìm thấy dữ liệu xếp hạng cho danh mục này
                      </p>
                    </div>
                  )}
              </div>

              {/* Additional Info */}
              {!loading &&
                movies.length > 0 &&
                activeCategory.id !== "search" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-xl p-6">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Xu hướng xem
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Phim {movies[0]?.title || movies[0]?.name} đang dẫn đầu
                        với{" "}
                        {movies[1]?.views
                          ? Math.floor(
                              (movies[0].views - movies[1].views) / 1000
                            )
                          : "nhiều"}
                        K lượt xem nhiều hơn phim thứ 2
                      </p>
                    </div>
                    <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-xl p-6">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Đột phá
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {movies.find(
                          (m) => m.releaseYear && m.releaseYear >= 2023
                        )
                          ? `Phim mới nhất trong top 10: ${
                              movies.find(
                                (m) => m.releaseYear && m.releaseYear >= 2023
                              )?.title || movies[9]?.title
                            }`
                          : "Phim có lượt xem ổn định"}
                      </p>
                    </div>
                    <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-xl p-6">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Đánh giá cao
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Điểm đánh giá trung bình của top 10:{" "}
                        {(
                          movies
                            .slice(0, 10)
                            .reduce((acc, m) => acc + (m.ratingAvg || 0), 0) /
                          Math.min(10, movies.length)
                        ).toFixed(1)}
                        /10
                      </p>
                    </div>
                  </motion.div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
