'use client';

import { useQuery } from "@tanstack/react-query";
import { type VideoItem } from "@/lib/youtube-types";
import { VideoCard } from "./video-card";
import { HorizontalVideoSkeleton } from "./video-skeleton";

interface RelatedVideosProps {
  videoId: string;
}

export function RelatedVideos({ videoId }: RelatedVideosProps) {
  const { data: relatedData, isLoading, isError } = useQuery({
    queryKey: ["related-videos", videoId],
    queryFn: async () => {
      const res = await fetch(`/api/youtube/related/${videoId}`);
      if (!res.ok) throw new Error("Failed to fetch related videos");
      return res.json();
    },
  });

  const videos: VideoItem[] = relatedData?.data?.videos || [];
  const filteredVideos = videos.filter((video) => video.id !== videoId);

  if (isError) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Failed to load related videos.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="font-display font-bold text-lg text-foreground px-1">
        Related Videos
      </h2>
      
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <HorizontalVideoSkeleton key={index} />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 px-1">
          No related videos found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
}
