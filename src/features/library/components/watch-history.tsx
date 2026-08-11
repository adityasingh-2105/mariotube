'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type VideoItem } from "@/lib/youtube-types";
import { VideoCard } from "@/features/videos/components/video-card";
import { HorizontalVideoSkeleton } from "@/features/videos/components/video-skeleton";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Trash2, History } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { SignInButton } from "@/features/auth/components/sign-in-button";

interface HistoryItem {
  id: string;
  watchedAt: string;
  video: any;
}

interface HistoryResponse {
  success: boolean;
  data: {
    history: HistoryItem[];
  };
}

export function WatchHistory() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Fetch watch history
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<HistoryResponse>({
    queryKey: ["history"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        take: "12",
        skip: (Number(pageParam) * 12).toString(),
      });
      const res = await fetch(`/api/user/history?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch watch history");
      return res.json();
    },
    enabled: !!session,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPageParam = allPages.length;
      return lastPage.data?.history?.length === 12 ? nextPageParam : undefined;
    },
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-primary shadow-inner">
          <History className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display font-bold text-xl">Keep track of what you watch</h2>
          <p className="text-sm text-muted-foreground">
            Watch history isn't viewable when signed out. Sign in with your Google account to track your watched videos.
          </p>
        </div>
        <SignInButton className="rounded-full px-6 h-10 font-bold" />
      </div>
    );
  }

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/history", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear history");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Watch history cleared");
    },
    onError: () => {
      toast.error("Failed to clear watch history");
    },
  });

  const historyEntries = data?.pages.flatMap((page) => page.data?.history || []) || [];

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire watch history?")) {
      clearHistoryMutation.mutate();
    }
  };

  if (isError) {
    return (
      <div className="text-center py-12 text-sm text-destructive">
        Failed to load watch history. Please try again.
      </div>
    );
  }

  const hasHistory = historyEntries.length > 0;

  return (
    <div className="space-y-6">
      {hasHistory && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/20 hover:bg-destructive/10 rounded-full gap-2 px-4"
            onClick={handleClearHistory}
            disabled={clearHistoryMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            Clear all watch history
          </Button>
        </div>
      )}

      {isLoading && !hasHistory ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <HorizontalVideoSkeleton key={index} />
          ))}
        </div>
      ) : !hasHistory ? (
        <EmptyState
          icon={History}
          title="Watch history is empty"
          description="Videos you watch in MarioTube will be saved here automatically."
        />
      ) : (
        <InfiniteScroll
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        >
          <div className="flex flex-col gap-4 max-w-4xl">
            {historyEntries.map((entry) => {
              const videoItem: VideoItem = {
                id: entry.video.youtubeId,
                title: entry.video.title,
                description: entry.video.description || "",
                thumbnailUrl: entry.video.thumbnailUrl || "",
                channelId: entry.video.channelId || "",
                channelTitle: entry.video.channelTitle || "",
                publishedAt: entry.video.publishedAt || entry.watchedAt,
              };

              return (
                <div key={entry.id} className="relative group">
                  <VideoCard video={videoItem} variant="horizontal" />
                  <div className="absolute right-4 bottom-4 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    Watched {new Date(entry.watchedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}
