"use client";
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  startTransition,
} from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";
import MenuController from "./MenuController";

/* =======================
   Types & Constants
   ======================= */
interface PlayerProps {
  linkEmbed: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    controlsBg?: string;
  };
  onEnded?: () => void;
  setting?: {
    volume?: number;
    speedrate?: number;
    follow?: boolean;
    autoPlay?: boolean;
    darkMode?: boolean;
    isfullScreen?: boolean;
  };
  onSettingChange?: (newSetting: Partial<PlayerProps["setting"]>) => void;
}

const defaultColors = {
  primary: "bg-purple-500",
  secondary: "text-purple-400",
  accent: "accent-purple-400",
  controlsBg: "bg-gradient-to-t from-black/90 via-black/60 to-transparent",
};

const LOCAL_KEY = "playerSettings";

/* =======================
   Utility helpers
   ======================= */
const formatTime = (time: number) => {
  if (isNaN(time) || time === Infinity) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

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
      el.removeEventListener(eventName, onEvent as any);
      clearTimeout(timer);
      resolve(ev);
    };
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      el.removeEventListener(eventName, onEvent as any);
      resolve(null);
    }, timeout);
    el.addEventListener(eventName, onEvent as any);
  });

/* =======================
   Hook: playback memory
   ======================= */
function usePlaybackMemory(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const wasPlayingRef = useRef(false);

  const rememberPlaybackState = useCallback(() => {
    const v = videoRef.current;
    wasPlayingRef.current = v ? !v.paused : false;
  }, [videoRef]);

  const restorePlaybackState = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    if (wasPlayingRef.current) {
      try {
        await v.play();
      } catch {}
    } else {
      try {
        v.pause();
      } catch {}
    }
  }, [videoRef]);

  return { rememberPlaybackState, restorePlaybackState };
}

/* =======================
   Player Component
   ======================= */
export default function Player({
  linkEmbed,
  colors = {},
  onEnded,
  setting: propSetting,
  onSettingChange,
}: PlayerProps) {
  const playerColors = { ...defaultColors, ...colors };

  // refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const seekTokenRef = useRef(0);
  const prevVolumeRef = useRef<number>(1);
  const propSettingRef = useRef(propSetting);
  const isSwitchingSourceRef = useRef(false);

  // value refs for stable saving
  const volumeRef = useRef<number>(1);
  const playbackRateRef = useRef<number>(1);
  const isFullScreenRef = useRef<boolean>(false);

  // seeking refs
  const isSeekingRef = useRef(false);
  const pendingSeekValueRef = useRef<number | null>(null);
  const seekWasPlayingRef = useRef(false);

  // state
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
  const [currentQuality, setCurrentQuality] = useState<string | number>("auto");

  const { rememberPlaybackState, restorePlaybackState } =
    usePlaybackMemory(videoRef);

  /* =======================
     keep refs in sync with state
     ======================= */
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    isFullScreenRef.current = isFullScreen;
  }, [isFullScreen]);

  /* =======================
     Local storage helpers (stable)
     - reads current values from refs unless override provided
     ======================= */
  const saveSettingsToLocal = useCallback(
    (override?: Partial<Record<string, any>>) => {
      const video = videoRef.current;
      const payload = {
        volume:
          override?.volume ??
          Math.round((override?.volumeRaw ?? volumeRef.current * 100) || 0),
        speedrate: override?.speedrate ?? playbackRateRef.current,
        follow: propSettingRef.current?.follow ?? true,
        autoPlay: propSettingRef.current?.autoPlay ?? true,
        darkMode: propSettingRef.current?.darkMode ?? false,
        isfullScreen:
          override?.isfullScreen ?? isFullScreenRef.current ?? false,
        currentTime:
          typeof override?.currentTime === "number"
            ? override.currentTime
            : video?.currentTime ?? 0,
      };
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
      } catch {}
    },
    []
  ); // stable, no reactive deps

  const readSettingsFromLocal = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  /* =======================
     Apply settings
     ======================= */
  const applyPropSettings = useCallback(
    (settings?: PlayerProps["setting"]) => {
      if (!settings) return;
      const v = videoRef.current;
      if (!v) return;

      if (settings.speedrate !== undefined) {
        const newRate = Math.min(Math.max(settings.speedrate, 0.25), 4);
        v.playbackRate = newRate;
        // setPlaybackRate(newRate);
      }

      if (settings.volume === 0) {
        v.muted = true;
        setIsMuted(true);
        setVolume(0);
      }

      if (onSettingChange) {
        onSettingChange(settings);
      }
    },
    [onSettingChange]
  );

  const applySavedSettings = useCallback((savedSettings: any) => {
    const v = videoRef.current;
    if (!v) return;

    const propSettings = propSettingRef.current;

    const volumeValue =
      propSettings?.volume !== undefined
        ? Math.min(Math.max(propSettings.volume / 100, 0), 1)
        : savedSettings?.volume !== undefined
        ? Math.min(Math.max(savedSettings.volume / 100, 0), 1)
        : 1;

    setVolume(volumeValue);
    v.volume = volumeValue;

    const rateValue =
      propSettings?.speedrate !== undefined
        ? propSettings.speedrate
        : savedSettings?.speedrate ?? savedSettings?.playbackRate ?? 1;

    setPlaybackRate(rateValue);
    v.playbackRate = rateValue;

    const isMutedValue =
      propSettings?.volume === 0 ? true : !!savedSettings?.isMuted;
    setIsMuted(isMutedValue);
    v.muted = isMutedValue;

    if (savedSettings?.currentTime && savedSettings.currentTime > 0) {
      const applyTime = () => {
        try {
          v.currentTime = Math.min(
            savedSettings.currentTime || 0,
            v.duration || 0
          );
          setCurrentTime(v.currentTime);
          setProgress((v.currentTime / (v.duration || 1)) * 100 || 0);
        } catch {}
      };
      if (v.readyState >= 2) applyTime();
      else {
        const onLoaded = () => {
          applyTime();
          v.removeEventListener("loadedmetadata", onLoaded);
        };
        v.addEventListener("loadedmetadata", onLoaded);
      }
    }
  }, []);

  /* =======================
     HLS Initialization & cleanup
     ======================= */
  const tryFlushHlsBuffer = useCallback(() => {
    const hls = hlsRef.current as any;
    if (!hls) return;
    try {
      const bufferController = hls.bufferController;
      const sourceBufferMap = bufferController?.sourceBuffer;
      if (sourceBufferMap) {
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
  }, []);

  const setupHlsForVideo = useCallback(
    (src: string) => {
      const video = videoRef.current;
      if (!video) return;

      isSwitchingSourceRef.current = true;
      startTransition(() => setIsLoading(true));

      // destroy previous
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
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
        hls.loadSource(src);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data: any) => {
          const availableQualities = (data.levels || [])
            .map((l: any) => l.height)
            .filter(Boolean)
            .sort((a: number, b: number) => a - b);
          setQualities(availableQualities);
        });

        const onLoadedMeta = () => {
          const saved = readSettingsFromLocal();
          if (saved) applySavedSettings(saved);
          else if (propSettingRef.current)
            applyPropSettings(propSettingRef.current);

          setIsLoading(false);
          isSwitchingSourceRef.current = false;

          if (propSettingRef.current?.autoPlay) {
            video.play().catch(() => {});
          }
        };

        video.addEventListener("loadedmetadata", onLoadedMeta, { once: true });

        // return cleanup for this setup
        return () => {
          video.removeEventListener("loadedmetadata", onLoadedMeta);
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        const onLoadedMeta = () => {
          const saved = readSettingsFromLocal();
          if (saved) applySavedSettings(saved);
          setIsLoading(false);
          isSwitchingSourceRef.current = false;
        };
        video.addEventListener("loadedmetadata", onLoadedMeta, { once: true });
        return () => video.removeEventListener("loadedmetadata", onLoadedMeta);
      } else {
        // unsupported
        setIsLoading(false);
        isSwitchingSourceRef.current = false;
      }
      return;
    },
    [applySavedSettings, applyPropSettings, readSettingsFromLocal]
  );

  // watch linkEmbed changes
  useEffect(() => {
    const cleanup = setupHlsForVideo(linkEmbed);
    return () => {
      if (typeof cleanup === "function") cleanup();
      isSwitchingSourceRef.current = false;
    };
  }, [linkEmbed, setupHlsForVideo]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
    };
  }, []);

  /* =======================
     Video event wiring
     ======================= */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const syncPlayState = () => setIsPlaying(!v.paused);
    const handleEnded = () => {
      if (onEnded) onEnded();
    };

    v.addEventListener("play", syncPlayState);
    v.addEventListener("pause", syncPlayState);
    v.addEventListener("ended", handleEnded);

    return () => {
      v.removeEventListener("play", syncPlayState);
      v.removeEventListener("pause", syncPlayState);
      v.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const updateProgress = () => {
      if (isSwitchingSourceRef.current) return;
      setProgress((v.currentTime / (v.duration || 1)) * 100);
      setCurrentTime(v.currentTime);
      setDuration(v.duration || 0);
    };

    const updateBuffer = () => {
      if (v.buffered.length > 0 && v.duration) {
        const end = v.buffered.end(v.buffered.length - 1);
        setBuffered((end / v.duration) * 100);
      }
    };

    v.addEventListener("timeupdate", updateProgress);
    v.addEventListener("progress", updateBuffer);

    return () => {
      v.removeEventListener("timeupdate", updateProgress);
      v.removeEventListener("progress", updateBuffer);
    };
  }, []);

  /* =======================
     Fullscreen tracking
     - listens to real document.fullscreenElement
     - saves with override to avoid race
     ======================= */
  useEffect(() => {
    const onFsChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullScreen(isNowFullscreen);
      saveSettingsToLocal({ isfullScreen: isNowFullscreen });
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [saveSettingsToLocal]);

  /* =======================
     Handlers (useCallback)
     ======================= */
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
    // save currentTime and other stable values
    saveSettingsToLocal();
  }, [saveSettingsToLocal]);

  const handleSeekStart = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      isSeekingRef.current = true;
      seekWasPlayingRef.current = isPlaying;
      pendingSeekValueRef.current = Number(
        (e.target as HTMLInputElement).value
      );
    },
    [isPlaying]
  );

  const handleSeekMove = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      pendingSeekValueRef.current = val;
      setProgress(val);
    },
    []
  );

  const safeSeek = useCallback(
    async (time: number) => {
      const video = videoRef.current;
      const hls = hlsRef.current;
      if (!video) return;

      const token = ++seekTokenRef.current;
      const wasPlaying = !video.paused;
      setIsLoading(true);

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
      setProgress((targetTime / (video.duration || 1)) * 100);

      if (wasPlaying) {
        try {
          video.currentTime = targetTime;
          if (!isSeekingRef.current) setIsPlaying(true);
          const p = video.play();
          if (p && typeof (p as any).catch === "function")
            (p as any).catch(() => {});
        } catch {}

        if (hls && !inBuffer) {
          tryFlushHlsBuffer();
          try {
            if (typeof (hls as any).startLoad === "function")
              (hls as any).startLoad(targetTime);
          } catch {}
        }

        await waitForEvent(video, "seeked", 1200);
        await waitForEvent(video, "canplay", 1500);
        setIsLoading(false);
        if (!isSeekingRef.current) setIsPlaying(!video.paused);
        saveSettingsToLocal({ currentTime: video.currentTime });
        return;
      }

      try {
        video.pause();
      } catch {}

      if (hls && !inBuffer) {
        tryFlushHlsBuffer();
        try {
          if (typeof (hls as any).startLoad === "function")
            (hls as any).startLoad(targetTime);
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
      saveSettingsToLocal({ currentTime: video.currentTime });
    },
    [tryFlushHlsBuffer, saveSettingsToLocal]
  );

  const handleSeekEnd = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
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
    },
    [safeSeek]
  );

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    if (v.muted || v.volume === 0) {
      v.muted = false;
      v.volume = prevVolumeRef.current || 1;
      setVolume(prevVolumeRef.current || 1);
      setIsMuted(false);
      // save explicit volume override so it's immediate
      saveSettingsToLocal({
        volume: Math.round((prevVolumeRef.current || 1) * 100),
        volumeRaw: (prevVolumeRef.current || 1) * 100,
      });
      if (onSettingChange)
        onSettingChange({ volume: Math.round(prevVolumeRef.current * 100) });
    } else {
      prevVolumeRef.current = v.volume || 1;
      v.volume = 0;
      v.muted = true;
      setVolume(0);
      setIsMuted(true);
      saveSettingsToLocal({ volume: 0, volumeRaw: 0 });
      if (onSettingChange) onSettingChange({ volume: 0 });
    }
  }, [onSettingChange, saveSettingsToLocal]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVol = Number(e.target.value);
      if (videoRef.current) {
        videoRef.current.volume = newVol;
        videoRef.current.muted = newVol === 0;
      }
      setVolume(newVol);
      setIsMuted(newVol === 0);
      if (onSettingChange)
        onSettingChange({ volume: Math.round(newVol * 100) });
      // pass override so saved value is exact immediately
      saveSettingsToLocal({
        volume: Math.round(newVol * 100),
        volumeRaw: Math.round(newVol * 100),
      });
    },
    [onSettingChange, saveSettingsToLocal]
  );

  const toggleFullScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // do NOT set state or save here — let fullscreenchange event handle it
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 2500);
  }, []);

  const changeSpeed = useCallback(
    (speed: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.playbackRate = speed;
      setPlaybackRate(speed);
      if (onSettingChange) onSettingChange({ speedrate: speed });
      // override to ensure immediate save
      saveSettingsToLocal({ speedrate: speed });
    },
    [onSettingChange, saveSettingsToLocal]
  );

  const changeQuality = useCallback(
    (quality: number | "auto") => {
      const hls = hlsRef.current;
      const v = videoRef.current;
      if (!hls || !v) return;

      rememberPlaybackState();
      saveSettingsToLocal();

      const ct = v.currentTime;
      setProgress(0);
      setBuffered(0);
      setDuration(0);
      setIsLoading(true);

      const resumePlayback = async () => {
        await safeSeek(ct);
        await restorePlaybackState();
        const video = videoRef.current;
        if (video) setIsPlaying(!video.paused);
        saveSettingsToLocal();
      };

      v.pause();

      if (quality === "auto") {
        hls.currentLevel = -1;
        setCurrentQuality("auto");
        resumePlayback();
        return;
      }

      const levelIndex = (hls.levels || []).findIndex(
        (l: any) => l.height === quality
      );
      if (levelIndex === -1) {
        console.warn(`Quality ${quality}px not found`);
        setIsLoading(false);
        return;
      }

      hls.loadLevel = levelIndex;
      hls.currentLevel = levelIndex;
      setCurrentQuality(String(quality));
      try {
        (hls as any).startLoad();
      } catch {}

      v.currentTime = ct;

      const onLevelLoaded = () => {
        try {
          hls.off(Hls.Events.LEVEL_LOADED, onLevelLoaded);
        } catch {}
        setIsLoading(false);
        resumePlayback();
      };

      const onCanPlay = () => {
        v.removeEventListener("canplay", onCanPlay);
        setIsLoading(false);
        resumePlayback();
      };

      hls.on(Hls.Events.LEVEL_LOADED, onLevelLoaded);
      v.addEventListener("canplay", onCanPlay);
    },
    [rememberPlaybackState, restorePlaybackState, safeSeek, saveSettingsToLocal]
  );

  /* =======================
     Prop settings watcher
     ======================= */
  useEffect(() => {
    if (propSetting) {
      propSettingRef.current = propSetting;
      applyPropSettings(propSetting);
    }
  }, [propSetting, applyPropSettings]);

  /* =======================
     Initial load: try to apply saved settings
     ======================= */
  useEffect(() => {
    const saved = readSettingsFromLocal();
    if (saved) applySavedSettings(saved);
  }, [readSettingsFromLocal, applySavedSettings]);

  /* =======================
     Render
     ======================= */
  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-black overflow-hidden ${
        showControls ? "cursor-auto" : "cursor-none"
      }`}
      onMouseMove={handleMouseMove}
    >
      <video ref={videoRef} className="w-full h-full" playsInline />

      {/* overlay clickable area toggles play */}
      <div className="absolute inset-0" onClick={togglePlay} />

      {isLoading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 pointer-events-none">
          <Loader2
            className={`animate-spin ${playerColors.secondary}`}
            size={42}
          />
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 ${
          playerColors.controlsBg
        } text-white p-3 flex flex-col gap-2 transition-opacity duration-300 z-30 ${
          showControls ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* progress bar */}
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

        {/* controls row */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-1"
              aria-label="Play/Pause"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1"
              aria-label="Mute/Unmute"
            >
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
              aria-label="Toggle fullscreen"
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
