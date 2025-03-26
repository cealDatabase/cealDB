import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "./Container";

export default function SkeletonTableCard() {
  return (
    <div className="flex flex-col space-y-8 mt-12 w-full">
      <Skeleton className="w-full h-[7rem] rounded-xl" />
      <div className="flex flex-row space-x-8">
        <Skeleton className="w-1/4 h-[5rem] rounded-xl" />
        <Skeleton className="w-3/4 h-[5rem] rounded-xl" />
      </div>
      <div className="flex flex-row space-x-8">
        <Skeleton className="w-1/4 h-[5rem] rounded-xl" />
        <Skeleton className="w-3/4 h-[5rem] rounded-xl" />
      </div>
      <h2 className="flex justify-center items-center">Loading...</h2>
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