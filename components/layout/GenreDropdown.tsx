"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface Genre {
  id: string;
  title: string;
  slug: string;
}

interface Props {
  genres: Genre[];
  isLoading: boolean;
  openMenu: string | null;
  setOpenMenu: (key: string | null) => void;
}

export default function GenreDropdown({
  genres,
  isLoading,
  openMenu,
  setOpenMenu,
}: Props) {
  const genreRef = useRef<HTMLDivElement>(null);

  // 🔹 Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpenMenu]);

  const isOpen = openMenu === "theloai";

  return (
    <div className="relative" ref={genreRef}>
      {/* ===== Button ===== */}
      <button
        onClick={() => setOpenMenu(isOpen ? null : "theloai")}
        className="flex items-center gap-1 px-3 py-2 rounded-lg
          text-gray-200 hover:text-blue-400
          hover:bg-white/5 transition"
      >
        Thể loại
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ===== Dropdown ===== */}
      {isOpen && (
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
          {isLoading ? (
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
                    href={`/the-loai/${genre.slug}`}
                    onClick={() => setOpenMenu(null)}
                    className="
                      relative flex items-center justify-center
                      rounded-lg px-3 py-2 text-sm font-medium
                      bg-gray-800/60 text-gray-200
                      hover:bg-gray-700/70 hover:text-blue-400
                      transition
                    "
                  >
                    {genre.title}

                    {/* underline hover */}
                    <span
                      className="
                        absolute bottom-1 left-2 right-2 h-0.5
                        bg-blue-500 opacity-0
                        group-hover:opacity-100
                        transition
                      "
                    />
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
  );
}
