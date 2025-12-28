import { IMovie, MovieType } from "../types/movie.type";

const mockMovies: IMovie[] = [
  {
    franchiseId: "676f1c2b5f1a2b0012345678",
    title: new Map([
      ["vi", "Kẻ Đánh Cắp Giấc Mơ"],
      ["en", "Dream Stealer"],
    ]),
    description: new Map([
      [
        "vi",
        "Một bộ phim giả tưởng về thế giới nơi giấc mơ có thể bị đánh cắp.Một bộ phim giả tưởng về thế giới nơi giấc mơ có thể bị đánh cắp.Một bộ phim giả tưởng về thế giới nơi giấc mơ có thể bị đánh cắp.Một bộ phim giả tưởng về thế giới nơi giấc mơ có thể bị đánh cắp.Một bộ phim giả tưởng về thế giới nơi giấc mơ có thể bị đánh cắp.Một bộ phim giả tưởng về thế giới nơi giấc mơ có thể bị đánh cắp.",
      ],
      ["en", "A fantasy movie about a world where dreams can be stolen."],
    ]),
    slug: new Map([
      ["vi", "ke-danh-cap-giac-mo"],
      ["en", "dream-stealer"],
    ]),
    defaultLang: "vi",
    poster: "/images/movies/dream-stealer/poster.jpg",
    trailerUrl: "https://youtube.com/watch?v=xxxxxxx",
    type: MovieType.MOVIE,
    ratingAvg: 4.5,
    views: 123456,
    isPublished: true,
    _id: "1",
    flag: ["featured"],
  },
  {
    _id: "2",
    franchiseId: "676f1c2b5f1a2b0012345679",
    title: new Map([
      ["vi", "Hành Trình Vô Tận"],
      ["en", "Endless Journey"],
    ]),
    description: new Map([
      ["vi", "Một series phiêu lưu kéo dài nhiều mùa."],
      ["en", "An adventure series spanning multiple seasons."],
    ]),
    slug: new Map([
      ["vi", "hanh-trinh-vo-tan"],
      ["en", "endless-journey"],
    ]),
    defaultLang: "en",
    type: MovieType.SERIES,
    currentEpisode: 1,
    totalEpisodes: 24,
    ratingAvg: 4.2,
    views: 98765,
    genres: ["Adventure", "Fantasy"],
    isPublished: true,
    flag: ["hot"],
  },
  {
    _id: "3",
    franchiseId: "676f1c2b5f1a2b0012345680",
    title: new Map([
      ["vi", "Trái Đất Xanh"],
      ["en", "Blue Planet"],
    ]),
    description: new Map([
      ["vi", "Một bộ phim tài liệu về thiên nhiên hoang dã."],
      ["en", "A documentary about wildlife and nature."],
    ]),
    slug: new Map([
      ["vi", "trai-dat-xanh"],
      ["en", "blue-planet"],
    ]),
    defaultLang: "vi",
    type: MovieType.SERIES,
    currentEpisode: 3,
    genres: ["Documentary"],
    ratingAvg: 4.8,
    views: 54321,
    isPublished: true,
    flag: ["banner"],
  },
  {
    _id: "4",
    franchiseId: "676f1c2b5f1a2b0012345681",
    title: new Map([
      ["vi", "Thế Giới Hoạt Hình"],
      ["en", "Animated World"],
    ]),
    description: new Map([
      ["vi", "Một bộ phim hoạt hình dành cho thiếu nhi."],
      ["en", "An animation movie for children."],
    ]),
    slug: new Map([
      ["vi", "the-gioi-hoat-hinh"],
      ["en", "animated-world"],
    ]),
    defaultLang: "vi",
    type: MovieType.ANIMATION,
    genres: ["Animation", "Family"],
    ratingAvg: 4.0,
    views: 22222,
    isPublished: false,
    flag: ["new"],
  },
  {
    _id: "5",
    franchiseId: "676f1c2b5f1a2b0012345682",
    title: new Map([
      ["vi", "Đêm Đặc Biệt"],
      ["en", "Special Night"],
    ]),
    description: new Map([
      ["vi", "Một chương trình đặc biệt phát sóng vào dịp lễ."],
      ["en", "A special show aired during the holidays."],
    ]),
    slug: new Map([
      ["vi", "dem-dac-biet"],
      ["en", "special-night"],
    ]),
    defaultLang: "en",
    genres: ["Special"],
    type: MovieType.SPECIAL,
    ratingAvg: 3.9,
    views: 11111,
    isPublished: true,
    flag: ["exclusive"],
  },
  {
    _id: "6",
    franchiseId: "676f1c2b5f1a2b0012345680",
    title: new Map([
      ["vi", "Trái Đất Xanh"],
      ["en", "Blue Planet"],
    ]),
    description: new Map([
      ["vi", "Một bộ phim tài liệu về thiên nhiên hoang dã."],
      ["en", "A documentary about wildlife and nature."],
    ]),
    slug: new Map([
      ["vi", "trai-dat-xanh"],
      ["en", "blue-planet"],
    ]),
    defaultLang: "vi",
    type: MovieType.SERIES,
    currentEpisode: 3,
    genres: ["Documentary"],
    ratingAvg: 4.8,
    views: 54321,
    isPublished: true,
    flag: ["banner"],
  },
];
export default mockMovies;
