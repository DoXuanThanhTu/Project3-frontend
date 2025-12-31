"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import axios from "axios";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Player from "@/components/movie/Player";
import Link from "next/link";
import EpisodesByServer from "@/components/movie/EpisodesByServer";
import { IComment } from "@/types/response.type";
import PlayerControlBar from "@/components/movie/PlayerController";

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
  movieId: string;
  serverId: string;
  title: string;
  description: string | null;
  slug: string;
  episodeOrLabel: string;
  videoUrl: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Server {
  server: {
    id: string;
    name: string;
    baseUrl: string;
    isActive: boolean;
  };
  episodes: Episode[];
  totalEpisodes: number;
  latestEpisode: Episode;
}

interface RelatedMovie {
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

interface MovieData {
  movie: Movie;
  servers: Server[];
  sameFranchise: RelatedMovie[];
  relatedByGenre: RelatedMovie[];
  meta: {
    totalEpisodes: number;
    totalServers: number;
    hasEpisodes: boolean;
    isSeries: boolean;
  };
}

interface ApiResponse {
  success: boolean;
  data: MovieData;
}

// ===== Constants =====
const MOVIE_API_URL = process.env.NEXT_PUBLIC_MOVIE_API_URL;
const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL;

// ===== Utils =====
const getToken = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
};

const buildHistoryPayload = (
  movie_id: string,
  episode_id?: string,
  watch_time = 0,
  completion_rate = 0,
  drop_off_point = 0
) => ({
  movie_id,
  episode_id: episode_id || null,
  watch_time,
  completion_rate,
  drop_off_point,
  device_type: navigator.userAgent || "",
  region: Intl.DateTimeFormat().resolvedOptions().timeZone,
  last_watched_at: new Date().toISOString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const saveLocalHistory = (payload: any) => {
  const key = "watch_history";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  const exists = list.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (i: any) =>
      i.movie_id === payload.movie_id && i.episode_id === payload.episode_id
  );
  if (!exists) {
    list.push(payload);
    localStorage.setItem(key, JSON.stringify(list));
  }
};

const syncLocalHistory = async (token: string) => {
  const key = "watch_history";
  const local = JSON.parse(localStorage.getItem(key) || "[]");
  if (!local.length) return;

  try {
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      local.map((item: any) =>
        axios.post(
          `${USER_API_URL}/watch-history`,
          {
            ...item,
            last_watched_at: new Date(
              item.last_watched_at || new Date()
            ).toISOString(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      )
    );
    localStorage.removeItem(key);
    console.log("Đồng bộ watch history từ local → server xong");
  } catch (err) {
    console.error("Sync local history failed", err);
  }
};

// ===== Comment Section =====
const CommentSection = ({ movieId }: { movieId: string }) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Implement comment submission
    console.log("Submit comment:", newComment);
    setNewComment("");
  };

  return (
    <div className="mt-8 p-6 bg-gray-900 rounded-xl">
      <h3 className="text-xl font-semibold mb-4">Bình luận</h3>
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Thêm bình luận của bạn..."
          className="w-full p-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          type="submit"
          className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Gửi bình luận
        </button>
      </form>
    </div>
  );
};

// ===== Main Component =====
export default function WatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const movieSlug = useMemo(() => pathname.split("/").pop(), [pathname]);
  const episodeQuery = searchParams.get("ep");

  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentServer, setCurrentServer] = useState<Server | null>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("autoPlay") === "true";
    }
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Thêm state để theo dõi trạng thái video
  const [videoEnded, setVideoEnded] = useState(false);

  const handleFollowToggle = () => {
    setIsFollowing((prev) => !prev);
    // TODO: Gọi API theo dõi phim
    console.log("Theo dõi:", !isFollowing);
  };

  const handleRateClick = () => {
    // TODO: Mở modal đánh giá
    console.log("Mở modal đánh giá");
  };

  const handleAutoPlayToggle = () => {
    const newValue = !isAutoPlay;
    setIsAutoPlay(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("autoPlay", String(newValue));
    }
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode((prev) => !prev);
    // TODO: Áp dụng dark mode cho player
    console.log("Dark mode:", !isDarkMode);
  };

  // Hàm kiểm tra có tập trước/tập tiếp không
  const { hasPrevEpisode, hasNextEpisode } = useMemo(() => {
    if (!currentServer || !currentEpisode || !movieData) {
      return { hasPrevEpisode: false, hasNextEpisode: false };
    }

    const currentServerData = movieData.servers.find(
      (s) => s.server.id === currentServer.server.id
    );

    if (!currentServerData?.episodes) {
      return { hasPrevEpisode: false, hasNextEpisode: false };
    }

    // Sắp xếp episodes
    const sortedEpisodes = [...currentServerData.episodes].sort((a, b) => {
      const aNum = parseInt(a.episodeOrLabel);
      const bNum = parseInt(b.episodeOrLabel);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.episodeOrLabel.localeCompare(b.episodeOrLabel);
    });

    const currentIndex = sortedEpisodes.findIndex(
      (ep) => ep.slug === currentEpisode.slug
    );

    return {
      hasPrevEpisode: currentIndex > 0,
      hasNextEpisode: currentIndex < sortedEpisodes.length - 1,
    };
  }, [currentServer, currentEpisode, movieData]);

  // Hàm xử lý chuyển tập
  const handlePrevEpisode = () => {
    if (!hasPrevEpisode || !currentServer || !currentEpisode || !movieData)
      return;

    const currentServerData = movieData.servers.find(
      (s) => s.server.id === currentServer.server.id
    );

    if (!currentServerData) return;

    const sortedEpisodes = [...currentServerData.episodes].sort((a, b) => {
      const aNum = parseInt(a.episodeOrLabel);
      const bNum = parseInt(b.episodeOrLabel);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.episodeOrLabel.localeCompare(b.episodeOrLabel);
    });

    const currentIndex = sortedEpisodes.findIndex(
      (ep) => ep.slug === currentEpisode.slug
    );

    const prevEpisode = sortedEpisodes[currentIndex - 1];
    if (prevEpisode) {
      handleSelectEpisode(prevEpisode, currentServerData);
    }
  };

  const handleNextEpisode = () => {
    if (!hasNextEpisode || !currentServer || !currentEpisode || !movieData)
      return;

    const currentServerData = movieData.servers.find(
      (s) => s.server.id === currentServer.server.id
    );

    if (!currentServerData) return;

    const sortedEpisodes = [...currentServerData.episodes].sort((a, b) => {
      const aNum = parseInt(a.episodeOrLabel);
      const bNum = parseInt(b.episodeOrLabel);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.episodeOrLabel.localeCompare(b.episodeOrLabel);
    });

    const currentIndex = sortedEpisodes.findIndex(
      (ep) => ep.slug === currentEpisode.slug
    );

    const nextEpisode = sortedEpisodes[currentIndex + 1];
    if (nextEpisode) {
      handleSelectEpisode(nextEpisode, currentServerData);
    }
  };

  const playerRef = useRef<HTMLDivElement>(null);

  // Find episode by episodeOrLabel
  const findEpisodeByQuery = useCallback((servers: Server[], query: string) => {
    for (const server of servers) {
      const foundEpisode = server.episodes.find(
        (ep) =>
          ep.episodeOrLabel === query ||
          ep.episodeOrLabel.toLowerCase() === query.toLowerCase()
      );
      if (foundEpisode) {
        return { episode: foundEpisode, server };
      }
    }
    return null;
  }, []);

  // Fetch movie data
  useEffect(() => {
    if (!movieSlug) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get<ApiResponse>(
          `${MOVIE_API_URL}/full/${movieSlug}`
        );

        if (response.data.success) {
          const data = response.data.data;
          setMovieData(data);

          let targetEpisode: Episode | null = null;
          let targetServer: Server | null = data.servers[0] || null;

          // Xử lý logic chọn tập dựa trên query
          if (episodeQuery) {
            // Tìm tập theo query trong tất cả servers
            const found = findEpisodeByQuery(data.servers, episodeQuery);
            if (found) {
              targetEpisode = found.episode;
              targetServer = found.server;
            }
          }

          // Nếu không có query hoặc không tìm thấy, chọn tập đầu tiên
          if (
            !targetEpisode &&
            targetServer &&
            targetServer.episodes.length > 0
          ) {
            targetEpisode = targetServer.episodes[0];
          }

          setCurrentServer(targetServer);
          setCurrentEpisode(targetEpisode);

          // Nếu có query và tìm thấy tập, cập nhật URL
          if (
            targetEpisode &&
            episodeQuery &&
            targetEpisode.episodeOrLabel !== episodeQuery
          ) {
            router.replace(`/watch/${movieSlug}?ep=${targetEpisode.slug}`);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieSlug, episodeQuery, router, findEpisodeByQuery]);

  // Save watch history
  const saveWatchHistory = useCallback(async () => {
    if (!movieData?.movie.id || !currentEpisode?.movieId) return;

    const payload = buildHistoryPayload(
      movieData.movie.id,
      currentEpisode.slug
    );
    const token = getToken();

    if (!token) {
      saveLocalHistory(payload);
      return;
    }

    try {
      await syncLocalHistory(token);
      await axios.post(`${USER_API_URL}/watch-history`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Save watch history failed", err);
    }
  }, [movieData, currentEpisode]);

  // Increment view and save history
  useEffect(() => {
    if (!movieData?.movie.id || !currentEpisode) return;

    const handleViewTracking = async () => {
      try {
        await saveWatchHistory();
      } catch (err) {
        console.error("View tracking error:", err);
      }
    };

    handleViewTracking();
  }, [movieData?.movie.id, currentEpisode, saveWatchHistory]);

  // Handle episode selection
  const handleSelectEpisode = useCallback(
    (episode: Episode, server: Server) => {
      setCurrentServer(server);
      setCurrentEpisode(episode);
      setVideoEnded(false); // Reset trạng thái video khi chuyển tập

      // Chỉ cập nhật URL mà không reload trang
      router.replace(`/watch/${movieSlug}?ep=${episode.episodeOrLabel}`);
    },
    [movieSlug, router]
  );

  // Hàm xử lý khi video kết thúc
  const handleVideoEnded = useCallback(() => {
    setVideoEnded(true);
  }, []);

  // Tự động chuyển tập khi video kết thúc và autoPlay được bật
  useEffect(() => {
    if (videoEnded && isAutoPlay && hasNextEpisode) {
      // Tự động chuyển sang tập tiếp theo
      handleNextEpisode();
      setVideoEnded(false); // Reset trạng thái
    }
  }, [videoEnded, isAutoPlay, hasNextEpisode, handleNextEpisode]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center mt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!movieData || !currentEpisode || !currentServer) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center mt-20">
        <div className="text-center p-8 bg-gray-900 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-2">
            Không tìm thấy phim
          </h3>
          <p className="text-gray-400 mb-6">
            Phim bạn đang tìm kiếm có thể không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100  w-full flex justify-center">
      <div className="container">
        <div className=" mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-gray-400 space-x-2">
            <Link
              href="/"
              className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-gray-300 hover:text-white"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              href={`/movie/${movieData.movie.slug}`}
              className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-gray-300 hover:text-white"
            >
              {movieData.movie.title}
            </Link>

            <span>/</span>

            <span className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-gray-300 hover:text-white">
              Tập {currentEpisode.episodeOrLabel}
            </span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="">
          <div className=" mx-auto px-4">
            {/* Player Section */}
            <div className="mb-8" ref={playerRef}>
              <div className="bg-gray-900 overflow-hidden shadow-2xl">
                {/* Thêm onEnded prop để nhận sự kiện video kết thúc */}
                <Player
                  linkEmbed={currentEpisode.videoUrl}
                  onEnded={handleVideoEnded}
                />
              </div>
              <PlayerControlBar
                isFollowing={isFollowing}
                isAutoPlay={isAutoPlay}
                isDarkMode={isDarkMode}
                hasPrevEpisode={hasPrevEpisode}
                hasNextEpisode={hasNextEpisode}
                onFollowToggle={handleFollowToggle}
                onRateClick={handleRateClick}
                onAutoPlayToggle={handleAutoPlayToggle}
                onPrevEpisode={handlePrevEpisode}
                onNextEpisode={handleNextEpisode}
                onDarkModeToggle={handleDarkModeToggle}
              />
            </div>

            {/* Movie Info */}
            <div className="mb-8 p-6 bg-gray-900 rounded-2xl">
              <div className="flex flex-col  md:flex-row gap-6 ">
                <div className="w-full flex justify-center md:justify-start md:w-max">
                  <img
                    src={movieData.movie.thumbnail}
                    alt={movieData.movie.title}
                    className="w-48 h-72 object-cover rounded-xl flex-shrink-0"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">
                    {movieData.movie.title}
                  </h2>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {movieData.movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Đánh giá</p>
                      <p className="text-xl font-semibold text-yellow-400">
                        {movieData.movie.ratingAvg}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Lượt xem</p>
                      <p className="text-xl font-semibold">
                        {movieData.movie.views.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Loại</p>
                      <p className="text-xl font-semibold">
                        {movieData.movie.type === "SERIES"
                          ? "Series"
                          : "Phim lẻ"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Series</p>
                      <p className="text-xl font-semibold">
                        {movieData.movie.franchise?.name}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {movieData.movie.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Episodes */}
            {movieData.servers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Danh sách tập</h3>
                <EpisodesByServer
                  servers={movieData.servers}
                  currentEpisodeSlug={currentEpisode.slug}
                  onSelectEpisode={handleSelectEpisode}
                  playerRef={playerRef}
                />
              </div>
            )}

            {/* Related Movies */}
            {(movieData.sameFranchise.length > 0 ||
              movieData.relatedByGenre.length > 0) && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Phim liên quan</h3>

                {movieData.sameFranchise.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-3 text-blue-400">
                      Cùng series
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {movieData.sameFranchise.map((movie) => (
                        <div
                          key={movie.id}
                          className="group cursor-pointer"
                          onClick={() => router.push(`/phim/${movie.slug}`)}
                        >
                          <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2">
                            <img
                              src={movie.poster}
                              alt={movie.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-sm font-medium truncate">
                            {movie.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {movie.ratingAvg}/10 •{" "}
                            {movie.views.toLocaleString()} lượt xem
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comments */}
            <CommentSection movieId={movieData.movie.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
