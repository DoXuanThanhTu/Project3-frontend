type SkeletonProps = {
  className?: string;
};

const Skeleton = ({ className }: SkeletonProps) => {
  return <div className={`animate-pulse bg-gray-300 rounded ${className}`} />;
};
export default Skeleton;
