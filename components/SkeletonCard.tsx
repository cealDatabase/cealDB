import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonCard() {
    return (
      <div className="flex flex-col space-y-8 mt-12 w-2/4">
        <Skeleton className="w-full h-[7rem] rounded-xl" />
        <div className="flex flex-row space-x-8">
          <Skeleton className="w-1/4 h-[5rem] rounded-xl" />
          <Skeleton className="w-3/4 h-[5rem] rounded-xl" />
        </div>
        <div className="flex flex-row space-x-8">
          <Skeleton className="w-1/4 h-[5rem] rounded-xl" />
          <Skeleton className="w-3/4 h-[5rem] rounded-xl" />
        </div>
        <Skeleton className="w-full h-[6rem] rounded-xl" />
        <div className="flex flex-row space-x-8">
          <Skeleton className="w-1/4 h-[5rem] rounded-xl" />
          <Skeleton className="w-3/4 h-[5rem] rounded-xl" />
        </div>
        <div className="flex flex-row space-x-8">
          <Skeleton className="w-1/4 h-[5rem] rounded-xl" />
          <Skeleton className="w-3/4 h-[5rem] rounded-xl" />
        </div>
        <Skeleton className="w-full h-[7rem] rounded-xl" />
      </div>
    );
  }