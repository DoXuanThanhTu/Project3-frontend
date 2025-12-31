"use client";
import React, { useRef, useState, useEffect, startTransition } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import MenuController from "./MenuController";

// ✅ Hook lưu và khôi phục trạng thái phát
function usePlaybackMemory(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const wasPlayingRef = useRef(false);

  const rememberPlaybackState = () => {
    const video = videoRef.current;
    wasPlayingRef.current = video ? !video.paused : false;
  };

  const restorePlaybackState = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (wasPlayingRef.current) {
      video.play()?.catch(() => {});
    } else {
      video.pause();
    }
  };

  return { rememberPlaybackState, restorePlaybackState };
}

// ✅ Interface cho props
interface PlayerProps {
  linkEmbed: string;
  colors?: {
    primary?: string; // Màu chính (progress bar)
    secondary?: string; // Màu phụ (loading icon)
    accent?: string; // Màu nhấn (volume slider)
    controlsBg?: string; // Màu nền controls
  };
  onEnded?: () => void; // Thêm prop onEnded
}

// ✅ Màu mặc định
const defaultColors = {
  primary: "bg-purple-500",
  secondary: "text-purple-400",
  accent: "accent-purple-400",
  controlsBg: "bg-gradient-to-t from-black/90 via-black/60 to-transparent",
};

export default function Player({
  linkEmbed,
  colors = {},
  onEnded,
}: PlayerProps) {
  // ✅ Merge màu custom với màu mặc định
  const playerColors = {
    ...defaultColors,
    ...colors,
  };
  const prevVolumeRef = useRef<number>(100);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const seekTokenRef = useRef(0);

  const isSeekingRef = useRef(false);
  const pendingSeekValueRef = useRef<number | null>(null);
  const seekWasPlayingRef = useRef<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<
    "main" | "speed" | "quality"
  >("main");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [qualities, setQualities] = useState<number[]>([]);
  const [currentQuality, setCurrentQuality] = useState("auto");

  const { rememberPlaybackState, restorePlaybackState } =
    usePlaybackMemory(videoRef);

  // ✅ Format time helper
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // ✅ Wait for event with timeout helper
  const waitForEvent = (
    el: EventTarget,
    eventName: string,
    timeout = 1500
  ): Promise<Event | null> =>
    new Promise((resolve) => {
      let done = false;
      const onEvent = (ev: Event) => {
        if (done) return;
        done = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        el.removeEventListener(eventName, onEvent as any);
        clearTimeout(timer);
        resolve(ev);
      };
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        el.removeEventListener(eventName, onEvent as any);
        resolve(null);
      }, timeout);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      el.addEventListener(eventName, onEvent as any);
    });

  // ✅ safeSeek
  const safeSeek = async (time: number) => {
    const video = videoRef.current;
    const hls = hlsRef.current;
    if (!video) return;

    const token = ++seekTokenRef.current;
    const wasPlaying = !video.paused;
    setIsLoading(true);

    const tryFlush = () => {
      if (!hls) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bufferController = (hls as any).bufferController;
        const sourceBufferMap = bufferController?.sourceBuffer;
        if (sourceBufferMap) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Object.values(sourceBufferMap).forEach((sb: any) => {
            try {
              if (sb?.buffered?.length) {
                const end = sb.buffered.end(sb.buffered.length - 1);
                sb.remove(0, end);
              }
            } catch {}
          });
        }
      } catch {}
    };

    let inBuffer = false;
    try {
      const b = video.buffered;
      for (let i = 0; i < b.length; i++) {
        if (time >= b.start(i) && time <= b.end(i)) {
          inBuffer = true;
          break;
        }
      }
    } catch {}

    const seekOffset = inBuffer ? 0.08 : 0;
    const targetTime = Math.max(0, time + seekOffset);

    setCurrentTime(targetTime);
    setProgress((targetTime / video.duration) * 100);

    if (wasPlaying) {
      try {
        video.currentTime = targetTime;
        if (!isSeekingRef.current) setIsPlaying(true);
        const p = video.play();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (p && typeof (p as any).catch === "function")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p as any).catch(() => {});
      } catch {}

      if (hls && !inBuffer) {
        tryFlush();
        try {
          if (typeof hls.startLoad === "function") hls.startLoad(targetTime);
        } catch {}
      }

      await waitForEvent(video, "seeked", 1200);
      await waitForEvent(video, "canplay", 1500);

      setIsLoading(false);
      if (!isSeekingRef.current) setIsPlaying(!video.paused);
      return;
    }

    try {
      video.pause();
    } catch {}

    if (hls && !inBuffer) {
      tryFlush();
      try {
        if (typeof hls.startLoad === "function") hls.startLoad(targetTime);
      } catch {}
    }

    try {
      video.currentTime = targetTime;
    } catch {
      await new Promise((r) => setTimeout(r, 20));
      video.currentTime = targetTime;
    }

    await waitForEvent(video, "seeked", 1200);
    await waitForEvent(video, "canplay", 1500);

    setIsLoading(false);
  };

  // ✅ setup HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlayState = () => setIsPlaying(!video.paused);
    const handleEnded = () => {
      if (onEnded) {
        onEnded();
      }
    };

    video.addEventListener("play", syncPlayState);
    video.addEventListener("pause", syncPlayState);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", syncPlayState);
      video.removeEventListener("pause", syncPlayState);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  // ✅ setup HLS khi đổi link
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    startTransition(() => {
      setIsPlaying(false);
      setIsLoading(true);
      setProgress(0);
      setBuffered(0);
      setCurrentTime(0);
      setDuration(0);
    });

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 5,
      maxBufferLength: 15,
      maxMaxBufferLength: 30,
      liveSyncDuration: 2,
      liveMaxLatencyDuration: 4,
      maxFragLookUpTolerance: 0.5,
    });
    hlsRef.current = hls;

    hls.attachMedia(video);
    hls.loadSource(linkEmbed);

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      const availableQualities = data.levels
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((l: any) => l.height)
        .filter(Boolean)
        .sort((a: number, b: number) => a - b);
      setQualities(availableQualities);
    });

    const onCanPlay = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    video.addEventListener("canplay", onCanPlay);

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      hls.destroy();
    };
  }, [linkEmbed]);

  // ✅ Update progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    };
    const updateBuffer = () => {
      if (video.buffered.length > 0 && video.duration) {
        const end = video.buffered.end(video.buffered.length - 1);
        setBuffered((end / video.duration) * 100);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("progress", updateBuffer);
    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("progress", updateBuffer);
    };
  }, []);

  // ✅ Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // ✅ Seek handlers
  const handleSeekStart = (e: React.PointerEvent<HTMLInputElement>) => {
    isSeekingRef.current = true;
    seekWasPlayingRef.current = isPlaying;
    pendingSeekValueRef.current = Number((e.target as HTMLInputElement).value);
  };

  const handleSeekMove = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    pendingSeekValueRef.current = val;
    setProgress(val);
  };

  const handleSeekEnd = (e: React.PointerEvent<HTMLInputElement>) => {
    isSeekingRef.current = false;
    const val =
      pendingSeekValueRef.current ??
      Number((e.target as HTMLInputElement).value);
    pendingSeekValueRef.current = null;

    const video = videoRef.current;
    if (!video || !video.duration) return;
    const newTime = (val / 100) * video.duration;

    setCurrentTime(newTime);
    safeSeek(newTime).then(() => {
      setIsPlaying(seekWasPlayingRef.current);
    });
  };

  // ✅ Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    // Đang mute → khôi phục volume trước đó
    if (video.muted || video.volume === 0) {
      video.muted = false;
      video.volume = prevVolumeRef.current;

      setVolume(prevVolumeRef.current);
      setIsMuted(false);
      return;
    }

    // Chưa mute → lưu volume hiện tại rồi giảm về 0
    prevVolumeRef.current = video.volume;
    video.volume = 0;
    video.muted = true;

    setVolume(0);
    setIsMuted(true);
  };

  // ✅ Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  // ✅ Fullscreen toggle
  const toggleFullScreen = () => {
    const player = videoRef.current?.parentElement;
    if (!player) return;
    if (!document.fullscreenElement) {
      player.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // ✅ Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 2500);
  };

  // ✅ Change speed
  const changeSpeed = (speed: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackRate(speed);
    }
  };

  // ✅ Change quality
  const changeQuality = (quality: number | "auto") => {
    const hls = hlsRef.current;
    const video = videoRef.current;
    if (!hls || !video) return;

    rememberPlaybackState();

    const ct = video.currentTime;
    setProgress(0);
    setBuffered(0);
    setDuration(0);
    setIsLoading(true);

    const resumePlayback = async () => {
      await safeSeek(ct);
      await restorePlaybackState();
      const video = videoRef.current;
      if (video) setIsPlaying(!video.paused);
    };

    video.pause();

    if (quality === "auto") {
      hls.currentLevel = -1;
      setCurrentQuality("auto");
      resumePlayback();
      return;
    }

    const levelIndex = hls.levels.findIndex((l) => l.height === quality);
    if (levelIndex === -1) {
      console.warn(`⚠️ Không tìm thấy chất lượng ${quality}px`);
      setIsLoading(false);
      return;
    }

    hls.loadLevel = levelIndex;
    hls.currentLevel = levelIndex;
    setCurrentQuality(String(quality));
    hls.startLoad();
    video.currentTime = ct;

    const onLevelLoaded = () => {
      hls.off(Hls.Events.LEVEL_LOADED, onLevelLoaded);
      setIsLoading(false);
      resumePlayback();
    };

    const onCanPlay = () => {
      video.removeEventListener("canplay", onCanPlay);
      setIsLoading(false);
      resumePlayback();
    };

    hls.on(Hls.Events.LEVEL_LOADED, onLevelLoaded);
    video.addEventListener("canplay", onCanPlay);
  };

  return (
    <div
      className={`relative w-full aspect-video bg-black overflow-hidden ${
        showControls ? "cursor-auto" : "cursor-none"
      }`}
      onMouseMove={handleMouseMove}
    >
      <video ref={videoRef} className="w-full h-full" playsInline />

      <div className="absolute inset-0" onClick={togglePlay} />

      {isLoading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 pointer-events-none">
          <Loader2
            className={`animate-spin ${playerColors.secondary}`}
            size={42}
          />
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 ${
          playerColors.controlsBg
        } text-white p-3 flex flex-col gap-2 transition-opacity duration-300 z-30 ${
          showControls ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="relative w-full h-1.5 bg-gray-700 rounded overflow-hidden mb-1">
          <div
            className="absolute top-0 left-0 h-full bg-gray-500/40"
            style={{ width: `${buffered}%` }}
          />
          <div
            className={`absolute top-0 left-0 h-full ${playerColors.primary}`}
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onPointerDown={handleSeekStart}
            onChange={handleSeekMove}
            onPointerUp={handleSeekEnd}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="p-1">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <button onClick={toggleMute} className="p-1">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className={`w-20 ${playerColors.accent}`}
            />

            <div className="text-gray-300 text-xs select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <MenuController
              isLoading={isLoading}
              showSettings={showSettings}
              settingsView={settingsView}
              currentQuality={currentQuality}
              playbackRate={playbackRate}
              qualities={qualities}
              onChangeView={(v) => setSettingsView(v)}
              onChangeSpeed={changeSpeed}
              onChangeQuality={changeQuality}
              onClose={() => {
                setShowSettings(false);
                setTimeout(() => setSettingsView("main"), 260);
              }}
              onOpen={(e) => {
                e.stopPropagation();
                setShowSettings(true);
                setSettingsView("main");
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullScreen();
              }}
              className="p-1"
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
