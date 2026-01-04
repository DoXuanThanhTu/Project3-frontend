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
  const [featured_movies, setFeaturedMovies] = useState<IMovieResponse[]>([]);
  const [new_movies, setNewMovies] = useState<IMovieResponse[]>([]);
  const [hot_movies, setHotMovies] = useState<IMovieResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(api);
        const res = await api.get("/movie");
        const featuredMovies = await api.get("/flag/featured/movies");
        const newMovies = await api.get("/movie/new");
        const hotMovies = await api.get("/flag/hot/movies");
        setMovies(Array.isArray(res.data.data) ? res.data.data : []);
        setFeaturedMovies(
          Array.isArray(featuredMovies.data.data)
            ? featuredMovies.data.data
            : []
        );
        setNewMovies(
          Array.isArray(newMovies.data.data) ? newMovies.data.data : []
        );
        setHotMovies(
          Array.isArray(hotMovies.data.data) ? hotMovies.data.data : []
        );
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
            title={"Phim nổi bật"}
            movies={featured_movies.slice(0, 10)}
            // link="/movie/featured"
          />

          {/* New Movies */}
          <MovieSlider
            title="Phim mới"
            movies={new_movies.slice(0, 10)}
            // link="/movie/new"
          />
          <MovieSlider
            title="Phim hot"
            movies={hot_movies.slice(0, 10)}
            // link="/movie/hot"
          />
          {/* Comment Section */}
          <CommentList />
        </div>
      </div>
    </div>
  );
}
