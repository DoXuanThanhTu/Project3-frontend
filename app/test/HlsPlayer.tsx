"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HlsPlayerProps {
  link: string;
  volume?: number;
  playbackRate?: number;
  muted?: boolean;
  onEnded?: () => void;
}

export default function HlsPlayer({
  link,
  volume = 0.7,
  playbackRate = 1,
  muted = false,
  onEnded,
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Hủy HLS trước nếu có
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari hỗ trợ HLS gốc
      video.src = link;
      video.load();
      video.volume = volume;
      video.playbackRate = playbackRate;
      video.muted = muted;
      video.play();
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(link);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.volume = volume;
        video.playbackRate = playbackRate;
        video.muted = muted;
        video.play();
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              break;
          }
        }
      });
      hlsRef.current = hls;
    } else {
      alert("Trình duyệt của bạn không hỗ trợ HLS.");
    }

    // Lắng nghe sự kiện kết thúc
    if (onEnded) {
      video.addEventListener("ended", onEnded);
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (onEnded) video.removeEventListener("ended", onEnded);
    };
  }, [link, volume, playbackRate, muted, onEnded]);

  return (
    <video ref={videoRef} controls style={{ width: "100%", height: "100%" }} />
  );
}
