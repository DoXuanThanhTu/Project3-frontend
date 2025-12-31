export enum MovieType {
  MOVIE = "MOVIE",
  SERIES = "SERIES",
  EPISODE = "EPISODE",
  DOCUMENTARY = "DOCUMENTARY",
  ANIMATION = "ANIMATION",
  SHORT = "SHORT",
  SPECIAL = "SPECIAL",
}
export enum FlagType {
  FEATURED = "FEATURED", // nội dung nổi bật
  HOT = "HOT", // nội dung hot
  TRENDING = "TRENDING", // nội dung xu hướng
  BANNER = "BANNER", // hiển thị ở banner
  NEW = "NEW", // mới phát hành
  TOP = "TOP", // đứng đầu bảng xếp hạng
  RECOMMENDED = "RECOMMENDED", // gợi ý cho người dùng
  EXCLUSIVE = "EXCLUSIVE", // độc quyền
  PROMOTION = "PROMOTION", // quảng cáo/khuyến mãi
  HIGHLIGHT = "HIGHLIGHT", // spotlight/nổi bật
}
export interface Franchise {
  id: string;
  name: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Episode {
  movieId: string;
  serverId: string;
  title: string;
  description: string | null;
  slug: string;
  episodeOrLabel: string;
  videoUrl: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Server {
  server: {
    id: string;
    name: string;
    baseUrl: string;
    isActive: boolean;
  };
  episodes: Episode[];
  totalEpisodes: number;
  latestEpisode: Episode;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  franchise: Franchise | null;
  genres: Genre[];
  poster: string;
  thumbnail: string;
  type: MovieType;
  ratingAvg: number;
  views: number;
  duration?: string;
  banner?: string;
  description?: string;
  director?: string;
  cast?: string[];
  currentEpisode?: number;
  totalEpisodes?: number;
  flag?: FlagType[];
}

export interface MovieDetailResponse {
  success: boolean;
  data: {
    movie: Movie;
    servers: Server[];
    sameFranchise: Movie[];
    relatedByGenre: Movie[];
    meta: {
      totalEpisodes: number;
      totalServers: number;
      hasEpisodes: boolean;
      isSeries: boolean;
    };
  };
}
