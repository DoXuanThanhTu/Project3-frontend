"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import type { IMovieResponse } from "@/types/res.type";

type MovieSliderProps = {
  title: string;
  movies: IMovieResponse[];
};

const MovieSlider: React.FC<MovieSliderProps> = ({ title, movies }) => {
  const limitedMovies = movies.slice(0, 10);
  const showArrows = limitedMovies.length > 5;

  // Unique id to scope CSS & avoid collisions when multiple sliders on same page
  const reactId = useId(); // React 18 hook
  const uid = useMemo(() => reactId.replace(/[:#]/g, "-"), [reactId]);

  // Refs for navigation buttons (unique per instance)
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  // State to hold navigation elements when refs are ready
  const [navigationElements, setNavigationElements] = useState<{
    prevEl: HTMLButtonElement | null;
    nextEl: HTMLButtonElement | null;
  } | null>(null);

  // Keep a ref to swiper instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swiperRef = useRef<any | null>(null);

  // local state for showing prev/next (per instance)
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(showArrows);

  // attach refs to swiper navigation safely (when refs + swiper available)
  useEffect(() => {
    const prevEl = prevRef.current;
    const nextEl = nextRef.current;

    if (prevEl && nextEl && showArrows) {
      setNavigationElements({ prevEl, nextEl });
    }
  }, [showArrows, uid]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || !showArrows || !navigationElements) return;

    const { prevEl, nextEl } = navigationElements;

    // assign DOM elements into swiper params then init/update navigation
    // (some Swiper versions require calling init() manually)
    swiper.params.navigation = {
      ...swiper.params.navigation,
      prevEl,
      nextEl,
    };
    if (swiper.navigation && !swiper.navigation.initialized) {
      swiper.navigation.init();
    }
    swiper.navigation.update();
    // update visible states
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  }, [showArrows, navigationElements, uid]);

  // Called when swiper is created
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOnSwiper = (swiper: any) => {
    swiperRef.current = swiper;
    // If arrows are not displayed, ensure navigation disabled
    if (!showArrows) {
      // nothing to do
      return;
    }
    // if refs already available, attach them
    const prevEl = prevRef.current;
    const nextEl = nextRef.current;
    if (prevEl && nextEl) {
      swiper.params.navigation.prevEl = prevEl;
      swiper.params.navigation.nextEl = nextEl;
      if (swiper.navigation && !swiper.navigation.initialized) {
        swiper.navigation.init();
      }
      swiper.navigation.update();
    }
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  };

  // Update prev/next visibility on slide change
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSlideChange = (swiper: any) => {
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  };

  return (
    <div className={`movie-slider-${uid} my-10 relative`}>
      <h2 className="text-2xl font-bold mb-6 text-white tracking-wide flex items-center">
        {title}
        <Link href={`/movie`}>
          <div className="ml-4 mt-1 hover:opacity-80 transition-opacity rounded-full border border-gray-600 w-8 h-8 inline-flex items-center justify-center">
            <FaAngleRight />
          </div>
        </Link>
      </h2>

      <div className="relative w-full">
        {/* LEFT ARROW (scoped) */}
        <button
          ref={prevRef}
          aria-label="Previous"
          className={`absolute -left-12 top-1/2 -translate-y-1/2 z-20 focus:outline-none ${
            showArrows && canPrev
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          // keep role/button semantics even if swiper will handle clicks
          onClick={() => {
            if (swiperRef.current) swiperRef.current.slidePrev();
          }}
        >
          <div className="swiper-button-prev-inner">
            <FaAngleLeft />
          </div>
        </button>

        {/* RIGHT ARROW (scoped) */}
        <button
          ref={nextRef}
          aria-label="Next"
          className={`absolute -right-12 top-1/2 -translate-y-1/2 z-20 focus:outline-none ${
            showArrows && canNext
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => {
            if (swiperRef.current) swiperRef.current.slideNext();
          }}
        >
          <div className="swiper-button-next-inner">
            <FaAngleRight />
          </div>
        </button>

        {/* SWIPER */}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={5}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 14 },
            640: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 18 },
            1280: { slidesPerView: 5, spaceBetween: 20 },
          }}
          navigation={
            showArrows && navigationElements ? navigationElements : false
          }
          pagination={{ clickable: true }}
          onSwiper={handleOnSwiper}
          onSlideChange={handleSlideChange}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onBeforeInit={(swiper: any) => {
            if (!showArrows) return;
            if (prevRef.current && nextRef.current) {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }
          }}
        >
          {limitedMovies.map((movie, idx) => (
            <SwiperSlide key={movie.id ?? movie.slug ?? idx}>
              <Link href={`/movie/${movie.slug ?? ""}`}>
                <div className="bg-black rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="w-full aspect-3/4 relative overflow-hidden">
                    {movie.thumbnail ? (
                      <img
                        src={movie.thumbnail}
                        alt={movie.title || "No title"}
                        className="object-cover"
                        // NOTE: ensure next.config.js allows external domains for these thumbnails
                      />
                    ) : (
                      <img
                        src="/no_thumb.png"
                        alt={movie.title || "No title"}
                        className="w-full h-full object-cover"
                      />
                    )}
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

      {/* Scoped CSS for this slider instance only */}
      <style jsx global>{`
        /* Scope styles using container class */
        .movie-slider-${uid} .swiper-button-prev-inner,
        .movie-slider-${uid} .swiper-button-next-inner {
          width: 2.5rem;
          height: 2.5rem;
          color: white;
          background: rgba(0, 0, 0, 0.45);
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease, transform 0.15s ease;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
        }

        .movie-slider-${uid} .swiper-button-prev-inner:hover,
        .movie-slider-${uid} .swiper-button-next-inner:hover {
          transform: scale(1.06);
        }

        .movie-slider-${uid} .swiper-pagination {
          position: relative !important;
          margin-top: 24px;
          display: none;
        }

        /* Keep the hidden pointer-events-none states working for buttons */
        .movie-slider-${uid} button[aria-label="Previous"],
        .movie-slider-${uid} button[aria-label="Next"] {
          border: none;
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default MovieSlider;
