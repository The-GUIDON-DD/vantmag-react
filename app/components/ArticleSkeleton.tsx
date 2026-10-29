import { Skeleton } from "~/components/ui/skeleton";
export default function ArticleSkeleton() {
  return (
    <div className="w-full bg-white px-6 lg:px-[15%] py-20 flex flex-col gap-8">
      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </div>
      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </div>
      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </div>
    </div>
  );
}
