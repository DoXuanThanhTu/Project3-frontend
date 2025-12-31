export interface IWatchHistory {
  user_id?: string;
  movie_id: string;
  episode_id?: string; // Optional for series
  episode_slug?: string; // Episode slug for direct linking
  current_time: number; // Current playback time in seconds
  duration: number; // Total duration in seconds
  completion_rate: number; // Percentage watched (0-100)
  last_watched_at: Date;
  device_type?: string;
  region?: string;
  quality_preference?: string; // e.g., "720p", "1080p", "auto"
  playback_rate?: number; // e.g., 1.0, 1.5, 2.0
  volume?: number; // 0-1
  is_muted?: boolean;
  // created_at: Date;
  // updated_at: Date;
}
