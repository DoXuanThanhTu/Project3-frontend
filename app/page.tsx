"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/app.store";
import { useI18n } from "@/hooks/useI18n";
import Skeleton from "@/components/ui/Skeleton";
import MovieSlider from "@/components/movie/MovieSlider";
import { TopSlide } from "@/components/movie/TopSlide";
import { IMovieResponse } from "@/types/res.type";
import Navbar from "@/components/layout/Navbar";
import api from "@/lib/api";
import Link from "next/link";
import CommentList from "@/components/movie/CommentList";

export default function HomePage() {
  const t = useI18n();
  const { theme, lang } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<IMovieResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(api);
        const res = await api.get("/movie");

        setMovies(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError("Không thể tải danh sách phim");
        setMovies([]); // Đảm bảo không bị undefined
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderMovieSkeleton = () =>
    Array.from({ length: 8 }).map((_, idx) => (
      <div
        key={idx}
        className="cursor-pointer transition-transform hover:scale-105"
      >
        <Skeleton className="w-full aspect-2/3 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-3/4 mx-auto rounded" />
      </div>
    ));

  // ✅ Kiểm tra xem có dữ liệu phim không
  const hasMovies = movies && movies.length > 0;

  return (
    <div className="w-full antialiased flex flex-col min-h-screen">
      <Navbar />
      <div
        className={`transition-colors duration-300 -mt-16
        ${
          theme === "dark"
            ? "bg-gray-900 text-white"
            : theme === "orange"
            ? "bg-orange-50 text-orange-900"
            : "bg-white text-gray-900"
        }`}
      >
        {/* Banner TopSlide */}
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <TopSlide movies={hasMovies ? movies : []} />
        )}

        <div className="max-w-6xl mx-auto p-4 mt-16">
          {/* Grid phim */}
          <h1 className="text-3xl font-bold mb-6">
            {t("movie_list") || "Danh sách phim"}
          </h1>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {loading ? (
              renderMovieSkeleton()
            ) : hasMovies ? (
              movies.map((movie, i) => (
                <Link key={`movie ${i}`} href={`/movie/${movie.slug}`}>
                  <div className="cursor-pointer transition-transform hover:scale-105">
                    <div className="bg-black aspect-2/3 overflow-hidden rounded-lg">
                      <img
                        src={movie.thumbnail || "/no_thumb.png"}
                        alt={movie.title || "No alt"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h2 className="mt-2 font-semibold text-center">
                      {movie.title || "Không có tiêu đề"}
                    </h2>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center py-8">
                Không có phim nào
              </div>
            )}
          </div>
          {/* Slider phim nổi bật - chỉ hiển thị khi có phim */}
          <MovieSlider
            title={t("featured_movies") || "Phim nổi bật"}
            movies={movies.slice(0, 10)}
          />

          {/* New Movies */}
          <MovieSlider title="New Movies" movies={movies.slice(0, 10)} />
          {/* Comment Section */}
          <CommentList />
        </div>
      </div>
    </div>
  );
}
