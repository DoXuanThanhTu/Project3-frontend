"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/movie/MovieCard";
import api from "@/lib/api";
import { IMovieResponse } from "@/types/response.type";
import { useParams } from "next/navigation";

interface PageProps {
  params: { slug: string };
}

interface ApiResponse {
  success: boolean;
  data: IMovieResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function GenrePage() {
  const { slug } = useParams();

  const [movies, setMovies] = useState<IMovieResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<ApiResponse>(`/movie/genre/${slug}`);
        setMovies(res.data.data);
        setTotal(res.data.pagination.total);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Đang tải...
      </div>
    );
  }
  function capitalizeWords(text: string) {
    return text
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-10 mt-20">
      {/* {slug && (
        <h1 className="text-3xl font-bold mb-2">
          🎬 Thể loại: {capitalizeWords(Array.isArray(slug) ? slug[0] : slug)}
        </h1>
      )} */}

      <p className="text-gray-400 mb-8">Có {total} phim</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </main>
  );
}
