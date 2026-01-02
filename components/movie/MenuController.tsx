"use client";
import React from "react";
import { ChevronRight, ChevronLeft, Loader2, Settings } from "lucide-react";

interface MenuControllerProps {
  isLoading: boolean;
  showSettings: boolean;
  settingsView: "main" | "speed" | "quality";
  currentQuality: string | number;
  playbackRate: number;
  qualities: number[];
  onChangeView: (view: "main" | "speed" | "quality") => void;
  onChangeSpeed: (speed: number) => void;
  onChangeQuality: (q: number | "auto") => void;
  onChangeFullScreen?: (fullScreen: boolean | false) => void;
  onClose: () => void;
  onOpen: (e: React.MouseEvent) => void;

  colors?: {
    bgMain?: string;
    border?: string;
    text?: string;
    textMuted?: string;
    hover?: string;
    activeBg?: string;
    activeText?: string;
    noteText?: string;
  };
}

const defaultColors = {
  bgMain: "bg-[#0f0f0f]", // nền chính gần đen
  border: "border-[#303030]", // border xám tối
  text: "text-white", // chữ trắng
  textMuted: "text-gray-400", // chữ mờ
  hover: "bg-[#272727]", // hover xám đậm
  activeBg: "bg-red-600", // nền khi active (YouTube đỏ)
  activeText: "text-white", // chữ khi active
  noteText: "text-gray-400", // chữ ghi chú
};

export default function MenuController({
  isLoading,
  showSettings,
  settingsView,
  currentQuality,
  playbackRate,
  qualities,
  onChangeView,
  onChangeSpeed,
  onChangeQuality,
  // onChangeFullScreen,
  onClose,
  onOpen,
  colors = defaultColors,
}: MenuControllerProps) {
  const mergedColors = { ...defaultColors, ...colors };

  return (
    <div className="flex items-center gap-3 relative">
      {/* ⚙️ Settings Button */}
      <button onClick={onOpen} className="p-1" aria-label="Cài đặt">
        <Settings size={20} />
      </button>

      {showSettings && (
        <div className="absolute bottom-10 right-0 z-40" onClick={onClose}>
          <div className="fixed inset-0" />

          <div
            className={`relative w-64 ${mergedColors.bgMain} ${mergedColors.border} rounded-xl p-0 ${mergedColors.text} shadow-xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div
              className={`px-3 py-2 flex items-center justify-between border-b ${mergedColors.border}`}
            >
              <div className="flex items-center gap-2">
                {settingsView !== "main" && (
                  <button
                    onClick={() => onChangeView("main")}
                    className="p-1"
                    aria-label="Back"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <div className="font-medium text-sm">
                  {settingsView === "main"
                    ? "Cài đặt"
                    : settingsView === "speed"
                    ? "Tốc độ phát"
                    : "Chất lượng"}
                </div>
              </div>
              <button
                onClick={onClose}
                className={`text-xs ${mergedColors.textMuted} px-2 py-1`}
              >
                Đóng
              </button>
            </div>

            {/* sliding panels */}
            <div className="relative h-56">
              <div
                className="absolute inset-0 flex transition-transform duration-300"
                style={{
                  width: "300%",
                  transform:
                    settingsView === "main"
                      ? "translateX(0%)"
                      : settingsView === "speed"
                      ? "translateX(-33.3333%)"
                      : "translateX(-66.6666%)",
                }}
              >
                {/* panel 1 */}
                <div className="w-1/3 p-3">
                  <button
                    onClick={() => onChangeView("speed")}
                    className={`w-full flex items-center justify-between px-2 py-3 rounded-lg hover:${mergedColors.hover}`}
                  >
                    <div className="text-sm">Tốc độ phát</div>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    onClick={() => onChangeView("quality")}
                    className={`w-full flex items-center justify-between mt-2 px-2 py-3 rounded-lg hover:${mergedColors.hover}`}
                  >
                    <div className="text-sm">Chất lượng</div>
                    <div className={`text-xs ${mergedColors.textMuted}`}>
                      {currentQuality === "auto"
                        ? "Auto"
                        : `${currentQuality}p`}
                    </div>
                  </button>
                </div>

                {/* panel 2: speed */}
                <div className={`w-1/3 p-3 border-l ${mergedColors.border}`}>
                  <div className="space-y-2">
                    {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => onChangeSpeed(s)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                          playbackRate === s
                            ? `${mergedColors.activeBg} ${mergedColors.activeText}`
                            : `hover:${mergedColors.hover}`
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-sm">{s}x</div>
                          {playbackRate === s && (
                            <div
                              className={`text-xs ${mergedColors.textMuted}`}
                            >
                              Đang dùng
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* panel 3: quality */}
                <div className={`w-1/3 p-3 border-l ${mergedColors.border}`}>
                  <div className="space-y-2">
                    <button
                      onClick={() => onChangeQuality("auto")}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        currentQuality === "auto"
                          ? `${mergedColors.activeBg} ${mergedColors.activeText}`
                          : `hover:${mergedColors.hover}`
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Auto</div>
                        {currentQuality === "auto" && (
                          <div className={`text-xs ${mergedColors.textMuted}`}>
                            Đang dùng
                          </div>
                        )}
                      </div>
                    </button>

                    {qualities
                      .slice()
                      .reverse()
                      .map((q) => (
                        <button
                          key={q}
                          onClick={() => onChangeQuality(q)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                            currentQuality === String(q)
                              ? `${mergedColors.activeBg} ${mergedColors.activeText}`
                              : `hover:${mergedColors.hover}`
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-sm">{q}p</div>
                            {currentQuality === String(q) && (
                              <div
                                className={`text-xs ${mergedColors.textMuted}`}
                              >
                                Đang dùng
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* bottom note */}
            <div
              className={`px-3 py-2 border-t ${mergedColors.border} text-xs ${mergedColors.noteText} flex items-center justify-between`}
            >
              <div>Tùy chọn</div>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} />
                  <div>Đang xử lý...</div>
                </div>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
