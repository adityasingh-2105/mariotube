import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VideoSkeleton() {
  return (
    <Card className="border-none bg-transparent shadow-none overflow-hidden rounded-xl">
      <CardContent className="p-0 flex flex-col space-y-2.5">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="flex gap-3 px-1">
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex flex-col flex-1 space-y-2">
            <Skeleton className="h-4 w-[90%] rounded" />
            <Skeleton className="h-3.5 w-[60%] rounded" />
            <Skeleton className="h-3 w-[40%] rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HorizontalVideoSkeleton() {
  return (
    <div className="flex gap-3 p-1.5 w-full">
      <Skeleton className="aspect-video w-36 sm:w-40 md:w-44 flex-shrink-0 rounded-lg" />
      <div className="flex flex-col flex-1 py-0.5 justify-start space-y-2">
        <Skeleton className="h-4 w-[95%] rounded" />
        <Skeleton className="h-4 w-[75%] rounded" />
        <Skeleton className="h-3 w-[45%] rounded" />
        <Skeleton className="h-3.5 w-[30%] rounded" />
      </div>
    </div>
  );
}
