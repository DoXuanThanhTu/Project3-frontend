// components/movie/MovieCardSkeleton.tsx
import Skeleton from "@/components/ui/Skeleton";
export default function MovieCardSkeleton() {
  return (
    <div className="space-y-2 cursor-pointer">
      <Skeleton className="w-full aspect-2/3 rounded-lg" />
      <Skeleton className="h-4 w-3/4 mx-auto rounded" />
    </div>
  );
}
