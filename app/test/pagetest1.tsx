// "use client";

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import Link from "next/link";
// import api from "@/lib/api";

// // ===== Types =====
// interface Episode {
//   movieId: string;
//   serverId: string;
//   title: string;
//   description: string | null;
//   slug: string;
//   episodeOrLabel: string;
//   videoUrl: string;
//   isPublished: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Server {
//   server: {
//     id: string;
//     name: string;
//     baseUrl: string;
//     isActive: boolean;
//   };
//   episodes: Episode[];
//   totalEpisodes: number;
//   latestEpisode: Episode;
// }

// interface MovieData {
//   movie: {
//     id: string;
//     title: string;
//     slug: string;
//     description: string | null;
//     poster: string;
//     thumbnail: string;
//     type: string;
//     ratingAvg: number;
//     views: number;
//   };
//   servers: Server[];
// }
// interface SimpleHLSPlayerProps {
//   videoUrl: string;
//   onEnded?: () => void; // callback khi video kết thúc
// }
// // Simple HLS Player Component
// const SimpleHLSPlayer = ({ videoUrl, onEnded }: SimpleHLSPlayerProps) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const hlsRef = useRef<any>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [volume, setVolume] = useState(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("playerVolume");
//       return saved ? parseFloat(saved) : 0.7;
//     }
//     return 0.7;
//   });
//   const [playbackRate, setPlaybackRate] = useState(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem("playerPlaybackRate");
//       return saved ? parseFloat(saved) : 1.0;
//     }
//     return 1.0;
//   });
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     // Lắng nghe sự kiện kết thúc video
//     const handleVideoEnded = () => {
//       if (onEnded) onEnded();
//     };

//     video.addEventListener("ended", handleVideoEnded);

//     return () => {
//       video.removeEventListener("ended", handleVideoEnded);
//     };
//   }, [onEnded]);
//   // Initialize player
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     // Load saved settings
//     const savedVolume = localStorage.getItem("playerVolume");
//     const savedPlaybackRate = localStorage.getItem("playerPlaybackRate");

//     if (savedVolume) {
//       const vol = parseFloat(savedVolume);
//       setVolume(vol);
//       video.volume = vol;
//     }

//     if (savedPlaybackRate) {
//       const rate = parseFloat(savedPlaybackRate);
//       setPlaybackRate(rate);
//       video.playbackRate = rate;
//     }

//     // Load HLS video
//     const loadVideo = () => {
//       if (video.canPlayType("application/vnd.apple.mpegurl")) {
//         // Safari native HLS support
//         video.src = videoUrl;
//         video.load();
//       } else if (window.Hls) {
//         // HLS.js for other browsers
//         if (hlsRef.current) {
//           hlsRef.current.destroy();
//         }

//         const hls = new window.Hls({
//           enableWorker: true,
//           lowLatencyMode: true,
//           backBufferLength: 90,
//         });

//         hlsRef.current = hls;
//         hls.loadSource(videoUrl);
//         hls.attachMedia(video);

//         hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
//           // Apply saved settings after video loads
//           video.volume = volume;
//           video.playbackRate = playbackRate;
//         });
//       } else {
//         alert("Trình duyệt của bạn không hỗ trợ phát video HLS.");
//       }
//     };

//     loadVideo();

//     // Cleanup
//     return () => {
//       if (hlsRef.current) {
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }
//     };
//   }, [videoUrl]);

//   // Save settings to localStorage
//   const saveVolume = useCallback((newVolume: number) => {
//     localStorage.setItem("playerVolume", newVolume.toString());
//   }, []);

//   const savePlaybackRate = useCallback((newRate: number) => {
//     localStorage.setItem("playerPlaybackRate", newRate.toString());
//   }, []);

//   // Handle play/pause
//   const togglePlay = () => {
//     const video = videoRef.current;
//     if (!video) return;

//     if (video.paused) {
//       video.play();
//       setIsPlaying(true);
//     } else {
//       video.pause();
//       setIsPlaying(false);
//     }
//   };

//   // Handle volume change
//   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newVolume = parseFloat(e.target.value);
//     const video = videoRef.current;

//     if (video) {
//       video.volume = newVolume;
//     }

//     setVolume(newVolume);
//     saveVolume(newVolume);
//   };

//   // Handle playback rate change
//   const handlePlaybackRateChange = (rate: number) => {
//     const video = videoRef.current;

//     if (video) {
//       video.playbackRate = rate;
//     }

//     setPlaybackRate(rate);
//     savePlaybackRate(rate);
//   };

//   return (
//     <div className="relative w-full aspect-video bg-black">
//       <video
//         ref={videoRef}
//         className="w-full h-full"
//         controls
//         onClick={togglePlay}
//       />

//       {/* Custom Controls */}
//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={togglePlay}
//               className="text-white p-2 hover:bg-white/20 rounded"
//             >
//               {isPlaying ? "⏸️" : "▶️"}
//             </button>

//             <div className="flex items-center gap-2">
//               <span className="text-white text-sm">Âm lượng:</span>
//               <input
//                 type="range"
//                 min="0"
//                 max="1"
//                 step="0.1"
//                 value={volume}
//                 onChange={handleVolumeChange}
//                 className="w-24 accent-blue-500"
//               />
//               <span className="text-white text-sm">
//                 {Math.round(volume * 100)}%
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="text-white text-sm">Tốc độ:</span>
//             <select
//               value={playbackRate}
//               onChange={(e) =>
//                 handlePlaybackRateChange(parseFloat(e.target.value))
//               }
//               className="bg-gray-800 text-white px-2 py-1 rounded"
//             >
//               <option value="0.25">0.25x</option>
//               <option value="0.5">0.5x</option>
//               <option value="0.75">0.75x</option>
//               <option value="1">1x</option>
//               <option value="1.25">1.25x</option>
//               <option value="1.5">1.5x</option>
//               <option value="1.75">1.75x</option>
//               <option value="2">2x</option>
//             </select>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main Watch Page Component
// export default function SimpleWatchPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const pathname = usePathname();

//   const movieSlug = useMemo(() => pathname.split("/").pop(), [pathname]);
//   const episodeQuery = searchParams.get("ep");

//   const [movieData, setMovieData] = useState<MovieData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
//   const [episodesList, setEpisodesList] = useState<Episode[]>([]);
//   const [currentServer, setCurrentServer] = useState<Server | null>(null);

//   // Fetch movie data
//   useEffect(() => {
//     if (!movieSlug) return;

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const response = await api.get(`movie/full/${movieSlug}`);

//         if (response.data.success) {
//           const data = response.data.data;
//           setMovieData(data);

//           // Collect all episodes from all servers
//           const allEpisodes: Episode[] = [];
//           data.servers.forEach((server: Server) => {
//             allEpisodes.push(...server.episodes);
//           });

//           setEpisodesList(allEpisodes);

//           // Find current episode
//           let targetEpisode: Episode | null = null;
//           let targetServer: Server | null = data.servers[0] || null;

//           if (episodeQuery) {
//             // Try to find by episodeOrLabel
//             for (const server of data.servers) {
//               const found = server.episodes.find(
//                 (ep) =>
//                   ep.episodeOrLabel === episodeQuery || ep.slug === episodeQuery
//               );
//               if (found) {
//                 targetEpisode = found;
//                 targetServer = server;
//                 break;
//               }
//             }
//           }

//           // If no episode found, use first episode
//           if (
//             !targetEpisode &&
//             targetServer &&
//             targetServer.episodes.length > 0
//           ) {
//             targetEpisode = targetServer.episodes[0];
//           }

//           setCurrentEpisode(targetEpisode);
//           setCurrentServer(targetServer);

//           // Update URL if needed
//           if (targetEpisode && episodeQuery !== targetEpisode.episodeOrLabel) {
//             router.replace(
//               `/watch/${movieSlug}?ep=${targetEpisode.episodeOrLabel}`,
//               {
//                 scroll: false,
//               }
//             );
//           }
//         }
//       } catch (error) {
//         console.error("Lỗi khi tải dữ liệu:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [movieSlug, episodeQuery, router]);

//   // Handle episode selection
//   const handleSelectEpisode = (episode: Episode) => {
//     setCurrentEpisode(episode);
//     // router.replace(`/watch/${movieSlug}?ep=${episode.episodeOrLabel}`, {
//     //   scroll: false,
//     // });
//   };

//   // Find next/previous episodes
//   const { hasPrevEpisode, hasNextEpisode } = useMemo(() => {
//     if (!currentEpisode || episodesList.length === 0) {
//       return { hasPrevEpisode: false, hasNextEpisode: false };
//     }

//     // Sort episodes by episodeOrLabel
//     const sortedEpisodes = [...episodesList].sort((a, b) => {
//       const aNum = parseInt(a.episodeOrLabel);
//       const bNum = parseInt(b.episodeOrLabel);
//       if (!isNaN(aNum) && !isNaN(bNum)) {
//         return aNum - bNum;
//       }
//       return a.episodeOrLabel.localeCompare(b.episodeOrLabel);
//     });

//     const currentIndex = sortedEpisodes.findIndex(
//       (ep) => ep.slug === currentEpisode.slug
//     );

//     return {
//       hasPrevEpisode: currentIndex > 0,
//       hasNextEpisode: currentIndex < sortedEpisodes.length - 1,
//     };
//   }, [currentEpisode, episodesList]);

//   // Handle next/previous episode
//   const handleNextEpisode = () => {
//     if (!hasNextEpisode || !currentEpisode || episodesList.length === 0) return;

//     const sortedEpisodes = [...episodesList].sort((a, b) => {
//       const aNum = parseInt(a.episodeOrLabel);
//       const bNum = parseInt(b.episodeOrLabel);
//       if (!isNaN(aNum) && !isNaN(bNum)) {
//         return aNum - bNum;
//       }
//       return a.episodeOrLabel.localeCompare(b.episodeOrLabel);
//     });

//     const currentIndex = sortedEpisodes.findIndex(
//       (ep) => ep.slug === currentEpisode.slug
//     );

//     const nextEpisode = sortedEpisodes[currentIndex + 1];
//     if (nextEpisode) {
//       handleSelectEpisode(nextEpisode);
//     }
//   };

//   const handlePrevEpisode = () => {
//     if (!hasPrevEpisode || !currentEpisode || episodesList.length === 0) return;

//     const sortedEpisodes = [...episodesList].sort((a, b) => {
//       const aNum = parseInt(a.episodeOrLabel);
//       const bNum = parseInt(b.episodeOrLabel);
//       if (!isNaN(aNum) && !isNaN(bNum)) {
//         return aNum - bNum;
//       }
//       return a.episodeOrLabel.localeCompare(b.episodeOrLabel);
//     });

//     const currentIndex = sortedEpisodes.findIndex(
//       (ep) => ep.slug === currentEpisode.slug
//     );

//     const prevEpisode = sortedEpisodes[currentIndex - 1];
//     // if (prevEpisode) {
//     //   handleSelectEpisode(prevEpisode);
//     // }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-950 flex items-center justify-center mt-20">
//         <div className="flex flex-col items-center gap-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//           <p className="text-gray-400">Đang tải dữ liệu...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (!movieData || !currentEpisode) {
//     return (
//       <div className="min-h-screen bg-gray-950 flex items-center justify-center mt-20">
//         <div className="text-center p-8 bg-gray-900 rounded-xl">
//           <h3 className="text-xl font-semibold text-white mb-2">
//             Không tìm thấy phim
//           </h3>
//           <p className="text-gray-400 mb-6">
//             Phim bạn đang tìm kiếm có thể không tồn tại hoặc đã bị xóa.
//           </p>
//           <button
//             onClick={() => router.push("/")}
//             className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
//           >
//             Quay về trang chủ
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-100">
//       <div className="container mx-auto px-4 py-8">
//         {/* Breadcrumb */}
//         <nav className="flex items-center text-sm text-gray-400 space-x-2 mb-6">
//           <Link href="/" className="hover:text-white transition-colors">
//             Home
//           </Link>
//           <span>/</span>
//           <Link
//             href={`/movie/${movieData.movie.slug}`}
//             className="hover:text-white transition-colors"
//           >
//             {movieData.movie.title}
//           </Link>
//           <span>/</span>
//           <span className="text-white">
//             Tập {currentEpisode.episodeOrLabel}
//           </span>
//         </nav>

//         {/* Player Section */}
//         <div className="mb-8">
//           <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl mb-4">
//             <SimpleHLSPlayer
//               videoUrl={currentEpisode.videoUrl}
//               onEnded={handleNextEpisode}
//             />
//           </div>

//           {/* Episode Navigation */}
//           <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl">
//             <button
//               onClick={handlePrevEpisode}
//               disabled={!hasPrevEpisode}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                 hasPrevEpisode
//                   ? "bg-blue-600 hover:bg-blue-700"
//                   : "bg-gray-700 cursor-not-allowed"
//               }`}
//             >
//               ← Tập trước
//             </button>

//             <div className="text-center">
//               <h2 className="text-xl font-bold">{movieData.movie.title}</h2>
//               <p className="text-gray-400">
//                 Tập {currentEpisode.episodeOrLabel}
//               </p>
//             </div>

//             <button
//               onClick={handleNextEpisode}
//               disabled={!hasNextEpisode}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                 hasNextEpisode
//                   ? "bg-blue-600 hover:bg-blue-700"
//                   : "bg-gray-700 cursor-not-allowed"
//               }`}
//             >
//               Tập tiếp theo →
//             </button>
//           </div>
//         </div>

//         {/* Movie Info */}
//         <div className="mb-8 p-6 bg-gray-900 rounded-2xl">
//           <div className="flex flex-col md:flex-row gap-6">
//             <div className="w-full flex justify-center md:justify-start md:w-max">
//               <img
//                 src={movieData.movie.thumbnail}
//                 alt={movieData.movie.title}
//                 className="w-48 h-72 object-cover rounded-xl"
//               />
//             </div>
//             <div className="flex-1">
//               <h2 className="text-2xl font-bold mb-3">
//                 {movieData.movie.title}
//               </h2>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                 <div>
//                   <p className="text-gray-400 text-sm">Đánh giá</p>
//                   <p className="text-xl font-semibold text-yellow-400">
//                     {movieData.movie.ratingAvg}/10
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-400 text-sm">Lượt xem</p>
//                   <p className="text-xl font-semibold">
//                     {movieData.movie.views.toLocaleString()}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-400 text-sm">Loại</p>
//                   <p className="text-xl font-semibold">
//                     {movieData.movie.type === "SERIES" ? "Series" : "Phim lẻ"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-400 text-sm">Tập hiện tại</p>
//                   <p className="text-xl font-semibold">
//                     {currentEpisode.episodeOrLabel}
//                   </p>
//                 </div>
//               </div>
//               <p className="text-gray-300 leading-relaxed">
//                 {movieData.movie.description}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Episode List */}
//         {episodesList.length > 0 && (
//           <div className="mb-8">
//             <h3 className="text-xl font-semibold mb-4">Danh sách tập</h3>
//             <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
//               {episodesList.map((episode) => (
//                 <button
//                   key={episode.slug}
//                   // onClick={() => handleSelectEpisode(episode)}
//                   className={`p-3 rounded-lg text-center transition-colors ${
//                     currentEpisode.slug === episode.slug
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-800 hover:bg-gray-700"
//                   }`}
//                 >
//                   <div className="font-medium">Tập</div>
//                   <div className="text-lg font-bold">
//                     {episode.episodeOrLabel}
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
