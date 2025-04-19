import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};
const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn("skeleton-container overflow-hidden bg-accent", className)}
    >
      <div className="inner-skeleton w-4/5 h-full" />
    </div>
  );
};

export default Skeleton;
