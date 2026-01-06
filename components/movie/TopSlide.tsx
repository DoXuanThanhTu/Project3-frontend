"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/navigation";

import { Play, Heart, Info } from "lucide-react";
import Link from "next/link";
import { IMovie, MovieType } from "@/types/movie.type";
import Image from "next/image";
import type { Swiper as SwiperType } from "swiper";
import { IMovieResponse } from "@/types/res.type";
type TopSlideProps = {
  movies: IMovieResponse[];
  autoPlay?: boolean;
  length?: number;
};

export const TopSlide: React.FC<TopSlideProps> = ({
  movies,
  autoPlay = true,
  length = 5,
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);

  useEffect(() => {
    if (mainSwiper) {
      mainSwiper.navigation.destroy();
      mainSwiper.navigation.init();
      mainSwiper.navigation.update();
    }
  }, [mainSwiper]);

  if (!movies.length) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-400">
        Không có phim banner
      </div>
    );
  }

  // chỉ lấy số lượng phim theo length
  const moviesToShow = movies.slice(0, length);

  return (
    <div className="relative w-full overflow-hidden">
      {/* ===== MAIN SLIDE ===== */}
      <Swiper
        modules={[Thumbs, Autoplay, Navigation]}
        onSwiper={setMainSwiper}
        thumbs={{ swiper: thumbsSwiper }}
        autoplay={
          autoPlay ? { delay: 5000, disableOnInteraction: false } : false
        }
        className="w-full h-[56.25vw] md:h-[70vh]"
      >
        {moviesToShow.map((m) => {
          return (
            <SwiperSlide key={m.id}>
              <div className="relative w-full h-full">
                {/* Background */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${
                      m.banner || m.backdrop || "/no_banner.png"
                    })`,
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-black/10" />
                {/* Content */}
                <div className="relative z-10 flex h-full items-center px-6 md:px-20 text-white">
                  <div className="max-w-xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-3">
                      {m.title}
                    </h1>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-2 text-sm text-gray-200 mb-4">
                      {m.type === MovieType.SERIES && (
                        <span className="px-2 py-1 bg-white/20 rounded">
                          {m.currentEpisode}/
                          {m.totalEpisodes ? m.totalEpisodes : "??"} tập
                        </span>
                      )}
                      {m.duration && (
                        <span className="px-2 py-1 bg-white/20 rounded">
                          {m.duration}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-yellow-500/80 text-black rounded">
                        ⭐ {m.ratingAvg ? m.ratingAvg.toFixed(1) : "N/A"}
                      </span>
                      <span className="px-2 py-1 bg-white/20 rounded">
                        👁 {m.views ? m.views.toLocaleString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-200 mb-4">
                      {m.genres &&
                        m.genres.length > 0 &&
                        m.genres.slice(0, 3).map((g) => (
                          <Link
                            key={g.id}
                            href={`/genre/${g.slug}`}
                            className="px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition"
                          >
                            {g.title}
                          </Link>
                        ))}
                    </div>
                    {m.description && (
                      <p className="mt-4 text-gray-300 line-clamp-3">
                        {m.description}
                      </p>
                    )}
                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-6">
                      <Link
                        href={`/watch/${m.slug}`}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-full font-medium"
                      >
                        <Play size={18} /> Xem phim
                      </Link>
                      {/* <button className="hover:text-red-400">
                        <Heart size={22} />
                      </button>
                      <button className="hover:text-red-400">
                        <Info size={22} />
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* ===== THUMBNAILS ===== */}
      <div className="hidden md:flex z-20 w-full items-center justify-center absolute bottom-10 left-0">
        <div className="w-175 flex items-center justify-center">
          <Swiper
            onSwiper={setThumbsSwiper}
            slidesPerView="auto"
            spaceBetween={12}
            watchSlidesProgress
            modules={[Thumbs]}
            className="h-17.5"
          >
            {moviesToShow.map((m, i) => (
              <SwiperSlide
                key={m.id}
                className="w-27.5! h-15! mt-2 ml-0.5"
                onClick={() => mainSwiper?.slideTo(i)}
              >
                <Image
                  src={m.poster || m.thumbnail || "/no_poster.png"}
                  alt={m.title || "No title"}
                  className="w-full h-full object-cover rounded-lg ring-2 ring-transparent hover:ring-red-500 transition"
                  width={1000}
                  height={1000}
                  loading="lazy"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};
