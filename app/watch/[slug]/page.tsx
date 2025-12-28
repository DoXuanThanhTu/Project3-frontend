"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Player from "@/components/movie/Player";
import { IEpisode } from "@/types/movie.type";

// ===== Types =====
interface Episode {
  _id: string;
  episode_number: number;
  link_m3u8?: string;
}

interface Server {
  _id: string;
  name: string;
  episodes?: Episode[];
}

interface Movie {
  _id: string;
  name: string;
  slug: string;
  servers?: Server[];
}

// ===== Constants =====
const MOVIE_API_URL = process.env.NEXT_PUBLIC_MOVIE_API_URL;
const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL;

// ===== Utils =====
const getToken = () => {
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
  last_watched_at: new Date(),
});

const saveLocalHistory = (payload: any) => {
  const key = "watch_history";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  const exists = list.find(
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
    for (const item of local) {
      const payload = {
        ...item,
        last_watched_at: new Date(item.last_watched_at || new Date()),
      };
      await axios.post(`${USER_API_URL}/watch-history`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem(key);
    console.log("Đồng bộ watch history từ local → server xong");
  } catch (err) {
    console.error("Sync local history failed", err);
  }
};

// ===== Component =====
export default function WatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const movieSlug = pathname.split("/").pop();
  const epNumber = Number(searchParams.get("ep") || "1");

  const [movie, setMovie] = useState<Movie | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [currentServer, setCurrentServer] = useState<Server | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);

  const playerRef = useRef<HTMLDivElement>(null);

  // Fetch movie data
  useEffect(() => {
    if (!movieSlug) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${MOVIE_API_URL}/watch/${movieSlug}`);
        const { movie, servers } = res.data.data;
        setMovie(movie);
        setServers(servers);
        const defaultServer = servers?.[0];
        setCurrentServer(defaultServer || null);
        const defaultEp =
          defaultServer?.episodes?.find(
            (ep: IEpisode) => ep.episodeNumber === epNumber
          ) || defaultServer?.episodes?.[0];
        setCurrentEpisode(defaultEp || null);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieSlug, epNumber]);

  // Save watch history
  const saveWatchHistory = async () => {
    if (!movie?._id || !currentEpisode?._id) return;
    const payload = buildHistoryPayload(movie._id, currentEpisode._id);
    const token = getToken();

    if (!token) {
      saveLocalHistory(payload);
      return;
    }

    await syncLocalHistory(token);
    try {
      await axios.post(`${USER_API_URL}/watch-history`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Save watch history failed", err);
    }
  };

  // Increment view + save history
  useEffect(() => {
    if (!movie?._id || !currentEpisode?._id) return;
    const incrementAndSave = async () => {
      try {
        await axios.post(`${MOVIE_API_URL}/views/increment`, {
          movieId: movie._id,
          episodeId: currentEpisode._id,
        });
        console.log("View incremented:", currentEpisode._id);
        await saveWatchHistory();
      } catch (err) {
        console.error(err);
      }
    };
    incrementAndSave();
  }, [movie?._id, currentEpisode?._id]);

  // Select episode
  const handleSelectEpisode = (ep: Episode, server: Server) => {
    setCurrentServer(server);
    setCurrentEpisode(ep);
    router.replace(`${pathname}?ep=${ep.episode_number}`, { scroll: false });
    setTimeout(() => {
      playerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 200);
  };

  // if (loading) return <div className="text-white p-4">Đang tải dữ liệu...</div>;
  // if (!movie || !currentEpisode)
  //   return (
  //     <div className="text-white p-4">Không tìm thấy phim hoặc tập nào.</div>
  //   );

  // return (
  //   <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col mt-20">
  //     <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8">
  //       {/* Header */}
  //       <div className="flex items-center gap-3 mb-4">
  //         <button
  //           onClick={() => router.back()}
  //           className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
  //         >
  //           <i className="fa-solid fa-angle-left"></i>
  //         </button>
  //         <h2 className="text-lg md:text-xl font-semibold truncate">
  //           Xem tập {currentEpisode?.episode_number} - {movie.name}
  //         </h2>
  //       </div>

  //       {/* Player */}
  //       <div
  //         ref={playerRef}
  //         className="relative rounded-xl overflow-hidden shadow-lg"
  //       >
  //         <ModernPlayer linkEmbed={currentEpisode.link_m3u8 || ""} />
  //       </div>

  //       {/* Episodes */}
  //       <EpisodesByServer
  //         servers={servers}
  //         currentEpisodeId={currentEpisode?._id}
  //         onSelectEpisode={handleSelectEpisode}
  //         playerRef={playerRef}
  //       />

  //       <CommentSection movieId={movie._id} />
  //     </div>
  //   </div>
  // );
  return (
    <div>
      <Player
        linkEmbed={"https://sora-zootopia.netlify.app/video/master.m3u8"}
      />
    </div>
  );
}
