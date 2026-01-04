import Image from "next/image";
import Link from "next/link";
import { Play, Star, Eye, Calendar, Clock } from "lucide-react";
import { IMovieResponse } from "@/types/response.type";

export default function MovieCard({ movie }: { movie: IMovieResponse }) {
  // Kiểm tra và bảo vệ dữ liệu
  if (!movie || typeof movie !== "object") {
    return null;
  }

  const {
    // id,
    title,
    slug,
    thumbnail,
    // year,
    // rating,
    views,
    // duration,
    type,
    genres = [],
  } = movie;
  // Đảm bảo các giá trị có kiểu dữ liệu đúng
  const safeTitle = typeof title === "string" ? title : "";
  const safeSlug = typeof slug === "string" ? slug : "";
  const safeThumbnail = typeof thumbnail === "string" ? thumbnail : undefined;
  // const safeYear = typeof year === "number" ? year : undefined;
  // const safeRating = typeof rating === "number" ? rating : 0;
  const safeViews = typeof views === "number" ? views : 0;
  const safeType = typeof type === "string" ? type : "movie";
  const safeGenres = Array.isArray(genres) ? genres : [];

  return (
    <Link href={`/movie/${safeSlug}`} className="block">
      <div className="group cursor-pointer">
        <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-gray-800 mb-3">
          {safeThumbnail ? (
            <Image
              src={safeThumbnail}
              alt={safeTitle || "Movie thumbnail"}
              className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
              width={400}
              height={600}
              loading="lazy"
              // onError={(e) => {
              //   // Fallback khi ảnh lỗi
              //   const target = e.target as HTMLImageElement;
              //   target.style.display = "none";
              // }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-800 to-gray-900">
              <Play className="w-12 h-12 text-gray-600" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Badges */}
          {/* <div className="absolute top-2 left-2 flex gap-1">
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              {safeType === "series" ? "Bộ" : "Lẻ"}
            </span>
            {safeYear && (
              <span className="bg-gray-900/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                {safeYear}
              </span>
            )}
          </div> */}

          {/* Rating */}
          {/* {safeRating > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {safeRating.toFixed(1)}
            </div>
          )} */}
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
            {safeTitle || "Không có tiêu đề"}
          </h3>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            {/* {safeYear && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {safeYear}
              </div>
            )} */}

            {safeViews > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {safeViews > 1000
                  ? `${(safeViews / 1000).toFixed(1)}K`
                  : safeViews}
              </div>
            )}
          </div>

          {safeGenres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {safeGenres.slice(0, 2).map((genre, index) => {
                // const genreName =
                //   typeof genre === "object" && genre
                //     ? genre.name
                //     : String(genre);
                return (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-300"
                  >
                    {genre.title}
                  </span>
                );
              })}
              {safeGenres.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{safeGenres.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
