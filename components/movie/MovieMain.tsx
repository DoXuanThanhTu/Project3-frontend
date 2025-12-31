"use client";

import {
  IEpisodeResponse,
  IMovieResponse,
  IServerResponse,
} from "@/types/response.type";
import { Heart, MessageCircle, Play, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import MovieCard from "./MovieCard";

interface MovieMainProps {
  movie: IMovieResponse;
  servers: Servers[];
  relatedMovies?: IMovieResponse[];
  sameFranchise?: IMovieResponse[];
}

interface Servers {
  episodes: IEpisodeResponse[];
  server: IServerResponse;
  totalEpisodes?: number;
  latestEpisode?: IEpisodeResponse | null;
}

const MovieMain: React.FC<MovieMainProps> = ({
  movie,
  servers,
  relatedMovies = [],
  sameFranchise = [],
}) => {
  const [selectedServer, setSelectedServer] = useState<Servers>(servers[0]);
  console.log(selectedServer);
  const [activeTab, setActiveTab] = useState<
    "episodes" | "franchise" | "related"
  >("episodes");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          {movie.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-medium text-yellow-300">
            {movie.type === "SERIES" ? "Phim bộ" : "Phim lẻ"}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              {movie.ratingAvg?.toFixed(1)}
            </span>
            <span>•</span>
            <span>
              👁 {movie.views ? formatNumber(movie.views) : "N/A"} lượt xem
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {selectedServer && (
          <Link
            href={`/watch/${movie.slug}?ep=${
              selectedServer.episodes[0]?.episodeOrLabel || 1
            }`}
            className="flex items-center gap-3 rounded-xl bg-linear-to-r from-yellow-500 to-orange-500 px-6 py-3 font-semibold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
          >
            <Play className="h-5 w-5" />
            <span>Xem ngay</span>
          </Link>
        )}

        <div className="flex gap-3">
          <ActionButton icon={<Heart />} label="Yêu thích" />
          <ActionButton icon={<Plus />} label="Danh sách" />
          <ActionButton icon={<Share2 />} label="Chia sẻ" />
          <ActionButton icon={<MessageCircle />} label="Bình luận" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex gap-6">
          <TabButton
            active={activeTab === "episodes"}
            onClick={() => setActiveTab("episodes")}
            label="Tập phim"
            count={servers.reduce(
              (acc, server) => acc + (server.totalEpisodes || 0),
              0
            )}
          />
          {sameFranchise.length > 0 && (
            <TabButton
              active={activeTab === "franchise"}
              onClick={() => setActiveTab("franchise")}
              label="Cùng series"
              count={sameFranchise.length}
            />
          )}
          <TabButton
            active={activeTab === "related"}
            onClick={() => setActiveTab("related")}
            label="Có thể bạn thích"
            count={relatedMovies.length}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-75">
        {activeTab === "episodes" && (
          <div className="space-y-6">
            {/* Server Selection */}
            <div className="flex flex-wrap gap-3">
              {servers.map((server) => (
                <button
                  key={server.server.id}
                  onClick={() => setSelectedServer(server)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedServer.server.id === server.server.id
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {server.server.name}
                </button>
              ))}
            </div>

            {/* Episodes Grid */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {selectedServer ? (
                selectedServer.episodes.map((episode) => (
                  <Link
                    key={episode.slug}
                    href={`/watch/${movie.slug}?ep=${episode.episodeOrLabel}`}
                    className="group relative overflow-hidden rounded-lg bg-gray-900/50 p-4 text-center transition-all hover:bg-linear-to-br hover:from-purple-900/30 hover:to-pink-900/30"
                  >
                    <div className="text-lg font-bold text-white group-hover:text-purple-300">
                      {episode.episodeOrLabel || 1}
                    </div>
                    {/* <div className="mt-1 text-xs text-gray-400 group-hover:text-gray-300">
                      {episode.title || 1}
                    </div> */}
                  </Link>
                ))
              ) : (
                <p>Chưa có server</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "franchise" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {relatedMovies
              .filter((m) => m.franchise?.id === movie.franchise?.id)
              .map((relatedMovie) => (
                <MovieCard key={relatedMovie.id} movie={relatedMovie} />
              ))}
          </div>
        )}

        {activeTab === "related" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {relatedMovies.map((relatedMovie) => (
              <MovieCard key={relatedMovie.id} movie={relatedMovie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// const MovieCard: React.FC<{ movie: IMovieResponse }> = ({ movie }) => (
//   <Link
//     href={`/movie/${movie.slug}`}
//     className="group overflow-hidden rounded-xl bg-gray-900/50 transition-all hover:scale-[1.02] hover:bg-gray-900"
//   >
//     <div className="relative aspect-[2/3] overflow-hidden">
//       <img
//         src={movie.poster || "/no_poster.png"}
//         alt={movie.title}
//         className="object-cover transition-transform group-hover:scale-105"
//         sizes="(max-width: 768px) 50vw, 200px"
//       />
//       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
//       <div className="absolute bottom-2 left-2 right-2">
//         <div className="flex items-center justify-between">
//           <span className="rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-yellow-400">
//             ⭐ {movie.ratingAvg.toFixed(1)}
//           </span>
//           <span className="rounded-full bg-black/70 px-2 py-1 text-xs text-gray-300">
//             👁 {formatNumber(movie.views)}
//           </span>
//         </div>
//       </div>
//     </div>
//     <div className="p-3">
//       <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-purple-300">
//         {movie.title}
//       </h3>
//     </div>
//   </Link>
// );
const ActionButton: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <button className="flex items-center gap-2 rounded-full bg-gray-900/50 px-4 py-2.5 text-sm text-gray-300 transition-all hover:bg-gray-800 hover:text-white">
    {icon}
    <span>{label}</span>
  </button>
);

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}> = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`relative pb-3 text-sm font-medium transition-colors ${
      active ? "text-white" : "text-gray-400 hover:text-gray-300"
    }`}
  >
    <span className="flex items-center gap-2">
      {label}
      {count > 0 && (
        <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs">
          {count}
        </span>
      )}
    </span>
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500 to-pink-500" />
    )}
  </button>
);

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export default MovieMain;
