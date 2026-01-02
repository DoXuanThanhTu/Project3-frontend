// "use client";

// import { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";
// // import "./watch.css"; // Tách CSS từ HTML vào đây

// interface VideoSource {
//   id: number;
//   name: string;
//   url: string;
//   description: string;
// }

// export default function WatchPage() {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [hls, setHls] = useState<Hls | null>(null);
//   const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
//   const [playerSettings, setPlayerSettings] = useState({
//     volume: 0.7,
//     playbackRate: 1.0,
//     isMuted: false,
//     isFullscreen: false,
//   });

//   const videoSources: VideoSource[] = [
//     {
//       id: 1,
//       name: "Video 1",
//       url: "https://disney-pixar-piper.netlify.app/video/master.m3u8",
//       description: "Video đầu tiên trong danh sách phát",
//     },
//     {
//       id: 2,
//       name: "Video 2",
//       url: "https://vip.opstream15.com/20220414/3803_022f3e24/index.m3u8",
//       description: "Video thứ hai sẽ phát tiếp theo",
//     },
//   ];

//   // Load video
//   const loadVideo = (index: number) => {
//     if (!videoRef.current) return;

//     const video = videoRef.current;
//     const source = videoSources[index];

//     video.pause();

//     if (hls) {
//       hls.destroy();
//       setHls(null);
//     }

//     if (video.canPlayType("application/vnd.apple.mpegurl")) {
//       // Safari
//       video.src = source.url;
//       video.load();
//       video.volume = playerSettings.volume;
//       video.playbackRate = playerSettings.playbackRate;
//       video.muted = playerSettings.isMuted;
//       video.play();
//     } else if (Hls.isSupported()) {
//       const newHls = new Hls({
//         enableWorker: true,
//         lowLatencyMode: true,
//         backBufferLength: 90,
//       });
//       newHls.loadSource(source.url);
//       newHls.attachMedia(video);
//       newHls.on(Hls.Events.MANIFEST_PARSED, () => {
//         video.volume = playerSettings.volume;
//         video.playbackRate = playerSettings.playbackRate;
//         video.muted = playerSettings.isMuted;
//         video.play();
//       });
//       setHls(newHls);
//     } else {
//       alert("Trình duyệt của bạn không hỗ trợ phát video HLS.");
//     }

//     setCurrentVideoIndex(index);
//     saveSettings({ ...playerSettings });
//   };

//   // Lưu settings
//   const saveSettings = (settings: typeof playerSettings) => {
//     localStorage.setItem("hlsPlayerSettings", JSON.stringify(settings));
//   };

//   // Toggle fullscreen
//   const toggleFullscreen = () => {
//     const videoContainer = document.querySelector(
//       ".player-container"
//     ) as HTMLElement;
//     if (!videoContainer) return;

//     if (!playerSettings.isFullscreen) {
//       if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
//       else if ((videoContainer as any).webkitRequestFullscreen)
//         (videoContainer as any).webkitRequestFullscreen();
//     } else {
//       if (document.exitFullscreen) document.exitFullscreen();
//       else if ((document as any).webkitExitFullscreen)
//         (document as any).webkitExitFullscreen();
//     }
//   };

//   // Handle video end
//   const handleVideoEnded = () => {
//     const nextIndex = (currentVideoIndex + 1) % videoSources.length;
//     loadVideo(nextIndex);
//   };

//   // Load settings on mount
//   useEffect(() => {
//     const savedSettings = localStorage.getItem("hlsPlayerSettings");
//     if (savedSettings) {
//       setPlayerSettings(JSON.parse(savedSettings));
//     }

//     if (videoRef.current) {
//       videoRef.current.addEventListener("ended", handleVideoEnded);
//     }

//     const handleFullscreenChange = () => {
//       setPlayerSettings((prev) => ({
//         ...prev,
//         isFullscreen: !!(
//           document.fullscreenElement ||
//           (document as any).webkitFullscreenElement
//         ),
//       }));
//     };

//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

//     // Load first video
//     loadVideo(currentVideoIndex);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       document.removeEventListener(
//         "webkitfullscreenchange",
//         handleFullscreenChange
//       );
//       if (hls) hls.destroy();
//     };
//   }, []);

//   // Update volume
//   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const volume = parseInt(e.target.value) / 100;
//     setPlayerSettings((prev) => ({ ...prev, volume }));
//     if (videoRef.current) videoRef.current.volume = volume;
//     saveSettings({ ...playerSettings, volume });
//   };

//   // Update playback rate
//   const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const playbackRate = parseFloat(e.target.value);
//     setPlayerSettings((prev) => ({ ...prev, playbackRate }));
//     if (videoRef.current) videoRef.current.playbackRate = playbackRate;
//     saveSettings({ ...playerSettings, playbackRate });
//   };

//   // Toggle mute
//   const toggleMute = () => {
//     if (!videoRef.current) return;
//     const muted = !videoRef.current.muted;
//     videoRef.current.muted = muted;
//     setPlayerSettings((prev) => ({ ...prev, isMuted: muted }));
//     saveSettings({ ...playerSettings, isMuted: muted });
//   };

//   // Play/Pause
//   const togglePlayPause = () => {
//     if (!videoRef.current) return;
//     if (videoRef.current.paused) videoRef.current.play();
//     else videoRef.current.pause();
//   };

//   // Next video
//   const nextVideo = () => {
//     const nextIndex = (currentVideoIndex + 1) % videoSources.length;
//     loadVideo(nextIndex);
//   };

//   return (
//     <div className="container">
//       <header>
//         <h1>🎬 HLS Player với Tự Động Chuyển Tiếp</h1>
//         <p>
//           Video sẽ tự động chuyển tiếp sang video tiếp theo mà không làm thay
//           đổi cài đặt
//         </p>
//       </header>

//       <main>
//         <div className="player-container">
//           <video ref={videoRef} controls></video>
//         </div>

//         <div className="controls-container">
//           <div className="control-buttons">
//             <button onClick={togglePlayPause}>
//               <span>⏯️</span> Phát/Tạm dừng
//             </button>
//             <button onClick={nextVideo}>
//               <span>⏭️</span> Video tiếp theo
//             </button>
//             <button onClick={toggleFullscreen}>
//               <span>📺</span> Toàn màn hình
//             </button>
//             <button onClick={toggleMute} className="secondary">
//               <span>{playerSettings.isMuted ? "🔊" : "🔇"}</span>{" "}
//               {playerSettings.isMuted ? "Bật tiếng" : "Tắt tiếng"}
//             </button>
//           </div>

//           <div className="settings-panel">
//             <h3>⚙️ Cài đặt trình phát</h3>
//             <div className="slider-container">
//               <label>
//                 Âm lượng: {Math.round(playerSettings.volume * 100)}%
//               </label>
//               <input
//                 type="range"
//                 min="0"
//                 max="100"
//                 value={Math.round(playerSettings.volume * 100)}
//                 onChange={handleVolumeChange}
//               />
//             </div>

//             <div className="slider-container">
//               <label>Tốc độ phát: {playerSettings.playbackRate}x</label>
//               <input
//                 type="range"
//                 min="0.25"
//                 max="3"
//                 step="0.25"
//                 value={playerSettings.playbackRate}
//                 onChange={handlePlaybackRateChange}
//               />
//             </div>
//           </div>

//           <div className="current-settings">
//             <div className="setting-item">
//               <div className="label">Trạng thái toàn màn hình</div>
//               <div className="value">
//                 {playerSettings.isFullscreen ? "Có" : "Không"}
//               </div>
//             </div>
//             <div className="setting-item">
//               <div className="label">Âm lượng hiện tại</div>
//               <div className="value">
//                 {Math.round(playerSettings.volume * 100)}%
//               </div>
//             </div>
//             <div className="setting-item">
//               <div className="label">Tốc độ phát hiện tại</div>
//               <div className="value">{playerSettings.playbackRate}x</div>
//             </div>
//             <div className="setting-item">
//               <div className="label">Video hiện tại</div>
//               <div className="value">
//                 {currentVideoIndex + 1}/{videoSources.length}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="video-list">
//           {videoSources.map((video, idx) => (
//             <div
//               key={video.id}
//               className={`video-card ${
//                 currentVideoIndex === idx ? "active" : ""
//               }`}
//               onClick={() => loadVideo(idx)}
//             >
//               <h3>📹 {video.name}</h3>
//               <p>{video.description}</p>
//               <div className="status-indicator">
//                 <div
//                   className={`status-dot ${
//                     currentVideoIndex === idx ? "playing" : "ended"
//                   }`}
//                 ></div>
//                 <span>
//                   {currentVideoIndex === idx ? "Đang phát..." : "Chờ phát..."}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>

//       <div className="fullscreen-notice">
//         Đang ở chế độ toàn màn hình - Cài đặt được giữ nguyên
//       </div>
//     </div>
//   );
// }
