"use client";

import React from "react";
import Image from "next/image";
import { IMovie, MovieType } from "@/types/movie.type";
import { getMovieText } from "@/lib/movie-i18n";
import { useAppStore } from "@/store";

const MovieInfo = ({ movie }: { movie?: IMovie }) => {
  const lang = useAppStore((s) => s.lang);

  if (!movie) return null;

  const title = getMovieText(movie.title, lang, movie.defaultLang);

  const description = getMovieText(movie.description, lang, movie.defaultLang);

  return (
    <div className="mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
      {/* ===== POSTER ===== */}
      <div className="flex justify-center md:justify-start">
        <div className="relative w-[200px] h-[300px] rounded-xl overflow-hidden shadow-lg">
          <Image
            src={movie.poster || movie.thumbnail || "/no_poster.png"}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* ===== INFO ===== */}
      <div className="flex flex-col">
        {/* Title */}
        <h1 className="text-3xl font-bold">{title}</h1>

        {/* Sub title (English fallback) */}
        {movie.defaultLang !== "en" && movie.title.get("en") && (
          <p className="text-lg text-purple-400 italic">
            {movie.title.get("en")}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
          <span className="bg-yellow-600 px-2 py-1 rounded">{movie.type}</span>

          {movie.type === MovieType.SERIES && (
            <span className="bg-neutral-800 px-2 py-1 rounded">
              {movie.currentEpisode}/{movie.totalEpisodes} tập
            </span>
          )}

          {movie.duration && (
            <span className="bg-neutral-800 px-2 py-1 rounded">
              {movie.duration}
            </span>
          )}

          <span className="bg-neutral-800 px-2 py-1 rounded">
            ⭐ {movie.ratingAvg.toFixed(1)}
          </span>

          <span className="bg-neutral-800 px-2 py-1 rounded">
            👁 {movie.views.toLocaleString()}
          </span>
        </div>

        {/* Genres */}
        {movie.genres?.length && (
          <div className="flex flex-wrap gap-2 mt-4">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="bg-purple-600/20 border border-purple-600 text-purple-300 px-3 py-1 rounded-full text-sm"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Giới thiệu</h2>
          <p className="text-gray-300 leading-relaxed text-sm">{description}</p>
        </div>

        {/* Details */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
          {movie.director && (
            <div>
              <p className="font-semibold text-white">Đạo diễn</p>
              <p>{movie.director}</p>
            </div>
          )}

          {movie.cast?.length && (
            <div>
              <p className="font-semibold text-white">Diễn viên</p>
              <p>{movie.cast.slice(0, 5).join(", ")}</p>
            </div>
          )}

          {movie.genres?.length && (
            <div>
              <p className="font-semibold text-white">Thể loại</p>
              <p>{movie.genres.join(", ")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;
