"use client";

import {
  IEpisodeResponse,
  IMovieResponse,
  IServerResponse,
} from "@/types/response.type";
import { Heart, MessageCircle, Play, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import api from "@/lib/api";
import useAuthStore from "@/stores/auth.store";

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

interface FavoriteResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    favorites: Array<{
      _id: string;
      movieId: string;
      title: {
        en: string;
        vi: string;
      };
      thumbnail: string;
      poster: string;
      banner: string;
      type: string;
      slug: {
        en: string;
        vi: string;
      };
      genres: string[];
      ratingAvg: number;
      totalViews: number;
      favorites: number;
      addedAt: string;
    }>;
  };
}

const MovieMain: React.FC<MovieMainProps> = ({
  movie,
  servers,
  relatedMovies = [],
  sameFranchise = [],
}) => {
  const [selectedServer, setSelectedServer] = useState<Servers>(servers[0]);
  const user = useAuthStore((state) => state.user);
  console.log(selectedServer);
  const [activeTab, setActiveTab] = useState<
    "episodes" | "franchise" | "related"
  >("episodes");
  const [episodeSearch, setEpisodeSearch] = useState("");

  const handleFollowToggle = () => {
    if (user) {
      const toogleFavorite = async () => {
        const res = await api.post("/favorite", {
          movieId: movie.id,
        });
        if (res.status === 200) {
          setIsFavorite((prev) => !prev);
        }
      };
      // TODO: Gọi API theo dõi phim
      toogleFavorite();
    }
  };
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    const fetchFavoriteMovie = async () => {
      try {
        const res = await api.get<FavoriteResponse>(`/favorite/my-favorites`);
        console.log("Favorites data:", res.data);

        // Kiểm tra xem movie.id có tồn tại trong danh sách favorites không
        const isMovieInFavorites = res.data.data.favorites.some(
          (fav) => fav.movieId === movie.id
        );

        setIsFavorite(isMovieInFavorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchFavoriteMovie();
  }, [movie.id]);

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
            {movie.views != undefined && (
              <span>👁 {formatNumber(movie.views)} lượt xem</span>
            )}
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
          {isFavorite ? (
            <ActionButton
              icon={<Heart fill="red" color="red" />}
              label="Đã yêu thích"
              onClick={handleFollowToggle}
            />
          ) : (
            <ActionButton
              icon={<Heart />}
              label="Yêu thích"
              onClick={handleFollowToggle}
            />
          )}
          {/* <ActionButton icon={<Plus />} label="Danh sách" /> */}
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
      <div
        className="min-h-75   overflow-y-auto
    custom-scrollbar
    rounded-xl
    bg-gray-950/40
    p-3 "
      >
        {activeTab === "episodes" && (
          <div className="space-y-6">
            {/* Server Selection */}
            <div className="flex flex-wrap gap-3">
              {servers.map((server) => (
                <button
                  key={server.server.id}
                  onClick={() => setSelectedServer(server)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedServer?.server.id === server.server.id
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {server.server.name}
                </button>
              ))}
            </div>

            {/* Search Episodes */}
            {selectedServer && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm tập phim..."
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                  className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-400 outline-none ring-1 ring-gray-700 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Episodes Grid (Scrollable) */}
            {selectedServer ? (
              <div
                className="
          max-h-[420px]
          overflow-y-auto
          rounded-xl
          bg-gray-950/40
          p-3
          scrollbar-thin
          scrollbar-thumb-gray-700
          scrollbar-track-gray-900
        "
              >
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {selectedServer.episodes
                    .filter((ep) =>
                      String(ep.episodeOrLabel || "")
                        .toLowerCase()
                        .includes(episodeSearch.toLowerCase())
                    )
                    .map((episode) => (
                      <Link
                        key={episode.slug}
                        href={`/watch/${movie.slug}?ep=${episode.episodeOrLabel}`}
                        className="group relative overflow-hidden rounded-lg bg-gray-900/70 p-4 text-center transition-all hover:bg-linear-to-br hover:from-purple-900/30 hover:to-pink-900/30"
                      >
                        <div className="text-lg font-bold text-white group-hover:text-purple-300">
                          {episode.episodeOrLabel || 1}
                        </div>
                      </Link>
                    ))}
                </div>

                {/* Empty state */}
                {selectedServer.episodes.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-400">
                    Không có tập phim
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400">Chưa có tập phim, hãy chờ nhé</p>
            )}
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

const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 rounded-full bg-gray-900/50 px-4 py-2.5 text-sm text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
  >
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
