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
  Globe,
  Hash,
  Users2,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ===== Types =====
interface Movie {
  _id: string;
  movieId: string;
  title:
    | string
    | {
        vi: string;
        en: string;
      };
  slug:
    | string
    | {
        vi: string;
        en: string;
      };
  description?:
    | string
    | {
        vi: string;
        en: string;
      }
    | null;
  thumbnail: string;
  poster: string;
  banner?: string;
  backdrop?: string;
  type: string;
  rating?: number;
  genres: Array<{
    _id: string;
    name:
      | string
      | {
          vi: string;
          en: string;
        };
    slug:
      | string
      | {
          vi: string;
          en: string;
        };
  }>;
  country?: string;
  year?: number;
  flags?: Array<{
    type: string;
    source: string;
    startAt: string;
    endAt: string;
    metadata?: {
      score?: number;
      reason?: string;
      priority?: number;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  storedViews?: {
    total?: number;
    daily?: number;
    weekly?: number;
  };
  totalEpisodes?: number;
  totalViews: number;
  totalDuration: number;
  uniqueViewers: number;
  avgWatchTime: number;
  engagementRate: number;
}

interface GenreRanking {
  genreId: string;
  genreName: string;
  genreSlug: string;
  totalViews: number;
  movieCount: number;
  avgViewsPerMovie: number;
  totalDuration: number;
}

interface CountryRanking {
  country: string;
  totalViews: number;
  movieCount: number;
  avgViewsPerMovie: number;
  totalDuration: number;
}

interface RankingCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  color: string;
  type: "movies" | "genres" | "countries";
}

interface PeriodInfo {
  name: string;
  startDate: string;
  endDate: string;
  isCustom: boolean;
}

// ===== Constants =====
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ===== Time Periods =====
const timePeriods = [
  { id: "day", name: "Hôm nay", label: "Hôm nay" },
  { id: "week", name: "Tuần này", label: "Tuần này" },
  { id: "month", name: "Tháng này", label: "Tháng này" },
  { id: "year", name: "Năm nay", label: "Năm nay" },
  { id: "custom", name: "Tùy chỉnh", label: "Tùy chỉnh" },
];

// ===== Ranking Categories =====
const rankingCategories: RankingCategory[] = [
  {
    id: "views",
    name: "Lượt Xem",
    description: "Phim có lượt xem cao nhất",
    icon: <Eye className="w-5 h-5" />,
    endpoint: "/rank/movies",
    color: "from-blue-500 to-cyan-500",
    type: "movies",
  },
  // {
  //   id: "duration",
  //   name: "Thời Gian Xem",
  //   description: "Phim có tổng thời gian xem nhiều nhất",
  //   icon: <Timer className="w-5 h-5" />,
  //   endpoint: "/rank/movies",
  //   color: "from-indigo-500 to-purple-500",
  //   type: "movies",
  // },
  // {
  //   id: "rating",
  //   name: "Đánh Giá",
  //   description: "Phim được đánh giá cao nhất",
  //   icon: <Star className="w-5 h-5" />,
  //   endpoint: "/ranki/movies",
  //   color: "from-yellow-500 to-amber-500",
  //   type: "movies",
  // },
  // {
  //   id: "unique",
  //   name: "Người Xem Duy Nhất",
  //   description: "Phim có nhiều người xem duy nhất nhất",
  //   icon: <Users2 className="w-5 h-5" />,
  //   endpoint: "/rank/movies",
  //   color: "from-green-500 to-emerald-500",
  //   type: "movies",
  // },
  // {
  //   id: "genres",
  //   name: "Thể Loại",
  //   description: "Thể loại được xem nhiều nhất",
  //   icon: <Hash className="w-5 h-5" />,
  //   endpoint: "/ranking/genres",
  //   color: "from-pink-500 to-rose-500",
  //   type: "genres",
  // },
  // {
  //   id: "countries",
  //   name: "Quốc Gia",
  //   description: "Quốc gia có phim được xem nhiều nhất",
  //   icon: <Globe className="w-5 h-5" />,
  //   endpoint: "/ranking/countries",
  //   color: "from-orange-500 to-red-500",
  //   type: "countries",
  // },
];

// ===== Components =====

// Movie Card Component
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

  const getCategoryValue = (movie: Movie, category: string) => {
    switch (category) {
      case "views":
        return `${movie.totalViews?.toLocaleString() || "0"} lượt xem`;
      case "duration": {
        const hours = Math.floor((movie.totalDuration || 0) / 3600);
        const minutes = Math.floor(((movie.totalDuration || 0) % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }
      case "rating":
        return `${(movie.rating || 0)?.toFixed(1)}/10`;
      case "unique":
        return `${movie.uniqueViewers?.toLocaleString() || "0"} người xem`;
      default:
        return `${movie.totalViews?.toLocaleString() || "0"} lượt xem`;
    }
  };

  // Lấy thông tin từ cấu trúc dữ liệu mới
  const getMovieTitle = () => {
    if (typeof movie.title === "string") return movie.title;
    return movie.title?.vi || movie.title?.en || "Không có tiêu đề";
  };

  const getMovieSlug = () => {
    if (typeof movie.slug === "string") return movie.slug;
    return movie.slug?.vi || movie.slug?.en || "";
  };

  const getGenreNames = () => {
    if (!movie.genres || !Array.isArray(movie.genres)) return [];
    return movie.genres
      .map((genre) => {
        if (typeof genre.name === "string") return genre.name;
        return genre.name?.vi || genre.name?.en || "";
      })
      .filter((name) => name);
  };

  const getDescription = () => {
    if (!movie.description) return null;
    if (typeof movie.description === "string") return movie.description;
    return movie.description?.vi || movie.description?.en || null;
  };

  const posterUrl = movie.poster || movie.thumbnail || "";
  const movieTitle = getMovieTitle();
  const movieSlug = getMovieSlug();
  const genreNames = getGenreNames();
  const movieDescription = getDescription();

  // Kiểm tra xem có flags hot/featured không
  const hasHotFlag = movie.flags?.some((flag) => flag.type === "hot");
  const hasFeaturedFlag = movie.flags?.some((flag) => flag.type === "featured");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/30"
    >
      <Link href={`/movie/${movieSlug}`}>
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

            {/* Badges */}
            <div className="absolute top-1 left-1 flex flex-col gap-1"></div>

            {movie.totalEpisodes && movie.totalEpisodes > 0 && (
              <span className="absolute bottom-1 right-1 bg-gray-900/80 text-white text-xs px-2 py-0.5 rounded">
                {movie.totalEpisodes} tập
              </span>
            )}
          </div>

          {/* Movie Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg truncate group-hover:text-blue-400 transition-colors">
                {movieTitle}
              </h3>
              {hasHotFlag && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                  Hot
                </span>
              )}
              {hasFeaturedFlag && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                  Nổi bật
                </span>
              )}
              {movie.type && (
                <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded">
                  {movie.type === "SERIES"
                    ? "Series"
                    : movie.type === "TV"
                    ? "TV"
                    : movie.type === "SHORT"
                    ? "Phim ngắn"
                    : movie.type}
                </span>
              )}
              {movie.year && (
                <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full">
                  {movie.year}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-2">
              {/* <div className="flex items-center gap-1 text-sm text-gray-400">
                {getCategoryValue(movie, category)}
              </div> */}
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span>{(movie.rating || 0)?.toFixed(1)}</span>
              </div>
              {/* <div className="flex items-center gap-1 text-sm text-gray-400">
                <Eye className="w-3 h-3" />
                <span>
                  {movie.uniqueViewers?.toLocaleString() || "0"} người xem
                </span>
              </div> */}
              {/* {movie.storedViews?.total && (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {movie.storedViews.total.toLocaleString()} lượt (tổng)
                  </span>
                </div>
              )} */}
            </div>

            {/* Genres */}
            {genreNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {genreNames.slice(0, 3).map((genreName, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-300"
                  >
                    {genreName}
                  </span>
                ))}
                {genreNames.length > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-400">
                    +{genreNames.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {movieDescription && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {movieDescription}
              </p>
            )}
          </div>

          {/* Additional Metrics */}
          <div className="shrink-0 hidden lg:block">
            <div className="flex flex-col items-end gap-2">
              {/* {movie.avgWatchTime > 0 && (
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.floor(movie.avgWatchTime)}s/xem
                  </div>
                  <div className="text-xs text-gray-400">Thời gian TB</div>
                </div>
              )}
              {movie.engagementRate > 0 && (
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {movie.engagementRate.toFixed(2)} lượt/người
                  </div>
                  <div className="text-xs text-gray-400">Tương tác TB</div>
                </div>
              )} */}
              {movie.storedViews && (
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {movie.storedViews.daily?.toLocaleString() || "0"} Lượt xem
                  </div>
                  <div className="text-xs text-gray-400">hôm nay</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Genre Card Component
const GenreRankingCard: React.FC<{
  genre: GenreRanking;
  rank: number;
}> = ({ genre, rank }) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500 to-amber-500";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-300";
    if (rank === 3) return "bg-gradient-to-r from-amber-700 to-amber-600";
    return "bg-gradient-to-r from-gray-800 to-gray-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-600 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankColor(
              rank
            )}`}
          >
            {rank}
          </div>
          <div>
            <h4 className="font-bold text-lg group-hover:text-pink-400 transition-colors">
              {genre.genreName}
            </h4>
            <p className="text-sm text-gray-400">{genre.movieCount} phim</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">
            {genre.totalViews.toLocaleString()} lượt xem
          </div>
          <div className="text-sm text-gray-400">
            {(genre.totalDuration / 3600).toFixed(0)} giờ xem
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Country Card Component
const CountryRankingCard: React.FC<{
  country: CountryRanking;
  rank: number;
}> = ({ country, rank }) => {
  const getFlagEmoji = (countryCode: string) => {
    // Simple flag emoji mapping (you might want to use a proper library)
    const flags: Record<string, string> = {
      "việt nam": "🇻🇳",
      vietnam: "🇻🇳",
      vn: "🇻🇳",
      "trung quốc": "🇨🇳",
      china: "🇨🇳",
      cn: "🇨🇳",
      "hàn quốc": "🇰🇷",
      korea: "🇰🇷",
      kr: "🇰🇷",
      "nhật bản": "🇯🇵",
      japan: "🇯🇵",
      jp: "🇯🇵",
      mỹ: "🇺🇸",
      usa: "🇺🇸",
      us: "🇺🇸",
      "thái lan": "🇹🇭",
      thailand: "🇹🇭",
      th: "🇹🇭",
    };

    return flags[country.country.toLowerCase()] || "🏴";
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500 to-amber-500";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-300";
    if (rank === 3) return "bg-gradient-to-r from-amber-700 to-amber-600";
    return "bg-gradient-to-r from-gray-800 to-gray-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-600 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankColor(
              rank
            )}`}
          >
            {rank}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFlagEmoji(country.country)}</span>
            <div>
              <h4 className="font-bold text-lg group-hover:text-orange-400 transition-colors">
                {country.country}
              </h4>
              <p className="text-sm text-gray-400">{country.movieCount} phim</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">
            {country.totalViews.toLocaleString()} lượt xem
          </div>
          <div className="text-sm text-gray-400">
            Trung bình {Math.round(country.avgViewsPerMovie).toLocaleString()}
            /phim
          </div>
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
  const [period, setPeriod] = useState("week");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [sortBy, setSortBy] = useState("views");
  const [sortOrder, setSortOrder] = useState("desc");
  const [genre, setGenre] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [maxRating, setMaxRating] = useState("10");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<GenreRanking[]>([]);
  const [countries, setCountries] = useState<CountryRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodInfo, setPeriodInfo] = useState<PeriodInfo | null>(null);

  // Fetch ranking data
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        period,
        sortBy,
        sortOrder,
        minRating,
        maxRating,
      };

      if (period === "custom") {
        if (fromDate && toDate) {
          params.from = fromDate;
          params.to = toDate;
        }
      }

      if (activeCategory.type === "movies") {
        if (genre) params.genre = genre;
        if (country) params.country = country;
        if (type) params.type = type;
      }

      const response = await axios.get(`${API_URL}${activeCategory.endpoint}`, {
        params,
      });

      if (response.data.success) {
        const data = response.data.data;
        setPeriodInfo(data.period);

        if (activeCategory.type === "movies") {
          setMovies(data.ranking || []);
          setGenres([]);
          setCountries([]);
        } else if (activeCategory.type === "genres") {
          setGenres(data.ranking || []);
          setMovies([]);
          setCountries([]);
        } else if (activeCategory.type === "countries") {
          setCountries(data.ranking || []);
          setMovies([]);
          setGenres([]);
        }
      }
    } catch (error) {
      console.error("Error fetching ranking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    activeCategory,
    period,
    fromDate,
    toDate,
    sortBy,
    sortOrder,
    genre,
    country,
    type,
    minRating,
    maxRating,
  ]);

  // Get top 3 for featured section
  const featuredItems = useMemo(() => {
    if (activeCategory.type === "movies") {
      return movies.slice(0, 3);
    } else if (activeCategory.type === "genres") {
      return genres.slice(0, 3);
    } else {
      return countries.slice(0, 3);
    }
  }, [movies, genres, countries, activeCategory]);

  const statsData = [
    {
      title: "Tổng lượt xem",
      value: `${movies
        .reduce((sum, m) => sum + m.totalViews, 0)
        .toLocaleString()}`,
      icon: <Eye className="w-6 h-6 text-blue-500" />,
      change: 12.5,
      color: "bg-blue-500/20",
    },
    {
      title: "Phim trong bảng xếp hạng",
      value: movies.length.toLocaleString(),
      icon: <Film className="w-6 h-6 text-green-500" />,
      change: 5.2,
      color: "bg-green-500/20",
    },
    {
      title: "Người xem duy nhất",
      value: `${movies
        .reduce((sum, m) => sum + m.uniqueViewers, 0)
        .toLocaleString()}`,
      icon: <Users className="w-6 h-6 text-purple-500" />,
      change: 8.7,
      color: "bg-purple-500/20",
    },
    {
      title: "Đánh giá trung bình",
      value:
        movies.length > 0
          ? (
              movies.reduce((sum, m) => sum + (m.rating || 0), 0) /
              movies.length
            ).toFixed(1)
          : "0.0",
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      change: 1.3,
      color: "bg-yellow-500/20",
    },
  ];

  const getRankingTitle = () => {
    if (periodInfo?.isCustom) {
      const start = new Date(periodInfo.startDate).toLocaleDateString("vi-VN");
      const end = new Date(periodInfo.endDate).toLocaleDateString("vi-VN");
      return `Bảng xếp hạng từ ${start} đến ${end}`;
    }

    switch (periodInfo?.name) {
      case "day":
        return "Bảng xếp hạng hôm nay";
      case "week":
        return "Bảng xếp hạng tuần này";
      case "month":
        return "Bảng xếp hạng tháng này";
      case "year":
        return "Bảng xếp hạng năm nay";
      default:
        return "Bảng xếp hạng";
    }
  };

  const isDateValid = () => {
    if (!fromDate || !toDate) return false;
    const f = new Date(fromDate);
    const t = new Date(toDate);
    const nowD = new Date(today);
    return f <= t && t <= nowD;
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
            className="text-center mb-2"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
              <h1 className="text-5xl font-bold bg-linear-to-r from-yellow-500 to-amber-500 bg-clip-text text-yellow-500">
                Bảng Xếp Hạng
              </h1>
            </div>
            {/* <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Khám phá những bộ phim, thể loại và quốc gia được yêu thích nhất
            </p> */}
          </motion.div>

          {/* Stats Overview */}
          {activeCategory.type === "movies" && movies.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {/* {statsData.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))} */}
            </motion.div>
          )}

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Categories */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
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
                          setSortBy(
                            category.id === "views"
                              ? "views"
                              : category.id === "duration"
                              ? "duration"
                              : category.id === "rating"
                              ? "rating"
                              : category.id === "unique"
                              ? "unique"
                              : "views"
                          );
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

                {/* Filters */}
                {activeCategory.type === "movies" && (
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-purple-500" />
                      Bộ lọc
                    </h3>

                    <div className="space-y-4">
                      {/* Sort Order */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Thứ tự sắp xếp
                        </label>
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          className="w-full border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="desc">Cao → Thấp</option>
                          <option value="asc">Thấp → Cao</option>
                        </select>
                      </div>

                      {/* Rating Filter */}
                      {/* <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Điểm từ
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={minRating}
                            onChange={(e) => setMinRating(e.target.value)}
                            className="w-full border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Đến
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={maxRating}
                            onChange={(e) => setMaxRating(e.target.value)}
                            className="w-full border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div> */}

                      {/* Type Filter */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Loại phim
                        </label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Tất cả</option>
                          <option value="MOVIE">Phim lẻ</option>
                          <option value="SERIES">Phim bộ</option>
                          <option value="SHORT">Phim ngắn</option>

                          <option value="TV_SHOW">TV Show</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Period Filter */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    Khoảng thời gian
                  </h3>

                  <div className="space-y-4">
                    {/* Period Selector */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Khoảng thời gian
                      </label>
                      <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {timePeriods.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Date Range */}
                    {period === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3"
                      >
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">Từ:</label>
                          <input
                            type="date"
                            value={fromDate}
                            max={today}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">Đến:</label>
                          <input
                            type="date"
                            value={toDate}
                            max={today}
                            onChange={(e) => setToDate(e.target.value)}
                            className="border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {!isDateValid() && (
                          <p className="text-red-500 text-sm">
                            Ngày không hợp lệ
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
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
                  {activeCategory.type === "movies" && (
                    <span className="ml-2 px-2 py-1 bg-gray-800 rounded-lg text-xs">
                      Sắp xếp:{" "}
                      {sortOrder === "desc" ? "Cao → Thấp" : "Thấp → Cao"}
                    </span>
                  )}
                </div>
              </div>

              {/* Featured Top 3 */}
              {/* {!loading && featuredItems.length > 0 && (
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
                    {movies.map((item, index) => {
                      if (activeCategory.type === "movies") {
                        return (
                          <MovieRankingCard
                            key={index}
                            movie={item as Movie}
                            rank={index + 1}
                            category={activeCategory.id}
                          />
                        );
                      } else if (activeCategory.type === "genres") {
                        return (
                          <GenreRankingCard
                            key={(item as GenreRanking).genreId}
                            genre={item as GenreRanking}
                            rank={index + 1}
                          />
                        );
                      } else {
                        return (
                          <CountryRankingCard
                            key={(item as CountryRanking).country}
                            country={item as CountryRanking}
                            rank={index + 1}
                          />
                        );
                      }
                    })}
                  </div>
                </motion.div>
              )} */}

              {/* Full Ranking List */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {activeCategory.name} - Top{" "}
                    {activeCategory.type === "movies" ? "100" : "50"}
                  </h2>
                  {periodInfo && (
                    <span className="text-gray-400">
                      Khoảng thời gian:{" "}
                      {new Date(periodInfo.startDate).toLocaleDateString(
                        "vi-VN"
                      )}{" "}
                      -{" "}
                      {new Date(periodInfo.endDate).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {activeCategory.type === "movies" ? (
                      <motion.div
                        key="movies"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {movies.slice(0, 100).map((movie, index) => (
                          <div key={movie.movieId} className="relative">
                            <MovieRankingCard
                              movie={movie}
                              rank={index + 1}
                              category={activeCategory.id}
                            />
                          </div>
                        ))}
                      </motion.div>
                    ) : activeCategory.type === "genres" ? (
                      <motion.div
                        key="genres"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        {genres.slice(0, 50).map((genre, index) => (
                          <GenreRankingCard
                            key={genre.genreId}
                            genre={genre}
                            rank={index + 1}
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="countries"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        {countries.slice(0, 50).map((country, index) => (
                          <CountryRankingCard
                            key={country.country}
                            country={country}
                            rank={index + 1}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Empty State */}
                {!loading &&
                  ((activeCategory.type === "movies" && movies.length === 0) ||
                    (activeCategory.type === "genres" && genres.length === 0) ||
                    (activeCategory.type === "countries" &&
                      countries.length === 0)) && (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
