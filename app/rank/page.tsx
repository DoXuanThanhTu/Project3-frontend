"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

// Interfaces
export interface Server {
  _id?: string;
  name: string;
  language?: "vietsub" | "thuyết minh" | "raw";
  quality?: "360p" | "480p" | "720p" | "1080p";
}

export interface Movie {
  _id?: string;
  franchise_id?: string;
  titles?: Record<string, string>; // { en: "Title", vi: "Tên phim" }
  description?: Record<string, string>; // { en: "Desc", vi: "Mô tả" }
  default_lang: string;
  type: "series" | "season" | "ova" | "movie" | "special";
  status: "ongoing" | "completed" | "upcoming";
  season_number?: number;
  total_episodes?: number;
  release_date?: string | Date;
  duration?: number;
  media?: {
    poster_url?: string;
    thumbnail_url?: string;
    banner_url?: string;
    trailer_url?: string;
  };
  special?: string[];
  genres?: string[];
  name: string;
  slug: string;
  alternate_names?: string[];
  countries?: string;
  networks?: string;
  director?: string;
  production?: string;
  metadata?: { episode_current?: string; [key: string]: any };
  content_rating?: { rating?: string; [key: string]: any };
  servers?: Server[];
  gallery?: string[];
  cast?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  rating_count?: number;
}

export interface ViewStat {
  movie_id: string;
  date: string;
  count: number;
}

export interface MovieRanking {
  movieId: string;
  title: string;
  poster: string;
  views: number;
  seasonNumber?: number;
  slug?: string;
}

// Helpers
const getMovieTitle = (movie: Movie) => {
  if (!movie.titles) return movie.name;
  return (
    movie.titles[movie.default_lang] ||
    Object.values(movie.titles)[0] ||
    movie.name
  );
};

const API_URL = process.env.NEXT_PUBLIC_MOVIE_API_URL;
type FilterOption = "day" | "week" | "month" | "year" | "all" | "custom";

export default function MovieRankingList() {
  const today = new Date().toISOString().split("T")[0];

  const [rankings, setRankings] = useState<MovieRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>("day");

  const [showCustomDate, setShowCustomDate] = useState(false);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [appliedFromDate, setAppliedFromDate] = useState<string>("");
  const [appliedToDate, setAppliedToDate] = useState<string>("");

  const fetchRankings = async (from?: string, to?: string) => {
    setLoading(true);
    try {
      // 1. Lấy thống kê views
      const statsResponse = await axios.get<ViewStat[]>(
        `${API_URL}/views/stats`
      );
      const stats = statsResponse.data;

      // 2. Lọc theo thời gian
      let filteredStats = stats;
      if (from && to) {
        const fromD = new Date(from);
        const toD = new Date(to);
        filteredStats = stats.filter((item) => {
          const date = new Date(item.date);
          return date >= fromD && date <= toD;
        });
      } else {
        const now = new Date();
        filteredStats = stats.filter((item) => {
          const date = new Date(item.date);
          switch (filter) {
            case "day":
              return (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth() &&
                date.getDate() === now.getDate()
              );
            case "week": {
              const firstDayOfWeek = new Date(now);
              firstDayOfWeek.setDate(now.getDate() - now.getDay());
              const lastDayOfWeek = new Date(firstDayOfWeek);
              lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
              return date >= firstDayOfWeek && date <= lastDayOfWeek;
            }
            case "month":
              return (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth()
              );
            case "year":
              return date.getFullYear() === now.getFullYear();
            default:
              return true;
          }
        });
      }

      // 3. Tính tổng views mỗi movie
      const viewsMap: Record<string, number> = {};
      filteredStats.forEach((item) => {
        viewsMap[item.movie_id] = (viewsMap[item.movie_id] || 0) + item.count;
      });

      // 4. Lấy danh sách movie
      const moviesResponse = await axios.get(`${API_URL}/movies`);
      const moviesData: Movie[] = moviesResponse.data?.data?.items || [];

      // 5. Ghép views vào movie
      const moviesWithViews: MovieRanking[] = moviesData
        .filter((movie) => movie._id && viewsMap[movie._id])
        .map((movie) => ({
          movieId: movie._id!,
          title: getMovieTitle(movie),
          poster: movie.media?.poster_url || "",
          views: viewsMap[movie._id!] || 0,
          seasonNumber: movie.season_number,
          slug: movie.slug,
        }));

      // 6. Sắp xếp
      moviesWithViews.sort((a, b) => b.views - a.views);
      setRankings(moviesWithViews);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!appliedFromDate || !appliedToDate) {
      fetchRankings();
    }
    setShowCustomDate(filter === "custom");
  }, [filter]);

  const getRankingTitle = () => {
    if (appliedFromDate && appliedToDate)
      return `Bảng xếp hạng từ ${appliedFromDate} đến ${appliedToDate}`;
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    switch (filter) {
      case "day":
        return `Bảng xếp hạng ngày ${day}/${month}/${year}`;
      case "week": {
        const firstDayOfWeek = new Date();
        firstDayOfWeek.setDate(
          firstDayOfWeek.getDate() - firstDayOfWeek.getDay()
        );
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        return `Bảng xếp hạng tuần ${firstDayOfWeek.toLocaleDateString()} - ${lastDayOfWeek.toLocaleDateString()}`;
      }
      case "month":
        return `Bảng xếp hạng tháng ${month}/${year}`;
      case "year":
        return `Bảng xếp hạng năm ${year}`;
      case "all":
        return `Bảng xếp hạng tất cả thời gian`;
      case "custom":
        return appliedFromDate && appliedToDate
          ? `Bảng xếp hạng từ ${appliedFromDate} đến ${appliedToDate}`
          : "Bảng xếp hạng (Cụ thể)";
      default:
        return "Bảng xếp hạng";
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

  const isDateValid = () => {
    if (!fromDate || !toDate) return false;
    const f = new Date(fromDate);
    const t = new Date(toDate);
    const nowD = new Date(today);
    return f <= t && t <= nowD;
  };

  // if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 mt-20">
      <h2 className="text-2xl font-bold mb-4">{getRankingTitle()}</h2>

      {/* Filter tabs */}
      <div className="mb-6">
        <div className="hidden sm:flex space-x-4 border-b border-gray-700">
          {(
            ["day", "week", "month", "year", "all", "custom"] as FilterOption[]
          ).map((option) => {
            const label =
              option === "day"
                ? "Theo ngày"
                : option === "week"
                  ? "Theo tuần"
                  : option === "month"
                    ? "Tháng này"
                    : option === "year"
                      ? "Năm nay"
                      : option === "all"
                        ? "Tất cả"
                        : "Cụ thể";
            const isActive = filter === option;
            return (
              <button
                key={option}
                onClick={() => {
                  setFilter(option);
                  setAppliedFromDate("");
                  setAppliedToDate("");
                }}
                className={`pb-2 text-gray-200 hover:text-white transition ${
                  isActive
                    ? "border-b-2 border-blue-500 font-semibold"
                    : "border-b-2 border-transparent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Mobile dropdown */}
        <div className="sm:hidden w-40">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as FilterOption);
              setAppliedFromDate("");
              setAppliedToDate("");
            }}
            className="w-full border border-gray-600 bg-gray-800 text-gray-200 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
            <option value="all">Tất cả</option>
            <option value="custom">Cụ thể</option>
          </select>
        </div>
      </div>

      {/* Custom from-to only show for "Cụ thể" */}
      {showCustomDate && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-gray-200">Từ:</label>
            <input
              type="date"
              value={fromDate}
              max={today}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-600 bg-gray-800 text-gray-200 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-200">Đến:</label>
            <input
              type="date"
              value={toDate}
              max={today}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-600 bg-gray-800 text-gray-200 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            disabled={!isDateValid()}
            onClick={() => {
              setAppliedFromDate(fromDate);
              setAppliedToDate(toDate);
              fetchRankings(fromDate, toDate);
            }}
            className={`px-3 py-1 rounded-md text-white transition ${
              isDateValid()
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            Ranking Now
          </button>
        </div>
      )}

      {/* Ranking list */}
      <ul className="space-y-3">
        {rankings.length == 0 && (
          <div className="text-center py-8 mt-4">Chưa có dữ liệu xếp hạng</div>
        )}
        {rankings.map((movie, index) => (
          <Link key={movie.movieId} href={`/movie/${movie.slug}`}>
            <li className="flex items-center p-3 transition bg-gray-800 hover:bg-gray-700">
              <span className={`w-8 text-lg font-bold ${getRankColor(index)}`}>
                {index + 1}
              </span>
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded-md mx-4 shadow-md"
              />
              <div className="flex-1">
                <div className="text-lg font-medium text-gray-100">
                  {movie.title}
                </div>
                <div className="text-sm text-gray-400">
                  Views: {movie.views}
                </div>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
