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
  genres?: { id: string; name: string }[];
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
  const { user, isAuthenticated, logout } = useAuthStore();
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

  const formatRating = (r?: number) => (r ? r.toFixed(1) : "0.0");

  /* ================== RENDER ================== */
  return (
    <nav
      className={`fixed z-50 w-full transition-all ${
        scrolled ? "bg-gray-900/95 backdrop-blur shadow" : "bg-transparent"
      }`}
    >
      {/* ================= DESKTOP ================= */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={40} height={40} />
          <span className="font-bold text-white">SoranoHaru</span>
        </Link>

        {/* Search */}
        <div className="relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center bg-gray-800 px-4 py-2 rounded-full w-80">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                className="bg-transparent outline-none text-white ml-2 w-full"
                placeholder="Tìm phim..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {isSearching && (
                <div className="w-4 h-4 border-b-2 border-white animate-spin" />
              )}
            </div>
          </form>

          {/* Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute mt-2 w-full bg-gray-800 rounded-lg">
              {searchResults.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  onClick={() => router.push(`/movie/${m.slug}`)}
                  className="p-3 hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex justify-between">
                    <span>{m.title}</span>
                    <span className="text-yellow-400">
                      {formatRating(m.rating)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="flex items-center gap-6 text-sm">
          <Link href="/category/phim-le">Phim Lẻ</Link>
          <Link href="/category/phim-bo">Phim Bộ</Link>

          {/* Genres */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu ? null : "genre")}
              className="flex items-center gap-1"
            >
              Thể loại <ChevronDown size={16} />
            </button>
            {openMenu === "genre" && (
              <div className="absolute mt-2 bg-gray-800 rounded-lg w-56">
                {genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/genre/${g.slug}`}
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    {g.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Auth */}
        {user ? (
          <UserMenu onLogout={handleLogout} />
        ) : (
          <Link
            href="/auth"
            className="px-4 py-2 bg-blue-600 rounded-full flex items-center gap-2"
          >
            <User size={18} /> Đăng nhập
          </Link>
        )}
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
        <div className="lg:hidden bg-gray-900 p-4 space-y-3">
          <Link href="/category/phim-le">Phim Lẻ</Link>
          <Link href="/category/phim-bo">Phim Bộ</Link>

          {user ? (
            <Link href="/auth" className="block bg-blue-600 text-center py-2">
              Đăng nhập
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full text-left text-red-400"
            >
              Đăng xuất
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
