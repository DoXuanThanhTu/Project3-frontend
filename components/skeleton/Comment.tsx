import Skeleton from "@/components/ui/Skeleton";
export default function CommentSkeleton() {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="w-full h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
