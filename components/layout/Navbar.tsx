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
import UserMenu from "./UserMenu";
import debounce from "lodash/debounce";
import axios from "axios";
import useAuthStore from "@/stores/auth.store";
import api from "@/lib/api";
import MobileUserMenu from "./MobileUserMenu";

/* ================== TYPES ================== */
interface Movie {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  poster?: string;
  year?: number;
  rating?: number;
  type?: string;
  genres?: { id: string; title: string }[];
}

interface Genre {
  id: string;
  title: string;
  slug: string;
  description?: string;
}

interface SearchResponse {
  success: boolean;
  data: Movie[];
}

interface GenreResponse {
  success: boolean;
  data: Genre[];
}

const MOVIE_API_URL = process.env.NEXT_PUBLIC_MOVIE_API_URL;

/* ================== COMPONENT ================== */
const Navbar = () => {
  const router = useRouter();

  /* ===== Zustand Auth ===== */
  const { user, logout, getCurrentUser } = useAuthStore();
  /* ===== UI State ===== */
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ===== Search State ===== */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [totalSearchResults, setTotalSearchResults] = useState(0);

  /* ===== Genre State ===== */
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  /* ================== EFFECTS ================== */

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () =>
      window.innerWidth >= 1024 && setMobileOpen(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  /* ================== GENRES ================== */
  useEffect(() => {
    const loadGenres = async () => {
      try {
        setIsLoadingGenres(true);
        const res = await api.get("/genre");
        const data: GenreResponse = await res.data;
        if (data.success) setGenres(data.data);
      } finally {
        setIsLoadingGenres(false);
      }
    };
    loadGenres();
  }, []);
  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  /* ================== SEARCH ================== */
  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/movie/search/${encodeURIComponent(q)}`);
        const data: SearchResponse = res.data;
        if (data.success) {
          setSearchResults(data.data);
          setTotalSearchResults(data.data.length);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
    setShowSearchResults(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSearchResults(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };
  const handleResultClick = (movie: Movie) => {
    router.push(`/movie/${movie.slug}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };
  const formatRating = (r?: number) => (r ? r.toFixed(1) : "0.0");
  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  /* ================== RENDER ================== */
  return (
    <nav
      className={`relative mb-16 md:fixed w-full transition-all duration-200 text-gray-100 z-50 ${
        scrolled
          ? "bg-linear-to-r from-gray-900/95 to-gray-800/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      {/* ================= DESKTOP ================= */}
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
              <div className="absolute top-full left-0 mt-2 w-96 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl z-50 max-h-125 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">
                      Hiển thị {Math.min(searchResults.length, 5)} /{" "}
                      {totalSearchResults} kết quả cho &quot;{searchQuery}&quot;
                    </span>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-100">
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
                          <div className="relative w-16 h-20 shrink-0 rounded overflow-hidden">
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
                                  • {movie.genres[0]?.title}
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
                          {genre.title}
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
          <UserMenu />
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3">
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>

        <Link href="/" className="font-bold text-white">
          SoranoHaru
        </Link>

        <Search />
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-gray-900 p-4 space-y-3 flex flex-col">
          <Link href="/category/phim-le">Phim Lẻ</Link>
          <Link href="/category/phim-bo">Phim Bộ</Link>
          <MobileUserMenu />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
