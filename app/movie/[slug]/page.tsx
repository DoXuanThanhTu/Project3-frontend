"use client";
import { JSX, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { IMovie } from "@/types/movie.type";
// import MovieInfo from "@/components/movie/MovieInfo";
// import MovieMain from "@/components/movie/MovieMain";

const API_URL = process.env.NEXT_PUBLIC_MOVIE_API_URL;

interface LocalFranchiseData {
  movie: IMovie;
  relatedMovies: IMovie[];
}

const MovieDetail = (): JSX.Element => {
  const { slug } = useParams();
  const [allData, setAllData] = useState<LocalFranchiseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const res = await axios.get(`${API_URL}/movie/${slug}/same-franchise`);
        if (!res.data?.data?.movie) {
          setErrorMessage("Không tìm thấy phim");
          setAllData(null);
        } else {
          setAllData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
        setErrorMessage("Lỗi khi tải dữ liệu phim");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (isLoading) {
    return <p className="text-center text-gray-400 mt-10">Đang tải...</p>;
  }

  if (errorMessage) {
    return <p className="text-center text-red-400 mt-10">{errorMessage}</p>;
  }

  if (!allData) return <></>;

  const { movie } = allData;
  const banner = movie.banner;
  console.log(banner);
  return (
    <div className="bg-[#0f0f10] min-h-screen text-white">
      {/* Banner */}
      <div
        className="h-[600px] bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${banner || "/no_banner.png"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-[#0f0f10] via-[#0f0f10]/60 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row w-full p-5 md:pr-20 xl:pr-40 md:pl-20 xl:pl-40 gap-8">
        {/* Movie Info */}
        <div className="max-w-[400px] w-full shrink-0">
          {/* <MovieInfo movie={movie} /> */}
        </div>

        {/* MovieMain */}
        <div className="flex-1 w-full">
          {/* <MovieMain data={allData!} /> */}
        </div>
      </div>

      {/* Related Movies */}
      {/* {relatedMovies.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-10 pb-16">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
            Các phần khác trong series
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {relatedMovies?.map((m) => (
              <Link
                key={m._id}
                href={`/movie/${m.slug ?? m._id}`}
                className="block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition"
              >
                <div className="relative w-full h-60">
                  <Image
                    src={m.thumbnail_url || "/no_thumb.png"}
                    alt={m.titles?.[0]?.title || ""}
                    className="object-cover"
                    fill
                  />
                </div>
                <div className="p-2 text-sm text-center text-white truncate">
                  {m.titles?.[0]?.title || "Không rõ tên"}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default MovieDetail;
