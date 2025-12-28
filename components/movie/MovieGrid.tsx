// components/movie/MovieGrid.tsx
import { MovieCard } from "./MovieCard";

const movies = [
  { id: "1", title: "Avengers" },
  { id: "2", title: "Batman" },
  { id: "3", title: "Interstellar" },
  { id: "4", title: "Inception" },
];

export function MovieGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {movies.map((m) => (
        <MovieCard key={m.id} {...m} />
      ))}
    </div>
  );
}
