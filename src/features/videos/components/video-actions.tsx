'use client';

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { type VideoItem } from "@/lib/youtube-types";
import { AddToPlaylistDialog } from "../../playlists/components/add-to-playlist-dialog";
import { cn } from "@/lib/utils";

interface VideoActionsProps {
  videoId: string;
  videoData: VideoItem;
}

export function VideoActions({ videoId, videoData }: VideoActionsProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // 1. Fetch Favorite state
  const { data: favsData } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/user/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    },
    enabled: !!session,
  });

  const isFavorited = favsData?.data?.favorites?.some((v: any) => v.youtubeId === videoId);

  // 2. Fetch Watch Later state
  const { data: wlData } = useQuery({
    queryKey: ["watch-later"],
    queryFn: async () => {
      const res = await fetch("/api/user/watch-later");
      if (!res.ok) throw new Error("Failed to fetch watch-later");
      return res.json();
    },
    enabled: !!session,
  });

  const isInWatchLater = wlData?.data?.videos?.some((v: any) => v.youtubeId === videoId);

  // Mutation to toggle favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const method = isFavorited ? "DELETE" : "POST";
      const url = isFavorited ? `/api/user/favorites?videoId=${videoId}` : "/api/user/favorites";
      const body = isFavorited
        ? undefined
        : JSON.stringify({
            videoId,
            title: videoData.title,
            thumbnailUrl: videoData.thumbnailUrl,
            channelTitle: videoData.channelTitle,
            channelId: videoData.channelId,
            duration: videoData.duration,
          });

      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body,
      });

      if (!res.ok) throw new Error("Failed to toggle favorite");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(isFavorited ? "Removed from Favorites" : "Added to Favorites");
    },
    onError: () => {
      toast.error("Failed to update Favorites. Please try again.");
    },
  });

  // Mutation to toggle watch later
  const toggleWatchLaterMutation = useMutation({
    mutationFn: async () => {
      const method = isInWatchLater ? "DELETE" : "POST";
      const url = isInWatchLater ? `/api/user/watch-later?videoId=${videoId}` : "/api/user/watch-later";
      const body = isInWatchLater
        ? undefined
        : JSON.stringify({
            videoId,
            title: videoData.title,
            thumbnailUrl: videoData.thumbnailUrl,
            channelTitle: videoData.channelTitle,
            channelId: videoData.channelId,
            duration: videoData.duration,
          });

      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body,
      });

      if (!res.ok) throw new Error("Failed to toggle watch-later");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-later"] });
      toast.success(isInWatchLater ? "Removed from Watch Later" : "Saved to Watch Later");
    },
    onError: () => {
      toast.error("Failed to update Watch Later. Please try again.");
    },
  });

  const handleFavoriteClick = () => {
    if (!session) {
      toast.error("Sign in with Google to add favorites");
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleWatchLaterClick = () => {
    if (!session) {
      toast.error("Sign in with Google to save to Watch Later");
      return;
    }
    toggleWatchLaterMutation.mutate();
  };

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/watch/${videoId}`;
    navigator.clipboard.writeText(shareUrl).then(
      () => toast.success("Video link copied to clipboard!"),
      () => toast.error("Failed to copy video link.")
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1 bg-muted/40 backdrop-blur-sm border rounded-full px-2.5 py-1 w-fit">
      {/* Favorite Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "rounded-full gap-2 hover:bg-muted text-muted-foreground hover:text-foreground h-8 px-3.5",
          isFavorited && "text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/15"
        )}
        onClick={handleFavoriteClick}
        disabled={toggleFavoriteMutation.isPending}
      >
        <Heart className={cn("h-4.5 w-4.5", isFavorited && "fill-current")} />
        <span className="text-xs font-semibold">{isFavorited ? "Liked" : "Like"}</span>
      </Button>

      {/* Watch Later Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "rounded-full gap-2 hover:bg-muted text-muted-foreground hover:text-foreground h-8 px-3.5",
          isInWatchLater && "text-primary hover:text-primary bg-primary/10 hover:bg-primary/15"
        )}
        onClick={handleWatchLaterClick}
        disabled={toggleWatchLaterMutation.isPending}
      >
        <Clock className={cn("h-4.5 w-4.5", isInWatchLater && "fill-current")} />
        <span className="text-xs font-semibold">{isInWatchLater ? "Saved" : "Save later"}</span>
      </Button>

      {/* Playlist Save Trigger */}
      <AddToPlaylistDialog videoData={videoData} />

      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full gap-2 hover:bg-muted text-muted-foreground hover:text-foreground h-8 px-3.5"
        onClick={handleShareClick}
      >
        <Share2 className="h-4.5 w-4.5" />
        <span className="text-xs font-semibold">Share</span>
      </Button>
    </div>
  );
}
