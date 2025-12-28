"use client";

import { Heart, MessageCircle, Play, Plus, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { IMovie, IServer } from "@/types/movie.type";

type MovieMainProps = {
  movie: IMovie;
  servers?: IServer[];
  relatedMovies?: IMovie[];
};

const MovieMain: React.FC<MovieMainProps> = ({
  movie,
  servers,
  relatedMovies = [],
}) => {
  const [selectedServer, setSelectedServer] = useState<IServer | null>(
    servers?.[0] ?? null
  );

  const [activeTab, setActiveTab] = useState<"episode" | "cast" | "recommend">(
    "episode"
  );

  // const title =
  //   movie.title.get(movie.defaultLang) || [...movie.title.values()][0];

  // const slug = movie.slug.get(movie.defaultLang) || [...movie.slug.values()][0];

  return (
    <div className="bg-gray-900 text-white p-5 rounded-2xl">
      {/* ===== ACTIONS ===== */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/watch/${movie.slug}?ep=1`}
          className="flex items-center gap-2 bg-yellow-500 text-black px-5 py-2 rounded-full font-semibold hover:bg-yellow-400"
        >
          <Play className="w-5 h-5" /> Xem ngay
        </Link>

        <ActionBtn icon={<Heart />} label="Yêu thích" />
        <ActionBtn icon={<Plus />} label="Danh sách" />
        <ActionBtn icon={<Share2 />} label="Chia sẻ" />
        <ActionBtn icon={<MessageCircle />} label="Bình luận" />
      </div>

      {/* ===== META ===== */}
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-300">
        <span className="px-2 py-1 bg-white/10 rounded">{movie.type}</span>

        {movie.duration && (
          <span className="px-2 py-1 bg-white/10 rounded">
            {movie.duration}
          </span>
        )}

        <span className="px-2 py-1 bg-yellow-500/80 text-black rounded">
          ⭐ {movie.ratingAvg ? movie.ratingAvg.toFixed(1) : "N/A"}
        </span>

        <span className="px-2 py-1 bg-white/10 rounded">
          👁 {movie.views ? movie.views.toLocaleString() : "N/A"}
        </span>
      </div>

      {/* ===== GENRES ===== */}
      {movie.genres?.length && (
        <div className="mt-3 text-sm text-gray-400">
          {movie.genres.join(" • ")}
        </div>
      )}

      {/* ===== TABS ===== */}
      <div className="flex gap-4 mt-6 border-b border-gray-700">
        {[
          { id: "episode", label: "Tập phim" },
          { id: "cast", label: "Diễn viên" },
          { id: "recommend", label: "Đề xuất" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-2 text-sm font-medium ${
              activeTab === t.id
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="mt-6">
        {/* ===== EPISODES ===== */}
        {activeTab === "episode" && (
          <>
            {/* Servers */}
            <div className="flex flex-wrap gap-3 mb-4">
              {servers.map((s) => (
                <button
                  key={s._id}
                  onClick={() => setSelectedServer(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedServer?._id === s._id
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Episodes */}
            {selectedServer?.episodes?.length ? (
              <div className="flex flex-wrap gap-2">
                {selectedServer.episodes.map((ep) => {
                  const epSlug =
                    ep.slug.get(ep.defaultLang) || [...ep.slug.values()][0];

                  return (
                    <Link
                      key={ep._id}
                      href={`/watch/${slug}?ep=${ep.episodeNumber}`}
                      className="px-4 py-2 bg-gray-800 hover:bg-purple-600 rounded-lg text-sm"
                    >
                      Tập {ep.episodeNumber}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="italic text-gray-400">Chưa có tập phim</div>
            )}
          </>
        )}

        {/* ===== CAST ===== */}
        {activeTab === "cast" && (
          <div className="flex flex-wrap gap-3">
            {movie.cast?.length ? (
              movie.cast.map((c, i) => (
                <span
                  key={i}
                  className="bg-gray-800 px-3 py-1 rounded-lg text-sm"
                >
                  {c}
                </span>
              ))
            ) : (
              <span className="italic text-gray-400">
                Chưa có thông tin diễn viên
              </span>
            )}
          </div>
        )}

        {/* ===== RECOMMEND ===== */}
        {activeTab === "recommend" && (
          <div className="flex flex-wrap gap-5">
            {relatedMovies.map((m) => {
              // const mTitle =
              //   m.title.get(m.defaultLang) || [...m.title.values()][0];
              // const mSlug =
              //   m.slug.get(m.defaultLang) || [...m.slug.values()][0];

              return (
                <Link
                  key={m.id}
                  href={`/movie/${m.slug}`}
                  className="w-[180px]"
                >
                  <div className="relative h-[260px] rounded-lg overflow-hidden">
                    <Image
                      src={m.poster || "/no_poster.png"}
                      alt={"s"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-2 text-sm text-center">{"ssss"}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ActionBtn = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <button className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700">
    {icon} {label}
  </button>
);

export default MovieMain;
