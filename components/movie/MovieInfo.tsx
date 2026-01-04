"use client";

import React from "react";
import Image from "next/image";
import { IMovieResponse } from "@/types/response.type";
import { MovieType } from "@/types/movie.type";

interface MovieInfoProps {
  movie: IMovieResponse;
}

const MovieInfo: React.FC<MovieInfoProps> = ({ movie }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Poster */}
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl shadow-2xl">
        <Image
          src={movie.thumbnail ?? "/no_thumb.png"}
          alt={movie.title || "No title"}
          className="object-cover w-full h-full"
          width={400}
          height={600}
          loading="lazy"
        />
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/80 px-3 py-1.5 text-sm font-bold">
          <span className="text-yellow-400">★</span>
          <span>{movie.ratingAvg ? movie.ratingAvg.toFixed(1) : "N/A"}</span>
        </div>
      </div>

      {/* Movie Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-lg bg-gray-900/50 p-3">
          <span className="text-2xl font-bold text-yellow-400">
            {movie.ratingAvg ? movie.ratingAvg.toFixed(1) : "N/A"}{" "}
          </span>
          <span className="text-xs text-gray-400">Đánh giá</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-gray-900/50 p-3">
          <span className="text-2xl font-bold text-blue-400">
            {formatNumber(movie.views || 0)}
          </span>
          <span className="text-xs text-gray-400">Lượt xem</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-gray-900/50 p-3">
          <span className="text-2xl font-bold text-purple-400">
            {movie.type === MovieType.SERIES
              ? movie.totalEpisodes ?? "??"
              : "Lẻ"}
          </span>
          <span className="text-xs text-gray-400">
            {movie.type === MovieType.SERIES ? "Tập" : ""}
          </span>
        </div>
      </div>

      {/* Genres */}
      {movie.genres && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400">Thể loại</h3>
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span
                key={genre.id}
                className="rounded-full bg-linear-to-r from-purple-900/30 to-pink-900/30 px-3 py-1 text-xs text-purple-300 backdrop-blur-sm"
              >
                {genre.title}
              </span>
            ))}
          </div>
        </div>
      )}
      {movie.description && (
        <div className="flex flex-col">
          <span className="text-gray-400">Mô tả:</span>
          <span className="font-medium text-white">{movie.description}</span>
        </div>
      )}
      {/* Franchise */}
      {/* {movie.franchise && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400">Series</h3>
          <div className="rounded-lg bg-linear-to-r from-gray-900/50 to-gray-800/50 p-3 backdrop-blur-sm">
            <span className="text-white">{movie.franchise.name}</span>
          </div>
        </div>
      )} */}

      {/* Quick Info */}
      {/* <div className="space-y-3 rounded-xl bg-linear-to-br from-gray-900/50 to-black/50 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-400">Thông tin nhanh</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Loại phim:</span>
            <span className="font-medium text-white">
              {movie.type === "SERIES" ? "Phim bộ" : "Phim lẻ"}
            </span>
          </div>
          {movie.duration && (
            <div className="flex justify-between">
              <span className="text-gray-400">Thời lượng:</span>
              <span className="font-medium text-white">{movie.duration}</span>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default MovieInfo;
