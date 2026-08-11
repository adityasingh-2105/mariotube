'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { VideoCard } from "@/features/videos/components/video-card";
import { CreatePlaylistDialog } from "@/features/playlists/components/create-playlist-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, ListVideo, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { type VideoItem } from "@/lib/youtube-types";

export default function PlaylistDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch playlist with videos
  const { data: playlistData, isLoading, isError } = useQuery({
    queryKey: ["playlist", id],
    queryFn: async () => {
      const res = await fetch(`/api/user/playlists/${id}`);
      if (!res.ok) throw new Error("Failed to fetch playlist");
      return res.json();
    },
  });

  const playlist = playlistData?.data?.playlist;

  // Delete playlist mutation
  const deletePlaylistMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/user/playlists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete playlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Playlist deleted successfully");
      router.push("/library");
    },
    onError: () => {
      toast.error("Failed to delete playlist");
    },
  });

  // Remove video mutation
  const removeVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const res = await fetch(`/api/user/playlists/${id}/videos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (!res.ok) throw new Error("Failed to remove video");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist", id] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Video removed from playlist");
    },
    onError: () => {
      toast.error("Failed to remove video");
    },
  });

  const handleDeletePlaylist = () => {
    if (window.confirm("Are you sure you want to delete this playlist? This cannot be undone.")) {
      deletePlaylistMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-sm text-muted-foreground">Loading playlist details...</div>;
  }

  if (isError || !playlist) {
    return (
      <div className="text-center py-12 text-sm text-destructive">
        Failed to load playlist or playlist does not exist.
      </div>
    );
  }

  const playlistVideos = playlist.videos || [];

  return (
    <div className="space-y-6">
      {/* Header card details */}
      <div className="bg-gradient-to-tr from-muted/50 via-card to-muted/20 border border-border/40 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <ListVideo className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Playlist</span>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{playlist.description}</p>
          )}
          <div className="text-xs font-medium text-muted-foreground pt-1">
            {playlistVideos.length} {playlistVideos.length === 1 ? "video" : "videos"} • Updated{" "}
            {new Date(playlist.updatedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Delete / Edit options */}
        <div className="flex items-center gap-2 h-fit">
          <CreatePlaylistDialog
            editPlaylist={{
              id: playlist.id,
              name: playlist.name,
              description: playlist.description,
              isPublic: playlist.isPublic,
            }}
            trigger={
              <Button variant="outline" size="sm" className="rounded-full">
                Edit Details
              </Button>
            }
          />
          {!playlist.isSystem && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/20 hover:bg-destructive/15 rounded-full"
              onClick={handleDeletePlaylist}
              disabled={deletePlaylistMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Videos List */}
      {playlistVideos.length === 0 ? (
        <EmptyState
          icon={ListVideo}
          title="Playlist is empty"
          description="Find videos you want and add them here to watch them later."
        />
      ) : (
        <div className="flex flex-col gap-4 max-w-4xl">
          {playlistVideos.map((item: any) => {
            const videoItem: VideoItem = {
              id: item.video.youtubeId,
              title: item.video.title,
              description: item.video.description || "",
              thumbnailUrl: item.video.thumbnailUrl || "",
              channelId: item.video.channelId || "",
              channelTitle: item.video.channelTitle || "",
              publishedAt: item.video.publishedAt || item.addedAt,
              duration: item.video.duration || "",
            };

            return (
              <div key={item.videoId} className="relative group">
                <VideoCard video={videoItem} variant="horizontal" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeVideoMutation.mutate(videoItem.id)}
                  disabled={removeVideoMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
