'use client';

import { useQuery } from "@tanstack/react-query";
import { type VideoItem } from "@/lib/youtube-types";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { EmptyState } from "@/components/empty-state";
import { Heart } from "lucide-react";

import { useSession } from "next-auth/react";
import { SignInButton } from "@/features/auth/components/sign-in-button";

export function FavoritesGrid() {
  const { data: session } = useSession();

  const { data: favsData, isLoading, isError } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/user/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    },
    enabled: !!session,
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-primary shadow-inner">
          <Heart className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display font-bold text-xl">Enjoy your favorites</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to view your liked and favorited videos across MarioTube.
          </p>
        </div>
        <SignInButton className="rounded-full px-6 h-10 font-bold" />
      </div>
    );
  }

  const rawVideos = favsData?.data?.favorites || [];
  
  // Map internal video schema to VideoItem format
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

  if (isError) {
    return (
      <div className="text-center py-12 text-sm text-destructive">
        Failed to load favorites. Please try again.
      </div>
    );
  }

  if (!isLoading && videos.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No favorites yet"
        description="Videos you mark as favorite while watching will appear here."
      />
    );
  }

  return <VideoGrid videos={videos} isLoading={isLoading} />;
}
