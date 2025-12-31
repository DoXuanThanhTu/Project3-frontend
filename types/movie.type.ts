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

export interface IMovie {
  _id: string;

  // ===== I18N =====
  franchise?: {
    id: string;
    name: string;
    slug?: string;
  } | null;
  franchiseId?: string;
  title: Record<string, string>; // Map<string, string> in MongoDB
  description?: Record<string, string>;
  slug: Record<string, string>;

  // ===== META =====
  defaultLang: string;

  // ===== MEDIA =====
  poster?: string;
  thumbnail?: string;
  banner?: string;
  backdrop?: string;
  trailerUrl?: string;

  type: MovieType;
  currentEpisode?: number;
  totalEpisodes?: number;

  // ===== RELATION =====
  genres: string[]; // Array of ObjectId strings
  cast: string[]; // Array of ObjectId strings
  director?: string; // ObjectId string

  // ===== STAT =====
  ratingAvg: number;
  views: number;
  year?: number;
  country?: string;
  isPublished: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Extended interface with populated relations
// export interface IMovieWithRelations
//   extends Omit<IMovie, "genres" | "cast" | "director" | "franchiseId"> {
//   genres: IGenre[];
//   cast: IPerson[];
//   director?: IPerson;
//   franchise?: IFranchise;
// }

// Additional interfaces for relations
// export interface IGenre {
//   _id: string;
//   name: Record<string, string>;
//   slug: Record<string, string>;
//   description?: Record<string, string>;
//   isActive: boolean;
// }

export interface IPerson {
  _id: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  avatar?: string;
  roles: ("ACTOR" | "DIRECTOR")[];
}

// export interface IFranchise {
//   _id: string;
//   name: Record<string, string>;
//   slug: Record<string, string>;
//   movies: string[];
// }
export interface IEpisode {
  _id: string;
  movieId: string;
  serverId: string;

  title: Record<string, string>;
  description?: Record<string, string>;
  slug: Record<string, string>;
  defaultLang: string;

  episodeNumber: number;
  duration?: string;
  thumbnail?: string;
  videoUrl?: string;
  isPublished: boolean;
}

export interface IServer {
  id: string;
  name: string;
  baseUrl: string;
  isActive: boolean;
}

export interface IFranchise {
  _id: string;
  name: string;
  description?: string;
  slug: string;

  movies: IMovie[];
  isPublished: boolean;
}
export interface IGenre {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  defaultLang: string;
  isActive: boolean;
}
export interface IComment {
  id: string; // id comment
  userId: string; // id người dùng
  content: string; // nội dung comment
  createdAt: Date; // thời gian tạo
  updatedAt?: Date; // thời gian chỉnh sửa

  // Liên kết tới phim/tập/season
  movieId?: string; // id phim
  seasonOrLabel?: string; // ví dụ: "2", "OVA1", "Special"
  episode?: number; // số tập (nếu là series)

  // Các hành động xã hội
  likes?: number; // số lượt thích
  dislikes?: number; // số lượt không thích
  shares?: number; // số lượt chia sẻ
  useful?: number; // số lượt đánh dấu hữu ích

  // Comment lồng nhau
  parentId?: string; // id comment cha (nếu là reply)
  replies?: IComment[]; // danh sách reply con

  // Trạng thái
  isEdited?: boolean; // comment đã chỉnh sửa chưa
  isDeleted?: boolean; // comment đã bị xoá chưa
}
