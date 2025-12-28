"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import Image from "next/image";
import { IMovie } from "@/types/movie.type";
import { FaAngleRight } from "react-icons/fa";
type MovieSliderProps = {
  title: string;
  movies: IMovie[];
};

const MovieSlider: React.FC<MovieSliderProps> = ({ title, movies }) => {
  const limitedMovies = movies.slice(0, 10);
  const showArrows = limitedMovies.length > 5;
  console.log(movies);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(showArrows);

  return (
    <div className="my-10 relative">
      <h2 className="text-2xl font-bold mb-6 text-white tracking-wide flex items-center">
        {title}
        <Link href={`/movies`}>
          <FaAngleRight className="ml-4 mt-1 hover:opacity-80 transition-opacity rounded-full border border-gray-600 w-8 h-8" />
        </Link>
      </h2>

      {/* SWIPER WRAPPER */}
      <div className="relative w-full">
        {/* LEFT ARROW */}
        <div
          className={`absolute -left-12 top-1/2 -translate-y-1/2 z-10
            ${
              showArrows && showPrev
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }
          `}
        >
          <div className="swiper-button-prev" />
        </div>

        {/* RIGHT ARROW */}
        <div
          className={`absolute -right-12 top-1/2 -translate-y-1/2 z-10
            ${
              showArrows && showNext
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }
          `}
        >
          <div className="swiper-button-next" />
        </div>

        {/* SWIPER */}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={5}
          navigation={
            showArrows
              ? {
                  prevEl: ".swiper-button-prev",
                  nextEl: ".swiper-button-next",
                }
              : false
          }
          pagination={{ clickable: true }}
          onSwiper={(swiper) => {
            setShowPrev(!swiper.isBeginning);
            setShowNext(!swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setShowPrev(!swiper.isBeginning);
            setShowNext(!swiper.isEnd);
          }}
        >
          {limitedMovies.map((movie, idx) => (
            <SwiperSlide key={idx}>
              <Link href={`/movie/${movie.slug}`}>
                <div className="bg-black rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="w-full aspect-3/4 overflow-hidden">
                    <img
                      src={movie.thumbnail || "/no_thumb.png"}
                      alt={movie.title || "No title"}
                      className="w-full h-full object-cover"
                      // width={300}
                      // height={400}
                    />
                  </div>

                  <div className="p-3 min-h-22">
                    <h3 className="text-sm font-semibold line-clamp-2 text-white min-h-12">
                      {movie.title}
                    </h3>

                    <div className="flex items-center justify-between mt-1 text-xs ">
                      <span className="text-yellow-500 font-bold">
                        ⭐ {movie.ratingAvg ?? "N/A"}
                      </span>
                      <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[11px] font-medium">
                        {movie.type === "SERIES"
                          ? `${movie.currentEpisode}/${
                              movie.totalEpisodes ?? "??"
                            }`
                          : "Full"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* GLOBAL SWIPER STYLE */}
      <style jsx global>{`
        .swiper-button-prev,
        .swiper-button-next {
          width: 2.5rem;
          height: 2.5rem;
          color: white;
          background: transparent;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease, background 0.3s ease;
        }

        // .swiper-button-prev:hover,
        // .swiper-button-next:hover {
        //   background: rgba(0, 0, 0, 0.8);
        // }

        .swiper-pagination {
          position: relative !important;
          margin-top: 24px;
          display: none;
        }

        // .swiper-pagination-bullet {
        //   background: rgba(255, 255, 255, 0.6);
        // }

        // .swiper-pagination-bullet-active {
        //   background: #ef4444;
        // }
      `}</style>
    </div>
  );
};

export default MovieSlider;
