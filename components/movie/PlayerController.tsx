import React from "react";

/* ================= ICONS ================= */

const HeartIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    className="w-5 h-5"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3 7h7l-5.5 4 2.5 7-7-4.5L5 20l2.5-7L2 9h7z" />
  </svg>
);

const PrevIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const NextIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const DarkModeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 0012 21a9 9 0 008.354-5.646z"
    />
  </svg>
);

/* ================= BUTTON BASE ================= */

const ControlButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
> = ({ active, className = "", children, ...props }) => (
  <button
    {...props}
    className={`
      flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition
      ${
        active
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
      }
      ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}
      ${className}
    `}
  >
    {children}
  </button>
);

/* ================= PROPS ================= */

interface PlayerControlBarProps {
  isFollowing: boolean;
  isAutoPlay: boolean;
  isDarkMode: boolean;
  hasPrevEpisode: boolean;
  hasNextEpisode: boolean;
  onFollowToggle: () => void;
  onRateClick: () => void;
  onAutoPlayToggle: () => void;
  onPrevEpisode: () => void;
  onNextEpisode: () => void;
  onDarkModeToggle: () => void;
}

/* ================= COMPONENT ================= */

const PlayerControlBar: React.FC<PlayerControlBarProps> = ({
  isFollowing,
  isAutoPlay,
  isDarkMode,
  hasPrevEpisode,
  hasNextEpisode,
  onFollowToggle,
  onRateClick,
  onAutoPlayToggle,
  onPrevEpisode,
  onNextEpisode,
  onDarkModeToggle,
}) => {
  return (
    <div className="mt-4 p-3 sm:p-4 bg-gray-900 border border-gray-800 rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* LEFT */}
        <div className="flex gap-2">
          <ControlButton
            onClick={onFollowToggle}
            className={
              isFollowing ? "bg-red-600 hover:bg-red-700 text-white" : ""
            }
          >
            <HeartIcon active={isFollowing} />
            <span className="hidden sm:inline">
              {isFollowing ? "Đã theo dõi" : "Theo dõi"}
            </span>
          </ControlButton>

          <ControlButton
            onClick={onRateClick}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <StarIcon />
            <span className="hidden sm:inline">Đánh giá</span>
          </ControlButton>
        </div>

        {/* CENTER */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Auto play */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-gray-400">
              Tự động
            </span>
            <button
              onClick={onAutoPlayToggle}
              className={`relative w-11 h-6 rounded-full transition ${
                isAutoPlay ? "bg-green-500" : "bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isAutoPlay ? "-translate-x-0.5" : "-translate-x-5"
                }`}
              />
            </button>
          </div>

          {/* Prev / Next */}
          <ControlButton disabled={!hasPrevEpisode} onClick={onPrevEpisode}>
            <PrevIcon />
            <span className="hidden sm:inline">Tập trước</span>
          </ControlButton>

          <ControlButton disabled={!hasNextEpisode} onClick={onNextEpisode}>
            <span className="hidden sm:inline">Tập tiếp</span>
            <NextIcon />
          </ControlButton>
        </div>

        {/* RIGHT */}
        <ControlButton active={isDarkMode} onClick={onDarkModeToggle}>
          <DarkModeIcon />
          <span className="hidden sm:inline">
            {isDarkMode ? "Bật đèn" : "Tắt đèn"}
          </span>
        </ControlButton>
      </div>
    </div>
  );
};

export default PlayerControlBar;
