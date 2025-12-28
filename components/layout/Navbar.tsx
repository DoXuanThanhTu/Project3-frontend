"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Search,
  User,
  Menu,
  X,
  Film,
  Calendar,
  Star,
  Play,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import UserMenu from "./UserMenu";
import debounce from "lodash/debounce";
import axios from "axios";

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

interface DecodedToken {
  id: string;
  username: string;
  avatar?: string;
  exp?: number;
}

interface Movie {
  id: string;
  title: string;
  slug: string;
  description?: string;
  poster?: string;
  thumbnail?: string;
  banner?: string;
  year?: number;
  country?: string[];
  type?: string;
  rating?: number;
  views?: number;
  genres?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface SearchResponse {
  success: boolean;
  data: Movie[];
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

interface GenreResponse {
  success: boolean;
  data: Genre[];
}
const MOVIE_API_URL = process.env.NEXT_PUBLIC_MOVIE_API_URL;

const Navbar = () => {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<DecodedToken | null>(null);

  // State cho search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [totalSearchResults, setTotalSearchResults] = useState(0);

  // State cho genres
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  // Refs
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Load genres từ API
  const loadGenres = useCallback(async () => {
    try {
      setIsLoadingGenres(true);
      const response = await fetch("/v1/api/genres?lang=vi");
      const data: GenreResponse = await response.json();
      if (data.success && data.data) {
        setGenres(data.data);
      }
    } catch (error) {
      console.error("Error loading genres:", error);
    } finally {
      setIsLoadingGenres(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setTotalSearchResults(0);
        return;
      }

      setIsSearching(true);
      try {
        const url = new URL(
          `${MOVIE_API_URL}/search/${encodeURIComponent(query)}`
        );
        const res = await axios.get(url.toString());
        console.log("Search response:", res.data);
        const data: SearchResponse = await res.data;
        if (data.success) {
          setSearchResults(data.data || []);
          setTotalSearchResults(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
    setShowSearchResults(true);
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load genres on mount
  useEffect(() => {
    loadGenres();
  }, [loadGenres]);

  // Auto-close mobile menu on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // User auth functions
  const getTokenFromCookie = () => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? match[1] : null;
  };

  const loadUserFromToken = useCallback(() => {
    const token = getTokenFromCookie();
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Token không hợp lệ", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      loadUserFromToken();
    }, 0);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") loadUserFromToken();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadUserFromToken]);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  // Format rating
  const formatRating = (rating?: number) => {
    return rating ? rating.toFixed(1) : "0.0";
  };

  // Handle click on search result
  const handleResultClick = (movie: Movie) => {
    router.push(`/movie/${movie.slug}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  // Handle view all results
  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  return (
    <nav
      className={`fixed w-full transition-all duration-200 text-gray-100 z-50 ${
        scrolled
          ? "bg-gradient-to-r from-gray-900/95 to-gray-800/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      {/* ===== DESKTOP ===== */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3 max-w-full mx-auto">
        {/* LEFT: Logo & Search */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="SoranoHaru"
              width={40}
              height={40}
              className="w-9 h-9 rounded-md"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-white text-lg">
                SoranoHaru
              </span>
              <span className="text-xs text-gray-400">Phim hay cả trời</span>
            </div>
          </Link>

          {/* Search with Results */}
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center gap-2 rounded-full bg-gray-800/70 px-4 py-2 text-sm text-gray-300 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200 w-80">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm phim, diễn viên..."
                  className="bg-transparent outline-none w-full text-gray-100 placeholder-gray-400"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                />
                {isSearching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && (
              <div className="absolute top-full left-0 mt-2 w-96 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl z-50 max-h-[500px] overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">
                      Hiển thị {Math.min(searchResults.length, 5)} /{" "}
                      {totalSearchResults} kết quả cho "{searchQuery}"
                    </span>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[400px]">
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="p-8 text-center text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Không tìm thấy kết quả phù hợp</p>
                    </div>
                  ) : (
                    searchResults.map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => handleResultClick(movie)}
                        className="p-3 hover:bg-gray-700/50 cursor-pointer border-b border-gray-700/50 last:border-b-0 transition-colors group"
                      >
                        <div className="flex gap-3">
                          <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden">
                            {movie.thumbnail ? (
                              <img
                                src={movie.thumbnail || "/no_thumb.png"}
                                alt={movie.title}
                                className="object-cover group-hover:scale-105 transition-transform w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <Film className="w-8 h-8 text-gray-500" />
                              </div>
                            )}
                            <div className="absolute bottom-1 left-1 bg-black/70 text-xs px-1 py-0.5 rounded">
                              {movie.type === "MOVIE" ? "Bộ" : "Lẻ"}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                              {movie.title}
                            </h3>

                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                              {movie.year && (
                                <>
                                  <Calendar className="w-3 h-3" />
                                  <span>{movie.year}</span>
                                </>
                              )}
                              <span>•</span>
                              <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-xs">
                                HD
                              </span>
                              {movie.type === "series" && (
                                <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-xs">
                                  Full
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">
                                  {formatRating(movie.rating)}
                                </span>
                              </div>
                              {movie.genres && movie.genres.length > 0 && (
                                <span className="text-xs text-gray-400 truncate">
                                  • {movie.genres[0]?.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="p-3 border-t border-gray-700 bg-gray-900/50">
                    <button
                      onClick={handleViewAllResults}
                      className="w-full py-2 text-center text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Xem tất cả {totalSearchResults} kết quả
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Menu */}
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/category/phim-le"
            className="hover:text-blue-400 transition-colors"
          >
            Phim Lẻ
          </Link>
          <Link
            href="/category/phim-bo"
            className="hover:text-blue-400 transition-colors"
          >
            Phim Bộ
          </Link>
          <Link href="/rank" className="hover:text-blue-400 transition-colors">
            Xem nhiều
          </Link>

          {/* Genres Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("theloai")}
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              Thể loại <ChevronDown className="w-4 h-4" />
            </button>
            {openMenu === "theloai" && (
              <div className="absolute left-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
                {isLoadingGenres ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : (
                  genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/the-loai/${genre.slug}`}
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Film className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <span className="font-medium text-white group-hover:text-blue-400">
                          {genre.name}
                        </span>
                        {genre.description && (
                          <p className="text-xs text-gray-400 truncate">
                            {genre.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: UserMenu */}
        <div className="relative">
          {user ? (
            <UserMenu />
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all font-medium shadow-lg hover:shadow-blue-500/25"
            >
              <User className="w-5 h-5" />
              <span className="hidden xl:inline">Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>

      {/* ===== MOBILE ===== */}
      <div className="flex lg:hidden items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-gray-300 hover:text-blue-400 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SoranoHaru"
              width={36}
              height={36}
              className="rounded-md"
            />
            <span className="font-semibold text-white">SoranoHaru</span>
          </Link>
        </div>

        {/* Mobile Search Trigger */}
        <button
          onClick={() => searchInputRef.current?.focus()}
          className="text-gray-300 hover:text-blue-400 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Mobile Search Input (Hidden by default, shows on focus) */}
        <div
          className="absolute top-full left-0 right-0 bg-gray-900 p-3 shadow-lg"
          style={{ display: "none" }}
        >
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm phim..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg outline-none"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 space-y-4 z-40 shadow-xl lg:hidden">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg outline-none"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {!user ? (
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg py-3 font-medium shadow-lg"
            >
              <User className="w-5 h-5" /> Đăng nhập
            </Link>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <Image
                  src={user.avatar || "/default-avatar.png"}
                  alt="avatar"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="font-semibold">{user.username}</p>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Mobile Navigation Links */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link
              href="/category/phim-le"
              className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              Phim Lẻ
            </Link>
            <Link
              href="/category/phim-bo"
              className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              Phim Bộ
            </Link>
            <Link
              href="/rank"
              className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              Xem nhiều
            </Link>
            <Link
              href="/xem-chung"
              className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              Xem Chung
            </Link>
          </div>

          {/* Mobile Genres */}
          <div className="pt-4 border-t border-gray-700">
            <h3 className="font-semibold mb-3 px-2">Thể loại</h3>
            <div className="grid grid-cols-3 gap-2">
              {genres.slice(0, 9).map((genre) => (
                <Link
                  key={genre.id}
                  href={`/the-loai/${genre.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="p-2 bg-gray-800/50 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-center text-xs"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Results (overlay) */}
      {showSearchResults && searchQuery && (
        <div
          className="fixed inset-0 bg-black/80 z-50 lg:hidden"
          onClick={() => setShowSearchResults(false)}
        >
          <div
            className="absolute top-0 left-0 right-0 bg-gray-900 m-4 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">
                  {searchResults.length} kết quả cho "{searchQuery}"
                </span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => {
                    handleResultClick(movie);
                    setMobileOpen(false);
                  }}
                  className="p-4 border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="relative w-20 h-28 rounded overflow-hidden flex-shrink-0">
                      {movie.poster ? (
                        <img
                          src={movie.thumbnail || "/no_thumb.png"}
                          alt={movie.title}
                          className="object-cover group-hover:scale-105 transition-transform w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <Film className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        {movie.year && (
                          <span className="text-sm text-gray-400">
                            {movie.year}
                          </span>
                        )}
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          HD
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">
                          {formatRating(movie.rating)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {searchResults.length > 0 && (
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={handleViewAllResults}
                  className="w-full py-3 text-center bg-blue-600 text-white rounded-lg font-medium"
                >
                  Xem tất cả {totalSearchResults} kết quả
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
