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
  Tv,
  Music,
  Gamepad2,
  Heart,
  Ghost,
  Sparkles,
  Drama,
  History,
  Camera,
  Compass,
  Globe,
  Rocket,
  Sword,
  Zap,
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

/* ================== GENRE ICON MAPPING ================== */
// const getGenreIcon = (genreTitle: string) => {
//   const lowerTitle = genreTitle.toLowerCase();

//   const iconMap: { [key: string]: JSX.Element } = {
//     "hành động": <Sword className="w-5 h-5" />,
//     "phiêu lưu": <Compass className="w-5 h-5" />,
//     "hoạt hình": <Sparkles className="w-5 h-5" />,
//     hài: <Gamepad2 className="w-5 h-5" />,
//     "tâm lý": <Heart className="w-5 h-5" />,
//     "kinh dị": <Ghost className="w-5 h-5" />,
//     "gia đình": <Drama className="w-5 h-5" />,
//     fantasy: <Sparkles className="w-5 h-5" />,
//     "lịch sử": <History className="w-5 h-5" />,
//     "khoa học viễn tưởng": <Rocket className="w-5 h-5" />,
//     "viễn tưởng": <Rocket className="w-5 h-5" />,
//     "âm nhạc": <Music className="w-5 h-5" />,
//     "bí ẩn": <Camera className="w-5 h-5" />,
//     "lãng mạn": <Heart className="w-5 h-5" />,
//     "tình cảm": <Heart className="w-5 h-5" />,
//     "giật gân": <Zap className="w-5 h-5" />,
//     "tài liệu": <Globe className="w-5 h-5" />,
//   };

//   // Tìm kiếm từ khóa trong tiêu đề
//   for (const [key, icon] of Object.entries(iconMap)) {
//     if (lowerTitle.includes(key)) {
//       return icon;
//     }
//   }

//   return <Film className="w-5 h-5" />;
// };

const getGenreColor = (genreTitle: string) => {
  const colors = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-violet-500 to-purple-500",
    "from-rose-500 to-pink-500",
    "from-sky-500 to-blue-500",
    "from-lime-500 to-green-500",
    "from-amber-500 to-orange-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-cyan-500",
    "from-rose-500 to-red-500",
  ];

  let hash = 0;
  for (let i = 0; i < genreTitle.length; i++) {
    hash = genreTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

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
  const genreRef = useRef<HTMLDivElement>(null);

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
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
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
                      Hiển thị {Math.min(searchResults.length, 3)} /{" "}
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
                    searchResults.slice(0, 3).map((movie) => (
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
            href="/type/movie"
            className="hover:text-blue-400 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Phim Lẻ
          </Link>
          <Link
            href="/type/series"
            className="hover:text-blue-400 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Phim Bộ
          </Link>
          <Link
            href="/rank"
            className="hover:text-blue-400 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Xem nhiều
          </Link>

          {/* Genres Dropdown */}
          {/* Genres Dropdown */}
          <div className="relative" ref={genreRef}>
            <button
              onClick={() => toggleMenu("theloai")}
              className="flex items-center gap-1 px-3 py-2 rounded-lg
      hover:text-blue-400 hover:bg-white/5 transition"
            >
              Thể loại
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openMenu === "theloai" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openMenu === "theloai" && (
              <div
                className="
        absolute left-1/2 -translate-x-1/2 mt-2
        w-[360px] sm:w-[420px] md:w-[480px]
        bg-gray-900/95 backdrop-blur-xl
        border border-gray-700 rounded-xl
        shadow-2xl p-4 z-50
      "
              >
                {/* ===== Loading ===== */}
                {isLoadingGenres ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-9 rounded-lg bg-gray-800" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* ===== Genre List ===== */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {genres.slice(0, 12).map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/genre/${genre.slug}`}
                          onClick={() => setOpenMenu(null)}
                          className="
                  flex items-center justify-center
                  rounded-lg px-3 py-2 text-sm font-medium
                  bg-gray-800/60 text-gray-200
                  hover:bg-gray-700/70 hover:text-blue-400
                  transition
                "
                        >
                          {genre.title}
                        </Link>
                      ))}
                    </div>

                    {/* ===== View All ===== */}
                    {genres.length > 12 && (
                      <div className="mt-4 pt-3 border-t border-gray-800">
                        <Link
                          href="/the-loai"
                          onClick={() => setOpenMenu(null)}
                          className="
                  flex items-center justify-center gap-2
                  rounded-lg py-2 text-sm
                  bg-gray-800 hover:bg-gray-700
                  text-gray-300 hover:text-white
                  transition
                "
                        >
                          Xem tất cả {genres.length} thể loại
                          <ChevronDown className="w-4 h-4 rotate-90" />
                        </Link>
                      </div>
                    )}
                  </>
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
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-white/5"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>

        <Link href="/" className="font-bold text-white text-lg">
          SoranoHaru
        </Link>

        <button
          onClick={() => setShowSearchResults(true)}
          className="p-2 rounded-lg hover:bg-white/5"
        >
          <Search />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 p-4 space-y-2 h-max">
          <Link
            href="/type/movie"
            className="block px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Phim Lẻ
          </Link>
          <Link
            href="/type/series"
            className="block px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Phim Bộ
          </Link>
          {/* <div className="px-4 py-2">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Thể loại
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {genres.slice(0, 6).map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGenreColor(
                      genre.title
                    )} flex items-center justify-center mb-2`}
                  >
                    <div className="text-white">
                      {getGenreIcon(genre.title)}
                    </div>
                  </div>
                  <span className="text-xs text-center text-gray-300">
                    {genre.title}
                  </span>
                </Link>
              ))}
            </div>
            {genres.length > 6 && (
              <Link
                href="/the-loai"
                onClick={() => setMobileOpen(false)}
                className="block text-center mt-3 px-4 py-2 text-sm text-blue-400 hover:text-blue-300"
              >
                Xem thêm {genres.length - 6} thể loại khác
              </Link>
            )}
          </div> */}
          <MobileUserMenu />
        </div>
      )}

      {/* Mobile Search Modal */}
      {showSearchResults && (
        <div className="lg:hidden fixed inset-0 bg-gray-900 z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Tìm kiếm</h2>
            <button
              onClick={() => setShowSearchResults(false)}
              className="p-2 rounded-lg hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phim, diễn viên..."
                className="bg-transparent outline-none w-full text-white"
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
              />
            </div>
          </form>

          {/* Search Results */}
          <div className="space-y-3">
            {searchResults.map((movie) => (
              <div
                key={movie.id}
                onClick={() => {
                  handleResultClick(movie);
                  setShowSearchResults(false);
                }}
                className="flex gap-3 p-3 rounded-lg bg-gray-800/50 active:bg-gray-700/50"
              >
                <div className="relative w-16 h-20 shrink-0 rounded overflow-hidden">
                  {movie.thumbnail ? (
                    <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      className="object-cover w-full h-full"
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
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    {movie.year && <span>{movie.year}</span>}
                    {movie.rating && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {formatRating(movie.rating)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
