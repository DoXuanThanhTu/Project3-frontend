"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Sliders,
  X,
  Calendar,
  Globe,
  Film,
  Star,
  Play,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { debounce } from "lodash";
import MovieCard from "@/components/movie/MovieCard";
import Pagination from "@/components/common/Pagination";
import FilterSidebar from "@/components/common/FilterSidebar";
import axios from "axios";
import { IMovie } from "@/types/movie.type";

interface SearchResponse {
  success: boolean;
  data: any[];
  searchInfo?: {
    keyword: string;
    totalResults: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface FilterOptions {
  genres?: string[];
  countries?: string[];
  year?: number | null;
  minYear?: number;
  maxYear?: number;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Hàm format dữ liệu movie từ API
// const formatMovieData = (movie: any): IMovie => {
//   // Xử lý genres: có thể là string[] hoặc object[]
//   const genres = Array.isArray(movie.genres)
//     ? movie.genres.map((genre: any, index: number) => {
//         if (typeof genre === "string") {
//           return {
//             id: `genre-${index}`,
//             name: genre,
//             slug: genre.toLowerCase().replace(/\s+/g, "-"),
//           };
//         }
//         if (genre && typeof genre === "object") {
//           return {
//             id: genre.id || `genre-${index}`,
//             name: genre.name || "",
//             slug: genre.slug || "",
//           };
//         }
//         return {
//           id: `genre-${index}`,
//           name: String(genre),
//           slug: "",
//         };
//       })
//     : [];

//   return movie
// };

const MOVIE_API_URL = process.env.NEXT_PUBLIC_MOVIE_API_URL;

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isInitialMount = useRef(true);
  const limit = 24;

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(
      async (
        searchTerm: string,
        page: number = 1,
        filters: FilterOptions = {}
      ) => {
        if (isInitialMount.current) {
          isInitialMount.current = false;
          return;
        }

        if (!searchTerm.trim() && !Object.keys(filters).length) {
          setMovies([]);
          setTotalResults(0);
          return;
        }

        setIsLoading(true);
        setError(null);
        try {
          const params = new URLSearchParams();
          params.set("page", page.toString());
          params.set("limit", limit.toString());
          params.set("lang", "vi");

          // Thêm bộ lọc
          if (filters.genres?.length) {
            params.set("genres", filters.genres.join(","));
          }
          if (filters.countries?.length) {
            params.set("country", filters.countries.join(","));
          }
          if (filters.year) {
            params.set("year", filters.year.toString());
          }
          if (filters.type) {
            params.set("type", filters.type);
          }
          //   if (filters.sortBy) {
          //     params.set("sort_field", filters.sortBy);
          //     params.set("sort_type", filters.sortOrder || "desc");
          //   } else {
          //     params.set(
          //       "sort_field",
          //       searchTerm ? "relevance" : "modified.time"
          //     );
          //     params.set("sort_type", "desc");
          //   }

          const url = searchTerm.trim()
            ? `${MOVIE_API_URL}/search/${encodeURIComponent(
                searchTerm
              )}?${params.toString()}`
            : `${MOVIE_API_URL}/phim?${params.toString()}`;

          console.log("Fetching search URL:", url);

          const response = await fetch(url);
          const data: SearchResponse = await response.json();

          console.log("Search response:", data);

          if (data.success) {
            // Format dữ liệu trước khi set state
            // const formattedMovies = (data.data || []).map(formatMovieData);
            // console.log("Formatted movies:", formattedMovies);

            setMovies(data.data || []);
            setTotalResults(data.pagination?.total || 0);
            setTotalPages(data.pagination?.totalPages || 1);
            setCurrentPage(data.pagination?.page || 1);
          } else {
            setError("Có lỗi xảy ra khi tìm kiếm");
            setMovies([]);
          }
        } catch (error) {
          console.error("Search error:", error);
          setError("Không thể kết nối đến server");
          setMovies([]);
        } finally {
          setIsLoading(false);
        }
      },
      500
    ),
    [MOVIE_API_URL, limit]
  );

  // Load suggestions for search input
  const loadSuggestions = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        // Sử dụng endpoint suggestions nếu có, nếu không thì search thông thường
        const url = new URL(
          `${MOVIE_API_URL}/search?q=${encodeURIComponent(term)}&limit=5`
        );
        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.success) {
          // Đảm bảo suggestions là mảng string
          const suggestionsData = Array.isArray(data.data)
            ? data.data.map((item: any) => {
                if (typeof item === "string") return item;
                if (typeof item === "object" && item.title) return item.title;
                return String(item);
              })
            : [];
          setSuggestions(suggestionsData);
        }
      } catch (error) {
        console.error("Suggestions error:", error);
        // Fallback: nếu không có suggestions API, không làm gì cả
      }
    }, 300),
    [MOVIE_API_URL]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim()) {
      loadSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = searchInput.trim();
    if (trimmedInput) {
      const newUrl = `/search?q=${encodeURIComponent(trimmedInput)}`;
      router.push(newUrl);
      debouncedSearch(trimmedInput, 1, activeFilters);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    debouncedSearch(query, page, activeFilters);
  };

  // Apply filters
  const applyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    debouncedSearch(query, 1, filters);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
    debouncedSearch(query, 1, {});
  };

  // Initialize search on mount
  useEffect(() => {
    isInitialMount.current = true;

    // Cleanup function để clear debounce
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Search when query changes (including back button)
  useEffect(() => {
    if (query) {
      setSearchInput(query);
      debouncedSearch(query, 1, activeFilters);
    } else {
      setMovies([]);
      setTotalResults(0);
    }
  }, [query, debouncedSearch, activeFilters]);

  // Get active filter count
  const activeFilterCount = Object.values(activeFilters).filter((value) =>
    Array.isArray(value)
      ? value.length > 0
      : value !== undefined && value !== null
  ).length;

  // Hiển thị error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-red-400 mb-4">Lỗi</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                router.push("/search");
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {query ? `Tìm kiếm: "${query}"` : "Tìm kiếm phim"}
          </h1>
          <p className="text-gray-400">
            {totalResults > 0
              ? `Tìm thấy ${totalResults} kết quả${
                  query ? ` cho "${query}"` : ""
                }`
              : query
              ? "Không tìm thấy kết quả nào"
              : "Nhập từ khóa để bắt đầu tìm kiếm"}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm phim, diễn viên, đạo diễn..."
                className="w-full pl-12 pr-24 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang tìm..." : "Tìm kiếm"}
              </button>
            </div>
          </form>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchInput(suggestion);
                    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors lg:hidden"
                >
                  <Filter className="w-5 h-5" />
                  Bộ lọc
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Quick Filters */}
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-gray-400">Sắp xếp:</span>
                  <select
                    value={
                      activeFilters.sortBy ||
                      (query ? "relevance" : "modified.time")
                    }
                    onChange={(e) =>
                      applyFilters({ ...activeFilters, sortBy: e.target.value })
                    }
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Liên quan nhất</option>
                    <option value="modified.time">Mới nhất</option>
                    <option value="year">Năm sản xuất</option>
                    <option value="rating">Đánh giá cao</option>
                    <option value="views">Xem nhiều</option>
                  </select>

                  <button
                    onClick={() =>
                      applyFilters({
                        ...activeFilters,
                        sortOrder:
                          activeFilters.sortOrder === "desc" ? "asc" : "desc",
                      })
                    }
                    className="bg-gray-800 border border-gray-700 rounded-lg p-1.5 hover:bg-gray-700 transition-colors"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Xóa bộ lọc ({activeFilterCount})
                  </button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Đang tìm kiếm...</p>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && movies.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map((movie) => (
                    <MovieCard key={movie.id || movie.id} movie={movie} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!isLoading && movies.length === 0 && query && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-400 mb-6">
                  Không có phim nào phù hợp với từ khóa "{query}"
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <p className="text-sm text-gray-500">Gợi ý:</p>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Kiểm tra lại chính tả</li>
                    <li>• Thử từ khóa ngắn hơn hoặc khác</li>
                    <li>• Tìm kiếm với tên tiếng Anh</li>
                    <li>• Xem các phim đang trending</li>
                  </ul>
                  <button
                    onClick={() => router.push("/phim-hot")}
                    className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Xem phim đang hot
                  </button>
                </div>
              </div>
            )}

            {/* Empty State (No Search Yet) */}
            {!isLoading && !query && movies.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Film className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  Tìm kiếm phim yêu thích của bạn
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Nhập tên phim, diễn viên hoặc đạo diễn để tìm kiếm trong kho
                  dữ liệu phim phong phú của chúng tôi
                </p>

                {/* Popular Searches */}
                <div className="max-w-2xl mx-auto">
                  <h4 className="font-semibold mb-4 text-gray-300">
                    Tìm kiếm phổ biến:
                  </h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "Avengers",
                      "Loki",
                      "Harry Potter",
                      "Fast and Furious",
                      "One Piece",
                      "Trạng Tí",
                    ].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchInput(term);
                          router.push(`/search?q=${encodeURIComponent(term)}`);
                        }}
                        className="px-4 py-2 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors text-sm"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Sidebar */}
          <FilterSidebar
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            activeFilters={activeFilters}
            onApplyFilters={applyFilters}
          />
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setShowFilters(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-80 bg-gray-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <FilterSidebar
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              activeFilters={activeFilters}
              onApplyFilters={applyFilters}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
