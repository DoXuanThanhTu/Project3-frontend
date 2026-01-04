"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Player from "@/components/movie/Player";
import Link from "next/link";
import EpisodesByServer from "@/components/movie/EpisodesByServer";
import { IComment } from "@/types/response.type";
import PlayerControlBar from "@/components/movie/PlayerController";
import api from "@/lib/api";
import CommentList from "@/components/movie/CommentList";
import { useAppStore } from "@/stores";
import useAuthStore from "@/stores/auth.store";

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

// Interface cho playerSettings
interface PlayerSettings {
  volume: number;
  speedrate: number;
  autoPlay: boolean;
  isfullScreen: boolean;
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

// ===== Main Component =====
export default function WatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const movieSlug = useMemo(() => pathname.split("/").pop(), [pathname]);
  const episodeQuery = searchParams.get("ep");

  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentServer, setCurrentServer] = useState<Server | null>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [playerSettings, setPlayerSettings] = useState<PlayerSettings>({
    volume: 100,
    speedrate: 2,
    autoPlay: true,
    isfullScreen: false,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Thêm state để theo dõi trạng thái video
  const [videoEnded, setVideoEnded] = useState(false);

  // Thêm ref để tham chiếu đến phần comment
  const commentSectionRef = useRef<HTMLDivElement>(null);

  // Khởi tạo playerSettings từ localStorage khi component mount
  useEffect(() => {
    const loadPlayerSettings = () => {
      if (typeof window !== "undefined") {
        const savedSettings = localStorage.getItem("playerSettings");
        if (savedSettings) {
          try {
            const parsedSettings: PlayerSettings = JSON.parse(savedSettings);
            setPlayerSettings(parsedSettings);
          } catch (error) {
            console.error(
              "Lỗi khi parse playerSettings từ localStorage:",
              error
            );
            // Nếu có lỗi, sử dụng giá trị mặc định
            setPlayerSettings({
              volume: 100,
              speedrate: 2,
              autoPlay: true,
              isfullScreen: false,
            });
          }
        }
      }
    };

    loadPlayerSettings();
  }, []);

  useEffect(() => {
    const fetchFavoriteMovie = async () => {
      try {
        const res = await api.get<FavoriteResponse>(`/favorite/my-favorites`);
        console.log("Favorites data:", res.data);

        // Kiểm tra xem movie.id có tồn tại trong danh sách favorites không
        const isMovieInFavorites = res.data.data.favorites.some(
          (fav) => fav.movieId === movieData?.movie.id
        );

        setIsFollowing(isMovieInFavorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchFavoriteMovie();
  }, [movieData?.movie.id]);

  const handleFollowToggle = () => {
    if (user) {
      const toogleFavorite = async () => {
        const res = await api.post("/favorite", {
          movieId: movieData?.movie.id,
        });
        if (res.status === 200) {
          setIsFollowing((prev) => !prev);
        }
      };
      // TODO: Gọi API theo dõi phim
      toogleFavorite();
    }
  };

  // Sửa lại hàm handleRateClick để cuộn đến phần comment
  const handleRateClick = () => {
    // TODO: Mở modal đánh giá
    console.log("Mở modal đánh giá");

    // Cuộn đến phần comment với hiệu ứng mượt mà
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Tập trung vào textarea comment nếu có
      setTimeout(() => {
        const commentTextarea =
          commentSectionRef.current?.querySelector("textarea");
        if (commentTextarea) {
          commentTextarea.focus();
        }
      }, 500);
    }
  };

  // Sửa lại hàm handleAutoPlayToggle để lưu vào playerSettings
  const handleAutoPlayToggle = async () => {
    const newSettings = {
      ...playerSettings,
      autoPlay: !playerSettings.autoPlay,
    };

    setPlayerSettings(newSettings);

    if (typeof window !== "undefined") {
      localStorage.setItem("playerSettings", JSON.stringify(newSettings));
    }
    if (user) {
      try {
        await api.patch("/profile/preferences", {
          autoPlay: newSettings.autoPlay,
        });
      } catch (error) {
        console.error("Update autoplay failed:", error);
      }
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
      // Dùng handleSelectEpisode mới
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
      // Dùng handleSelectEpisode mới
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
        const response = await api.get(`movie/full/${movieSlug}`);

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
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieSlug, router, findEpisodeByQuery]);

  // Handle episode selection
  const handleSelectEpisode = useCallback(
    (episode: Episode, server: Server) => {
      // Cập nhật state trước
      setCurrentEpisode(episode);
      setCurrentServer(server);
      setVideoEnded(false);

      // Sau đó cập nhật URL
      router.replace(`/watch/${movieSlug}?ep=${episode.episodeOrLabel}`, {
        scroll: false,
      });
    },
    [movieSlug, router]
  );

  // Hàm xử lý khi video kết thúc
  const handleVideoEnded = useCallback(() => {
    setVideoEnded(true);
  }, []);

  // Sửa lại useEffect này để sử dụng playerSettings.autoPlay
  useEffect(() => {
    if (videoEnded && playerSettings.autoPlay && hasNextEpisode) {
      // Tự động chuyển sang tập tiếp theo
      handleNextEpisode();
      setVideoEnded(false); // Reset trạng thái
      console.log("cap nhat 4");
    }
  }, [videoEnded, playerSettings.autoPlay, hasNextEpisode, handleNextEpisode]);

  const handleEpisodeChangeWithoutReload = useCallback(
    (episode: Episode, server: Server) => {
      // Cập nhật state
      setCurrentEpisode(episode);
      setCurrentServer(server);
      setVideoEnded(false);

      // Cập nhật URL ngay lập tức nhưng không reload
      router.replace(`/watch/${movieSlug}?ep=${episode.episodeOrLabel}`, {
        scroll: false,
      });
    },
    [movieSlug, router]
  );

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
                  onNext={handleNextEpisode}
                  movieSlug={movieData.movie.slug}
                  episode={currentEpisode.episodeOrLabel}
                  movieId={movieData.movie.id}
                  episodeId={currentEpisode.id}
                />
              </div>
              {/* Truyền playerSettings.autoPlay thay vì isAutoPlay */}
              <PlayerControlBar
                isFollowing={isFollowing}
                isAutoPlay={playerSettings.autoPlay}
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
                    className="w-48 h-72 object-cover rounded-xl shrink-0"
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
                  onEpisodeChangeWithoutReload={
                    handleEpisodeChangeWithoutReload
                  } // Thêm prop mới
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
                          onClick={() => router.push(`/movie/${movie.slug}`)}
                        >
                          <div className="aspect-2/3 rounded-lg overflow-hidden mb-2">
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

            {/* Comments - Thêm ref để có thể cuộn đến phần này */}
            <div ref={commentSectionRef}>
              <CommentList
                movieId={movieData.movie.id}
                episodeOrLabel={currentEpisode.episodeOrLabel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
