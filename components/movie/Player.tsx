"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Hls from "hls.js";
import {
  Loader2,
  Pause,
  Volume2,
  VolumeX,
  Play,
  Minimize,
  Maximize,
  SkipForward,
} from "lucide-react";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import MenuController from "./MenuController";
import api from "@/lib/api";
import useAuthStore from "@/stores/auth.store";

interface PlayerProps {
  linkEmbed?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    controlsBg?: string;
  };
  movieSlug?: string;
  movieId?: string;
  episode?: string;
  episodeId?: string;
  onNext?: () => void;
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

interface HistoryItem {
  videoKey: string;
  currentTime: number;
  duration: number;
  timestamp: number;
  expires: number;
  synced?: boolean;
  movieId?: string;
  episodeId?: string;
}

const defaultColors = {
  primary: "bg-purple-500",
  secondary: "text-purple-400",
  accent: "accent-purple-400",
  controlsBg: "bg-gradient-to-t from-black/90 via-black/60 to-transparent",
};

const LOCAL_KEY = "playerSettings";
const HISTORY_KEY = "playerHistory";
const VIEW_COUNTED_KEY = "viewCounted";

export default function Player({
  linkEmbed,
  colors = {},
  onEnded,
  onNext,
  setting: propSetting,
  onSettingChange,
  movieSlug,
  movieId,
  episode,
  episodeId,
}: PlayerProps) {
  const playerColors = { ...defaultColors, ...colors };
  const user = useAuthStore((state) => state.user);
  const [hasCountedView, setHasCountedView] = useState(false);
  const watchTimeRef = useRef(0);
  const lastSaveTimeRef = useRef(0);
  const viewCountedRef = useRef(false);

  // Refs cho việc đồng bộ
  const isSyncingRef = useRef(false);
  const syncQueueRef = useRef<Set<string>>(new Set()); // Track các videoKey đang được đồng bộ

  // Function để tạo key duy nhất cho video (kết hợp movieId và episodeId)
  const generateViewKey = useCallback((movieId: string, episodeId?: string) => {
    if (!movieId) return null;
    return episodeId ? `${movieId}_${episodeId}` : movieId;
  }, []);

  // Function để tạo key cho history (dùng movieSlug và episode)
  const generateHistoryKey = useCallback(
    (movieSlug?: string, episode?: string) => {
      if (!movieSlug) return null;
      return episode ? `${movieSlug}-${episode}` : movieSlug;
    },
    []
  );

  /* =======================
     SYNC HISTORY FUNCTIONS - Đơn giản hóa
     ======================= */

  // Lấy danh sách lịch sử chưa đồng bộ từ localStorage
  const getUnsyncedHistory = useCallback((): HistoryItem[] => {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      if (!historyStr) return [];

      const history: HistoryItem[] = JSON.parse(historyStr);
      const now = Date.now();

      // Lấy các item chưa đồng bộ, còn hạn, và có đủ thông tin
      return history.filter(
        (item) => !item.synced && item.movieId && item.expires > now
      );
    } catch (error) {
      console.error("Error getting unsynced history:", error);
      return [];
    }
  }, []);

  // Đồng bộ một item lịch sử lên server
  const syncHistoryItem = useCallback(
    async (item: HistoryItem): Promise<boolean> => {
      if (!user || !item.movieId || syncQueueRef.current.has(item.videoKey)) {
        return false;
      }

      // Đánh dấu đang đồng bộ
      syncQueueRef.current.add(item.videoKey);
      isSyncingRef.current = true;

      try {
        const response = await api.post("/watchHistory", {
          movieId: item.movieId,
          episodeId: item.episodeId || null,
          currentTime: Math.floor(item.currentTime),
          duration: Math.floor(item.duration),
          watchedAt: new Date(item.timestamp).toISOString(),
        });

        if (response.status === 200 || response.status === 201) {
          console.log("Successfully synced history item:", item.videoKey);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error syncing history item:", error);
        return false;
      } finally {
        // Xóa khỏi queue sau khi đồng bộ xong
        syncQueueRef.current.delete(item.videoKey);
        isSyncingRef.current = false;
      }
    },
    [user]
  );

  // Cập nhật trạng thái đồng bộ trong localStorage
  const updateSyncStatus = useCallback((videoKey: string, synced: boolean) => {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      if (!historyStr) return;

      const history: HistoryItem[] = JSON.parse(historyStr);
      const updatedHistory = history.map((item) => {
        if (item.videoKey === videoKey) {
          return { ...item, synced };
        }
        return item;
      });

      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error updating sync status:", error);
    }
  }, []);

  // Hàm đồng bộ tất cả lịch sử khi user đăng nhập
  const syncAllHistoryOnLogin = useCallback(async () => {
    if (!user || isSyncingRef.current) return;

    isSyncingRef.current = true;
    const unsyncedItems = getUnsyncedHistory();

    if (unsyncedItems.length === 0) {
      console.log("No unsynced history items to sync");
      isSyncingRef.current = false;
      return;
    }

    console.log(
      `Found ${unsyncedItems.length} unsynced history items, syncing...`
    );

    // Đồng bộ từng item một, tuần tự
    for (const item of unsyncedItems) {
      if (!user) break; // Dừng nếu user logout trong khi đang đồng bộ

      try {
        const success = await syncHistoryItem(item);
        if (success) {
          updateSyncStatus(item.videoKey, true);
          console.log("Synced:", item.videoKey);
        } else {
          console.log("Failed to sync:", item.videoKey);
        }

        // Nghỉ một chút giữa các request để tránh quá tải
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error("Error syncing item:", item.videoKey, error);
        break;
      }
    }

    isSyncingRef.current = false;
    console.log("All history sync completed");
  }, [user, getUnsyncedHistory, syncHistoryItem, updateSyncStatus]);

  // Hàm đồng bộ một item ngay lập tức (cho lịch sử mới)
  const syncSingleItemImmediately = useCallback(
    async (item: HistoryItem) => {
      if (!user || !item.movieId) return false;

      try {
        const success = await syncHistoryItem(item);
        if (success) {
          updateSyncStatus(item.videoKey, true);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to sync item immediately:", error);
        return false;
      }
    },
    [user, syncHistoryItem, updateSyncStatus]
  );

  // Khi user đăng nhập, đồng bộ tất cả lịch sử cũ
  useEffect(() => {
    if (user) {
      console.log("User logged in, syncing all unsynced history...");
      syncAllHistoryOnLogin();
    }
  }, [user, syncAllHistoryOnLogin]);

  /* =======================
     VIEW COUNTING FUNCTIONS
     ======================= */

  const checkIfViewCounted = useCallback(
    (movieId?: string, episodeId?: string) => {
      if (!movieId) return true;

      const viewKey = generateViewKey(movieId as string, episodeId);
      if (!viewKey) return true;

      try {
        const countedData = localStorage.getItem(VIEW_COUNTED_KEY);
        if (!countedData) return false;

        const countedItems = JSON.parse(countedData);
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;

        const existingItem = countedItems.find(
          (item: any) => item.viewKey === viewKey && item.timestamp > oneDayAgo
        );

        return !!existingItem;
      } catch {
        return false;
      }
    },
    [generateViewKey]
  );

  const markViewAsCounted = useCallback(
    (movieId: string, episodeId?: string) => {
      if (!movieId) return;

      const viewKey = generateViewKey(movieId, episodeId);
      if (!viewKey) return;

      try {
        const countedData = localStorage.getItem(VIEW_COUNTED_KEY);
        let countedItems = countedData ? JSON.parse(countedData) : [];

        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        countedItems = countedItems.filter(
          (item: any) => item.timestamp > oneDayAgo
        );

        countedItems.push({
          viewKey,
          movieId,
          episodeId,
          timestamp: now,
          expires: now + 24 * 60 * 60 * 1000,
        });

        countedItems = countedItems.slice(-100);

        localStorage.setItem(VIEW_COUNTED_KEY, JSON.stringify(countedItems));
        viewCountedRef.current = true;
        setHasCountedView(true);
      } catch (error) {
        console.error("Error marking view as counted:", error);
      }
    },
    [generateViewKey]
  );

  const incrementView = useCallback(async () => {
    if (!movieId || viewCountedRef.current) return;

    try {
      if (checkIfViewCounted(movieId, episodeId)) {
        viewCountedRef.current = true;
        setHasCountedView(true);
        return;
      }

      let sessionId = localStorage.getItem("player_session_id");
      if (!sessionId) {
        sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("player_session_id", sessionId);
      }

      const response = await api.post("/view/increment", {
        movieId: movieId,
        episodeId: episodeId,
        sessionId: sessionId,
        watchDuration: 30,
        viewType: episodeId ? "episode" : "movie",
        isUnique: true,
      });

      if (response) {
        const data = response.data;
        console.log("View incremented:", data);

        markViewAsCounted(movieId, episodeId);
      } else {
        console.error("Failed to increment view:", response);
      }
    } catch (error) {
      console.error("Error incrementing view:", error);
    }
  }, [movieId, episodeId, checkIfViewCounted, markViewAsCounted]);

  /* =======================
     HISTORY FUNCTIONS - Đã cập nhật để đồng bộ ngay
     ======================= */

  const saveHistoryToLocal = useCallback(
    (currentTime: number, duration: number) => {
      const historyKey = generateHistoryKey(movieSlug, episode);
      if (!historyKey || duration <= 0) return;

      try {
        const existingHistory = localStorage.getItem(HISTORY_KEY);
        let history: HistoryItem[] = existingHistory
          ? JSON.parse(existingHistory)
          : [];

        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

        // Dọn dẹp history cũ
        history = history.filter((item) => item.timestamp > sevenDaysAgo);

        const existingIndex = history.findIndex(
          (item) => item.videoKey === historyKey
        );

        const historyItem: HistoryItem = {
          videoKey: historyKey,
          currentTime,
          duration,
          timestamp: now,
          expires: now + 7 * 24 * 60 * 60 * 1000,
          synced: false, // Mặc định chưa đồng bộ
          movieId,
          episodeId,
        };

        let shouldSyncImmediately = false;

        if (existingIndex >= 0) {
          // Nếu đã tồn tại, cập nhật nếu thời gian khác đáng kể (> 10 giây)
          const existingItem = history[existingIndex];
          const timeDifference = Math.abs(
            existingItem.currentTime - currentTime
          );

          if (timeDifference > 10 || now - existingItem.timestamp > 30000) {
            history[existingIndex] = historyItem;
            shouldSyncImmediately = true;
          }
        } else {
          // Item mới, thêm vào
          history.push(historyItem);
          shouldSyncImmediately = true;
        }

        // Sắp xếp và giới hạn số lượng
        history.sort((a, b) => b.timestamp - a.timestamp);
        history = history.slice(0, 50);

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

        console.log("History saved locally:", {
          historyKey,
          currentTime: Math.floor(currentTime),
          duration: Math.floor(duration),
          shouldSync: shouldSyncImmediately,
        });

        // Nếu có user và cần đồng bộ ngay, thực hiện đồng bộ
        if (user && shouldSyncImmediately && movieId) {
          // Sử dụng setTimeout để không block UI
          setTimeout(() => {
            syncSingleItemImmediately(historyItem);
          }, 500); // Chờ 0.5 giây để tránh spam request
        }
      } catch (error) {
        console.error("Error saving history:", error);
      }
    },
    [
      movieSlug,
      episode,
      generateHistoryKey,
      movieId,
      episodeId,
      user,
      syncSingleItemImmediately,
    ]
  );

  const getHistoryFromLocal = useCallback(() => {
    const historyKey = generateHistoryKey(movieSlug, episode);
    if (!historyKey) return null;

    try {
      const existingHistory = localStorage.getItem(HISTORY_KEY);
      if (!existingHistory) return null;

      const history: HistoryItem[] = JSON.parse(existingHistory);
      const now = Date.now();

      const item = history.find((item) => item.videoKey === historyKey);
      if (!item) return null;

      if (now > item.expires) {
        const filteredHistory = history.filter(
          (i) => i.videoKey !== historyKey
        );
        localStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
        return null;
      }

      return item;
    } catch (error) {
      console.error("Error reading history:", error);
      return null;
    }
  }, [movieSlug, episode, generateHistoryKey]);

  // Xóa các history items cũ đã hết hạn
  const cleanupOldHistory = useCallback(() => {
    try {
      const existingHistory = localStorage.getItem(HISTORY_KEY);
      if (!existingHistory) return;

      const history: HistoryItem[] = JSON.parse(existingHistory);
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      const validHistory = history.filter(
        (item) => item.timestamp > sevenDaysAgo
      );

      if (validHistory.length !== history.length) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(validHistory));
        console.log(
          `Cleaned up ${
            history.length - validHistory.length
          } expired history items`
        );
      }
    } catch (error) {
      console.error("Error cleaning up history:", error);
    }
  }, []);

  // Chạy cleanup khi component mount
  useEffect(() => {
    cleanupOldHistory();
  }, [cleanupOldHistory]);

  const startHistoryUpdateInterval = useCallback(() => {
    if (historyUpdateInterval.current) {
      clearInterval(historyUpdateInterval.current);
    }

    historyUpdateInterval.current = setInterval(() => {
      const video = videoRef.current;
      if (video && !isSeekingRef.current) {
        saveHistoryToLocal(video.currentTime, video.duration);
      }
    }, 30000);
  }, [saveHistoryToLocal]);

  const stopHistoryUpdateInterval = useCallback(() => {
    if (historyUpdateInterval.current) {
      clearInterval(historyUpdateInterval.current);
      historyUpdateInterval.current = null;
    }
  }, []);

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

  // refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const seekTokenRef = useRef(0);
  const prevVolumeRef = useRef<number>(1);
  const propSettingRef = useRef(propSetting);
  const isSwitchingSourceRef = useRef(false);

  // History update interval ref
  const historyUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const realtimeUpdateRef = useRef(false);

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

  function usePlaybackMemory(
    videoRef: React.RefObject<HTMLVideoElement | null>
  ) {
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

  const saveSettingsToLocal = useCallback(
    (override?: Partial<Record<string, any>>) => {
      const payload = {
        volume:
          override?.volume ??
          Math.round((override?.volumeRaw ?? volumeRef.current * 100) || 0),
        speedrate: override?.speedrate ?? playbackRateRef.current,
        autoPlay: propSettingRef.current?.autoPlay ?? true,
        isfullScreen:
          override?.isfullScreen ?? isFullScreenRef.current ?? false,
      };
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
      } catch {}
    },
    []
  );

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

  const resetUiForNewSource = useCallback(() => {
    viewCountedRef.current = false;
    setHasCountedView(false);
    watchTimeRef.current = 0;
    lastSaveTimeRef.current = 0;

    setProgress(0);
    setBuffered(0);
    setCurrentTime(0);
    setDuration(0);

    setIsPlaying(false);
    setIsLoading(true);

    setShowSettings(false);
    setSettingsView("main");

    setQualities([]);
    setCurrentQuality("auto");

    stopHistoryUpdateInterval();
  }, [stopHistoryUpdateInterval]);

  const parseDurationFromManifest = useCallback(
    (manifestContent: string): number => {
      try {
        let totalDuration = 0;
        const lines = manifestContent.split("\n");
        let currentSegmentDuration = 0;

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (trimmedLine.startsWith("#EXTINF:")) {
            const durationMatch = trimmedLine.match(/#EXTINF:([0-9.]+)/);
            if (durationMatch && durationMatch[1]) {
              currentSegmentDuration = parseFloat(durationMatch[1]);
              totalDuration += currentSegmentDuration;
            }
          }

          if (trimmedLine.startsWith("#EXT-X-TARGETDURATION:")) {
            const targetMatch = trimmedLine.match(
              /#EXT-X-TARGETDURATION:([0-9.]+)/
            );
            if (targetMatch && targetMatch[1]) {
              const targetDuration = parseFloat(targetMatch[1]);
              return targetDuration * 10;
            }
          }

          if (trimmedLine === "#EXT-X-ENDLIST") {
            return totalDuration;
          }
        }

        return totalDuration > 0 ? totalDuration : 0;
      } catch (error) {
        console.error("Error parsing manifest duration:", error);
        return 0;
      }
    },
    []
  );

  const setupHlsForVideo = useCallback(
    (src?: string) => {
      const video = videoRef.current;
      if (!video || !src) return;

      isSwitchingSourceRef.current = true;
      startTransition(() => setIsLoading(true));

      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }

      viewCountedRef.current = checkIfViewCounted(movieId, episodeId);
      setHasCountedView(viewCountedRef.current);

      const historyItem = getHistoryFromLocal();

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

        let manifestDuration = 0;
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          try {
            if (data.levels && data.levels.length > 0) {
              const firstLevel = data.levels[0];
              if (firstLevel.details && firstLevel.details.totalduration) {
                manifestDuration = firstLevel.details.totalduration;
                setDuration(manifestDuration);
              }
            }
          } catch (error) {
            console.error("Error getting duration from manifest:", error);
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data: any) => {
          const availableQualities = (data.levels || [])
            .map((l: any) => l.height)
            .filter(Boolean)
            .sort((a: number, b: number) => a - b);
          setQualities(availableQualities);

          if (manifestDuration === 0 && data.levels && data.levels.length > 0) {
            try {
              const firstLevel: any = data.levels[0];
              if (firstLevel.details && firstLevel.details.totalduration) {
                setDuration(firstLevel.details.totalduration);
              }
            } catch (error) {
              console.error(
                "Error getting duration from parsed manifest:",
                error
              );
            }
          }
        });

        const onLoadedMeta = () => {
          const saved = readSettingsFromLocal();
          if (saved) applySavedSettings(saved);
          else if (propSettingRef.current)
            applyPropSettings(propSettingRef.current);

          if (historyItem) {
            const targetTime = Math.min(
              historyItem.currentTime,
              video.duration || historyItem.duration || 0
            );

            if (video.duration && video.duration > 0 && targetTime > 0) {
              if (targetTime < video.duration - 5) {
                setTimeout(() => {
                  video.currentTime = targetTime;
                  setCurrentTime(targetTime);
                  setProgress((targetTime / video.duration) * 100);
                  console.log("Restored from history:", {
                    targetTime,
                    duration: video.duration,
                    historyKey: historyItem.videoKey,
                  });
                }, 500);
              }
            }
          }

          if (video.duration && video.duration !== Infinity) {
            setDuration(video.duration);
          }

          setIsLoading(false);
          isSwitchingSourceRef.current = false;

          startHistoryUpdateInterval();

          if (propSettingRef.current?.autoPlay) {
            video.play().catch(() => {});
          }
        };

        video.addEventListener("loadedmetadata", onLoadedMeta, { once: true });

        const onDurationChange = () => {
          if (video.duration && video.duration !== Infinity) {
            setDuration(video.duration);
          }
        };
        video.addEventListener("durationchange", onDurationChange);

        return () => {
          video.removeEventListener("loadedmetadata", onLoadedMeta);
          video.removeEventListener("durationchange", onDurationChange);
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;

        const onLoadedMeta = () => {
          const saved = readSettingsFromLocal();
          if (saved) applySavedSettings(saved);

          if (historyItem) {
            const targetTime = Math.min(
              historyItem.currentTime,
              video.duration || historyItem.duration || 0
            );

            if (video.duration && video.duration > 0 && targetTime > 0) {
              if (targetTime < video.duration - 5) {
                setTimeout(() => {
                  video.currentTime = targetTime;
                  setCurrentTime(targetTime);
                  setProgress((targetTime / video.duration) * 100);
                  console.log("Restored from history:", {
                    targetTime,
                    duration: video.duration,
                  });
                }, 500);
              }
            }
          }

          if (video.duration && video.duration !== Infinity) {
            setDuration(video.duration);
          }

          setIsLoading(false);
          isSwitchingSourceRef.current = false;

          startHistoryUpdateInterval();
        };

        video.addEventListener("loadedmetadata", onLoadedMeta, { once: true });

        const onDurationChange = () => {
          if (video.duration && video.duration !== Infinity) {
            setDuration(video.duration);
          }
        };
        video.addEventListener("durationchange", onDurationChange);

        return () => {
          video.removeEventListener("loadedmetadata", onLoadedMeta);
          video.removeEventListener("durationchange", onDurationChange);
        };
      } else {
        setIsLoading(false);
        isSwitchingSourceRef.current = false;
      }
      return;
    },
    [
      applySavedSettings,
      applyPropSettings,
      readSettingsFromLocal,
      parseDurationFromManifest,
      getHistoryFromLocal,
      startHistoryUpdateInterval,
      checkIfViewCounted,
      movieId,
      episodeId,
    ]
  );

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // watch linkEmbed changes
  useEffect(() => {
    resetUiForNewSource();

    const cleanup = setupHlsForVideo(linkEmbed);

    return () => {
      if (typeof cleanup === "function") cleanup();
      isSwitchingSourceRef.current = false;
      stopHistoryUpdateInterval();
    };
  }, [
    linkEmbed,
    setupHlsForVideo,
    resetUiForNewSource,
    stopHistoryUpdateInterval,
  ]);

  // Effect để theo dõi thời gian xem và tăng view sau 30 giây
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !movieId || hasCountedView) return;

    let interval: NodeJS.Timeout;

    const startWatching = () => {
      watchTimeRef.current = 0;
      lastSaveTimeRef.current = video.currentTime;

      interval = setInterval(() => {
        if (video.paused || hasCountedView || !movieId) return;

        const currentTime = video.currentTime;
        const delta = Math.abs(currentTime - lastSaveTimeRef.current);

        if (delta < 10) {
          watchTimeRef.current += delta;
        }

        lastSaveTimeRef.current = currentTime;

        if (watchTimeRef.current >= 30 && !viewCountedRef.current) {
          console.log("Đã xem được 30 giây, tăng view...");
          incrementView();
          clearInterval(interval);
        }
      }, 1000);
    };

    const stopWatching = () => {
      if (interval) {
        clearInterval(interval);
      }
    };

    video.addEventListener("play", startWatching);
    video.addEventListener("pause", stopWatching);
    video.addEventListener("seeked", () => {
      lastSaveTimeRef.current = video.currentTime;
    });

    return () => {
      video.removeEventListener("play", startWatching);
      video.removeEventListener("pause", stopWatching);
      video.removeEventListener("seeked", () => {});
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [movieId, episodeId, hasCountedView, incrementView]);

  // Reset view tracking khi movieId hoặc episodeId thay đổi
  useEffect(() => {
    if (movieId) {
      const alreadyCounted = checkIfViewCounted(movieId, episodeId);
      viewCountedRef.current = alreadyCounted;
      setHasCountedView(alreadyCounted);
      watchTimeRef.current = 0;
      lastSaveTimeRef.current = 0;
    }
  }, [movieId, episodeId, checkIfViewCounted]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
      stopHistoryUpdateInterval();
    };
  }, [stopHistoryUpdateInterval]);

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
    if (!v || !linkEmbed) return;

    let updateTimeout: NodeJS.Timeout | null = null;

    const updateProgress = () => {
      if (isSwitchingSourceRef.current) return;
      setProgress((v.currentTime / (v.duration || 1)) * 100);
      setCurrentTime(v.currentTime);

      if (realtimeUpdateRef.current) {
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          saveHistoryToLocal(v.currentTime, v.duration);
        }, 1000);
      }

      if (v.duration && v.duration !== Infinity && v.duration !== duration) {
        setDuration(v.duration);
      }
    };

    const updateBuffer = () => {
      if (v.buffered.length > 0 && v.duration) {
        const end = v.buffered.end(v.buffered.length - 1);
        setBuffered((end / v.duration) * 100);
      }
    };

    const handlePlayStart = () => {
      saveHistoryToLocal(v.currentTime, v.duration);
      realtimeUpdateRef.current = true;
    };

    v.addEventListener("timeupdate", updateProgress);
    v.addEventListener("progress", updateBuffer);
    v.addEventListener("play", handlePlayStart);

    return () => {
      v.removeEventListener("timeupdate", updateProgress);
      v.removeEventListener("progress", updateBuffer);
      v.removeEventListener("play", handlePlayStart);
      if (updateTimeout) clearTimeout(updateTimeout);
    };
  }, [duration, saveHistoryToLocal]);

  useEffect(() => {
    const onFsChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullScreen(isNowFullscreen);
      saveSettingsToLocal({ isfullScreen: isNowFullscreen });
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [saveSettingsToLocal]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || !linkEmbed) return;

    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);

      saveHistoryToLocal(v.currentTime, v.duration);
      realtimeUpdateRef.current = true;
    } else {
      v.pause();
      setIsPlaying(false);
      realtimeUpdateRef.current = false;
    }

    saveSettingsToLocal();
  }, [saveSettingsToLocal, saveHistoryToLocal]);

  const handleSeekStart = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      isSeekingRef.current = true;
      seekWasPlayingRef.current = isPlaying;
      pendingSeekValueRef.current = Number(
        (e.target as HTMLInputElement).value
      );
      realtimeUpdateRef.current = false;
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
      if (!video || !linkEmbed) return;

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

        saveHistoryToLocal(video.currentTime, video.duration);

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

      saveHistoryToLocal(video.currentTime, video.duration);
    },
    [tryFlushHlsBuffer, saveSettingsToLocal, saveHistoryToLocal]
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
        realtimeUpdateRef.current = true;
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
      saveSettingsToLocal({ speedrate: speed });
    },
    [onSettingChange, saveSettingsToLocal]
  );

  const changeFullScreen = useCallback(
    (fullScreen: boolean) => {
      if (fullScreen) {
        toggleFullScreen();
      }
      saveSettingsToLocal({ fullscreen: fullScreen });
    },
    [toggleFullScreen, saveSettingsToLocal]
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

  useEffect(() => {
    const saved = readSettingsFromLocal();
    if (saved) applySavedSettings(saved);
  }, [readSettingsFromLocal, applySavedSettings]);

  return (
    <div
      ref={containerRef}
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

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded z-40">
          <div>Movie ID: {movieId}</div>
          <div>Episode ID: {episodeId || "None"}</div>
          <div>Movie Slug: {movieSlug || "None"}</div>
          <div>Episode: {episode || "None"}</div>
          <div>
            History Key: {generateHistoryKey(movieSlug, episode) || "None"}
          </div>
          <div>View counted: {hasCountedView ? "Yes" : "No"}</div>
          <div>Watch time: {Math.round(watchTimeRef.current)}s</div>
          <div>User logged in: {user ? "Yes" : "No"}</div>
          <div>Sync active: {isSyncingRef.current ? "Yes" : "No"}</div>
          <div>Sync queue size: {syncQueueRef.current.size}</div>
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext?.();
              }}
              className="p-1"
              aria-label="Next"
            >
              <SkipForward size={20} />
            </button>
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
