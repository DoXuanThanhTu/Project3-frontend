"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Play } from "lucide-react";
import { Button } from "../ui/Button";

// ===== Types =====
interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface Franchise {
  id: string;
  name: string;
}

interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  franchise: Franchise;
  genres: Genre[];
  poster: string;
  thumbnail: string;
  type: string;
  ratingAvg: number;
  views: number;
}

interface Episode {
  _id?: string;
  id?: string;
  movieId: string;
  serverId: string;
  title: string;
  description: string | null;
  slug: string;
  episodeOrLabel: string;
  episode_number?: string | number;
  videoUrl: string;
  thumbnail_url?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Server {
  _id?: string;
  id?: string;
  server: {
    id: string;
    _id?: string;
    name: string;
    baseUrl: string;
    isActive: boolean;
  };
  episodes: Episode[];
  totalEpisodes: number;
  latestEpisode: Episode;
  name?: string;
  baseUrl?: string;
  isActive?: boolean;
}

// ===== Props Interface =====
interface EpisodesByServerProps {
  servers: Server[];
  currentEpisodeSlug: string;
  onSelectEpisode: (episode: Episode, server: Server) => void;
  playerRef: React.RefObject<HTMLDivElement | null>;
}

// ===== Main Component =====
const EpisodesByServer: React.FC<EpisodesByServerProps> = ({
  servers,
  currentEpisodeSlug,
  onSelectEpisode,
  playerRef,
}) => {
  const [compactMode, setCompactMode] = useState(true);
  const [activeServer, setActiveServer] = useState<Server | null>(
    servers?.length ? servers[0] : null
  );

  // Sắp xếp episodes theo episodeOrLabel (số hoặc alphabet)
  const sortedEpisodes = useMemo(() => {
    if (!activeServer?.episodes) return [];

    return [...activeServer.episodes].sort((a, b) => {
      // Sử dụng episodeOrLabel hoặc episode_number
      const aLabel = a.episodeOrLabel || a.episode_number?.toString() || "";
      const bLabel = b.episodeOrLabel || b.episode_number?.toString() || "";

      // Thử chuyển thành số để sắp xếp
      const aNum = parseInt(aLabel);
      const bNum = parseInt(bLabel);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }

      // Nếu không phải số thì sắp xếp theo alphabet
      return aLabel.localeCompare(bLabel, undefined, { numeric: true });
    });
  }, [activeServer]);

  // Xử lý chọn tập và scroll tới player
  const handleEpisodeClick = useCallback(
    (episode: Episode) => {
      if (!activeServer) return;

      onSelectEpisode(episode, activeServer);

      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    },
    [onSelectEpisode, activeServer, playerRef]
  );

  // Xử lý chọn server
  const handleServerSelect = (server: Server) => {
    setActiveServer(server);
  };

  // Nếu không có servers
  if (!servers?.length) {
    return (
      <div className="mt-6 text-center text-gray-400 text-sm">
        Không có Server nào để hiển thị.
      </div>
    );
  }

  // Lấy server name từ cấu trúc dữ liệu
  const getServerName = (server: Server): string => {
    return server.server?.name || server.name || "Server";
  };

  // Lấy server ID từ cấu trúc dữ liệu
  const getServerId = (server: Server): string => {
    return (
      server.server?.id || server.server?._id || server.id || server._id || ""
    );
  };

  // Kiểm tra xem server có đang active không
  const isServerActive = (server: Server): boolean => {
    if (!activeServer) return false;
    return getServerId(server) === getServerId(activeServer);
  };

  // Kiểm tra xem episode có đang active không
  const isEpisodeActive = (episode: Episode): boolean => {
    return episode.slug === currentEpisodeSlug;
  };

  // Lấy thumbnail URL cho episode
  const getThumbnailUrl = (episode: Episode): string => {
    return episode.thumbnail_url || "/no_thumb.png";
  };

  // Lấy label hiển thị cho episode
  const getEpisodeLabel = (episode: Episode): string => {
    return episode.episodeOrLabel || episode.episode_number?.toString() || "";
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Thanh chọn server + toggle chế độ */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        {/* Server Selection */}
        <div className="flex flex-wrap gap-2">
          {servers.map((server) => (
            <Button
              key={getServerId(server)}
              variant={isServerActive(server) ? "default" : "outline"}
              onClick={() => handleServerSelect(server)}
              className="px-4 py-2 rounded-lg transition-colors"
            >
              {getServerName(server)}
            </Button>
          ))}
        </div>

        {/* Toggle rút gọn */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none group"
          onClick={() => setCompactMode((prev) => !prev)}
        >
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            {compactMode ? "Rút gọn" : "Chi tiết"}
          </span>

          <div
            className={`relative w-10 h-5 flex items-center rounded-full transition-colors duration-300 ${
              compactMode ? "bg-blue-600" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute left-0 top-0 h-5 w-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-out ${
                compactMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Danh sách tập */}
      {activeServer && sortedEpisodes.length > 0 && (
        <div
          className={`grid gap-3 ${
            compactMode
              ? "grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          }`}
        >
          {sortedEpisodes.map((episode) => {
            const isActive = isEpisodeActive(episode);
            const episodeLabel = getEpisodeLabel(episode);

            if (compactMode) {
              return (
                <button
                  key={`${episode.serverId}-${episodeLabel}`}
                  onClick={() => handleEpisodeClick(episode)}
                  className={`cursor-pointer rounded-lg flex flex-col items-center justify-center h-14 transition-all hover:scale-105
                    ${
                      isActive
                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                    }
                  `}
                  title={`${episode.title || ""} - ${episodeLabel}`}
                >
                  {/* <Play size={14} className="mb-1" /> */}
                  <span className="text-sm font-medium">{episodeLabel}</span>
                </button>
              );
            }

            // Chế độ chi tiết
            return (
              <div
                key={`${episode.serverId}-${episodeLabel}`}
                onClick={() => handleEpisodeClick(episode)}
                className={`cursor-pointer group relative rounded-lg overflow-hidden transition-all duration-200 ${
                  isActive ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="aspect-video bg-gray-800 overflow-hidden">
                  <img
                    src={getThumbnailUrl(episode)}
                    alt={`Tập ${episodeLabel}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {isActive && (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Đang phát
                  </span>
                )}

                <div className="mt-2 ml-2">
                  <div className="text-sm text-gray-200 font-medium truncate">
                    {episode.title || `Tập ${episodeLabel}`}
                  </div>
                  {/* <div className="text-xs text-gray-400">
                    Tập {episodeLabel}
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Thông báo không có tập */}
      {activeServer && sortedEpisodes.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Không có tập nào trong server này.
        </div>
      )}
    </div>
  );
};

export default EpisodesByServer;
