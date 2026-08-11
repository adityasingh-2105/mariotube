'use client';

import { useQuery } from "@tanstack/react-query";
import { type VideoItem } from "@/lib/youtube-types";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { EmptyState } from "@/components/empty-state";
import { Clock } from "lucide-react";

import { useSession } from "next-auth/react";
import { SignInButton } from "@/features/auth/components/sign-in-button";

export default function WatchLaterPage() {
  const { data: session } = useSession();

  const { data: wlData, isLoading, isError } = useQuery({
    queryKey: ["watch-later"],
    queryFn: async () => {
      const res = await fetch("/api/user/watch-later");
      if (!res.ok) throw new Error("Failed to fetch watch later videos");
      return res.json();
    },
    enabled: !!session,
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-primary shadow-inner">
          <Clock className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display font-bold text-xl">Save for later</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to view and manage videos saved to your Watch Later list.
          </p>
        </div>
        <SignInButton className="rounded-full px-6 h-10 font-bold" />
      </div>
    );
  }

  const rawVideos = wlData?.data?.videos || [];

  const videos: VideoItem[] = rawVideos.map((v: any) => ({
    id: v.youtubeId,
    title: v.title,
    description: v.description || "",
    thumbnailUrl: v.thumbnailUrl || "",
    channelId: v.channelId || "",
    channelTitle: v.channelTitle || "",
    publishedAt: v.publishedAt || v.createdAt,
    duration: v.duration,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
        <Clock className="h-6 w-6 text-primary fill-primary/10" />
        <h1 className="font-display font-bold text-2xl text-foreground">
          Watch Later
        </h1>
      </div>

      {isError ? (
        <div className="text-center py-12 text-sm text-destructive">
          Failed to load watch later videos. Please try again.
        </div>
      ) : !isLoading && videos.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Watch Later is empty"
          description="Save videos to watch later while viewing details."
        />
      ) : (
        <VideoGrid videos={videos} isLoading={isLoading} />
      )}
    </div>
  );
}
