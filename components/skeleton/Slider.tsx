// components/ui/SliderSkeleton.tsx
import Skeleton from "@/components/ui/Skeleton";
export default function SliderSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto py-4">
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton key={idx} className="w-40 h-60 rounded-lg flex-shrink-0" />
      ))}
    </div>
  );
}
