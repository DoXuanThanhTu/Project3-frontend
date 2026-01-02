import { Franchise } from "./test.type";
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
export interface IMovieResponse {
  id: string;
  franchiseId?: string;
  franchise?: {
    id?: string;
    name?: string;
    slug?: string;
  };
  // title có thể là string hoặc object đa ngôn ngữ
  title?: string;
  description?: string;
  slug?: string;
  defaultLang?: string;

  poster?: string;
  thumbnail?: string;
  banner?: string;
  backdrop?: string;
  trailerUrl?: string;

  type?: MovieType;

  currentEpisode?: number;
  totalEpisodes?: number;
  seasonOrLabel?: string;
  duration?: string;

  // genres trả về dạng object chứ không chỉ string[]
  genres?: {
    id: string;
    name: string;
    slug: string;
  }[];

  cast?: string[];
  director?: string | null;
  country?: string;

  // API trả về "rating" thay vì "ratingAvg"
  ratingAvg?: number;
  views?: number;

  // flags trả về mảng object
  flags?: FlagType[];

  relasedYear?: number;
  isPublished?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface IEpisodeResponse {
  id: string;
  movieId: string;
  serverId: string;

  title: string;
  description?: string;
  slug: string;
  defaultLang: string;

  episodeOrLabel: string;
  duration?: string;
  thumbnail?: string;
  videoUrl?: string;
  isPublished: boolean;
}

export interface IServerResponse {
  id: string;
  name: string;
  baseUrl: string;
  isActive: boolean;
}

export interface IFranchiseResponse {
  id: string;
  name: string;
  description?: string;
  slug: string;

  //   movies: IMovieResponse[];
  isPublished: boolean;
}
export interface IGenreResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  defaultLang: string;
  isActive: boolean;
}
export interface IComment {
  id: string;
  userId?: string;
  user?: {
    id?: string;
    displayName?: string;
    avatar?: string;
  };
  content: string;
  movieName?: string;
  episodeOrLabel?: string;
  episode?: number;
  likes?: string[];
  dislikes?: string[];
  shares?: string[];
  useful?: string[];
  parentId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: IComment[];
  totalLike?: number;
  totalDislike?: number;
  totalShare?: number;
  totalUseful?: number;
  depth?: number;
  replyCount?: number; // ⭐ từ backend
}
export interface IMovieDetailResponse {
  success: boolean;
  data: {
    movie: IMovieResponse;
    servers: {
      server: IServerResponse;
      episodes: IEpisodeResponse[];
      totalEpisodes: number;
      latestEpisode: IEpisodeResponse | null;
    }[];
    sameFranchise: IMovieResponse[];
    relatedByGenre: IMovieResponse[];
    currentEpisode: IMovieResponse | null;
    meta: {
      totalEpisodes: number;
      totalServers: number;
      hasEpisodes: boolean;
      isSeries: boolean;
    };
  };
}
