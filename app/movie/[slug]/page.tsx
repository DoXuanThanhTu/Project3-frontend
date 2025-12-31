"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import MovieInfo from "@/components/movie/MovieInfo";
import MovieMain from "@/components/movie/MovieMain";
// import { MovieDetailResponse } from "@/types/test.type";
import { IMovieDetailResponse } from "@/types/response.type";
import CommentSection from "@/components/movie/CommentSection";
import { useAppStore } from "@/stores/app.store";
import api from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_MOVIE_API_URL;

const MovieDetailPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState<IMovieDetailResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lang = useAppStore((state) => state.lang);
  useEffect(() => {
    if (!slug) return;

    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        useAppStore.setState({ lang: "en" });
        const response = await api.get(`/movie/full/${slug}?lang=${lang}`);

        if (response.data.success && response.data.data) {
          setData(response.data.data);
        } else {
          setError("Không tìm thấy thông tin phim");
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
        setError("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f10]">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-purple-500 mx-auto" />
          <p className="text-gray-400">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f10]">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 p-4">
            <div className="h-8 w-8 rounded-full bg-red-500" />
          </div>
          <p className="text-xl font-semibold text-white">Oops!</p>
          <p className="text-gray-400">{error || "Không tìm thấy dữ liệu"}</p>
        </div>
      </div>
    );
  }

  const { movie, servers, sameFranchise, relatedByGenre } = data;

  // Combine related movies

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white -mt-16">
      {/* Banner Background */}
      <div
        className="h-150 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${movie.banner || "/no_banner.png"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-[#0f0f10] via-[#0f0f10]/60 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative -mt-20 px-4 md:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar - Movie Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <MovieInfo movie={movie} />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl bg-linear-to-br from-gray-900/50 to-black/50 p-6 backdrop-blur-lg">
                <MovieMain
                  movie={movie}
                  servers={servers}
                  relatedMovies={relatedByGenre}
                  sameFranchise={sameFranchise}
                />
                <CommentSection />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-16" />
    </div>
  );
};

export default MovieDetailPage;
