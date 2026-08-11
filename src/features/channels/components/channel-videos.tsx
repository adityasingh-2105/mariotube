'use client';

import { useInfiniteQuery } from "@tanstack/react-query";
import { type VideoItem } from "@/lib/youtube-types";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { EmptyState } from "@/components/empty-state";
import { Film } from "lucide-react";

interface ChannelVideosProps {
  channelId: string;
}

interface ChannelVideosResponse {
  success: boolean;
  data: {
    videos: VideoItem[];
    nextPageToken?: string;
  };
}

export function ChannelVideos({ channelId }: ChannelVideosProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ChannelVideosResponse>({
    queryKey: ["channel-videos", channelId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        maxResults: "12",
      });
      if (pageParam) params.set("pageToken", pageParam as string);
      
      const res = await fetch(`/api/youtube/channels/${channelId}/videos?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch channel videos");
      return res.json();
    },
    initialPageParam: "" as string,
    getNextPageParam: (lastPage) => lastPage.data?.nextPageToken ?? undefined,
    staleTime: 10 * 60 * 1000, // 10 mins cache
  });

  const videos = data?.pages.flatMap((page) => page.data?.videos || []) || [];

  if (isError) {
    return (
      <div className="text-center py-12 text-sm text-destructive">
        Failed to load channel videos. Please try again later.
      </div>
    );
  }

  if (!isLoading && videos.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title="No videos found"
        description="This channel hasn't uploaded any videos yet."
      />
    );
  }

  return (
    <InfiniteScroll
      hasMore={hasNextPage}
      isLoading={isFetchingNextPage}
      onLoadMore={fetchNextPage}
    >
      <VideoGrid videos={videos} isLoading={isLoading} />
    </InfiniteScroll>
  );
}
