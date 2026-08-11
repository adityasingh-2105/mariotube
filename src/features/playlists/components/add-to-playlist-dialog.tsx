'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListPlus, Plus, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { type VideoItem } from "@/lib/youtube-types";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface AddToPlaylistDialogProps {
  videoData: VideoItem;
  trigger?: React.ReactNode;
}

export function AddToPlaylistDialog({ videoData, trigger }: AddToPlaylistDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  
  const queryClient = useQueryClient();

  // Fetch user's playlists
  const { data: playlistsData, isLoading } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      const res = await fetch("/api/user/playlists");
      if (!res.ok) throw new Error("Failed to fetch playlists");
      return res.json();
    },
    enabled: open && !!session,
  });

  const playlists = playlistsData?.data?.playlists || [];

  // Mutation to add video to playlist
  const addVideoMutation = useMutation({
    mutationFn: async ({ playlistId }: { playlistId: string }) => {
      const res = await fetch(`/api/user/playlists/${playlistId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: videoData.id,
          title: videoData.title,
          thumbnailUrl: videoData.thumbnailUrl,
          channelTitle: videoData.channelTitle,
          channelId: videoData.channelId,
          duration: videoData.duration,
        }),
      });
      if (!res.ok) throw new Error("Failed to add video");
      return res.json();
    },
    onSuccess: (data, variables) => {
      const playlistName = playlists.find((p: any) => p.id === variables.playlistId)?.name || "playlist";
      toast.success(`Video added to ${playlistName}`);
      queryClient.invalidateQueries({ queryKey: ["playlist", variables.playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
    onError: () => {
      toast.error("Failed to add video. Already in playlist?");
    },
  });

  // Mutation to create a playlist and immediately add the video
  const createPlaylistAndAddMutation = useMutation({
    mutationFn: async () => {
      // 1. Create playlist
      const createRes = await fetch("/api/user/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlaylistName,
          description: "Created from player",
          isPublic,
        }),
      });
      if (!createRes.ok) throw new Error("Failed to create playlist");
      const createData = await createRes.json();
      const newPlaylist = createData.data.playlist;

      // 2. Add video
      const addRes = await fetch(`/api/user/playlists/${newPlaylist.id}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: videoData.id,
          title: videoData.title,
          thumbnailUrl: videoData.thumbnailUrl,
          channelTitle: videoData.channelTitle,
          channelId: videoData.channelId,
          duration: videoData.duration,
        }),
      });
      if (!addRes.ok) throw new Error("Failed to add video to new playlist");
      
      return { playlist: newPlaylist };
    },
    onSuccess: (data) => {
      toast.success(`Playlist created and video added to ${data.playlist.name}`);
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setNewPlaylistName("");
      setShowCreateForm(false);
    },
    onError: () => {
      toast.error("Failed to create playlist. Try another name.");
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!session) {
      toast.error("Sign in with Google to add videos to playlists");
      return;
    }
    setOpen(isOpen);
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylistAndAddMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger className="cursor-pointer outline-none select-none">
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger className="gap-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center text-sm font-medium transition-colors h-8 px-3.5 cursor-pointer outline-none">
          <ListPlus className="h-4.5 w-4.5" />
          <span>Save</span>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[360px] p-6 rounded-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-display font-bold text-lg">Save Video to...</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex justify-center text-sm text-muted-foreground">Loading playlists...</div>
        ) : (
          <ScrollArea className="max-h-[240px] pr-2 mb-4">
            {playlists.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">No playlists found. Create one below.</div>
            ) : (
              <div className="space-y-1">
                {playlists.map((playlist: any) => (
                  <button
                    key={playlist.id}
                    onClick={() => addVideoMutation.mutate({ playlistId: playlist.id })}
                    disabled={addVideoMutation.isPending}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted text-left transition-colors duration-150"
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      {playlist.isPublic ? <Check className="h-4 w-4 opacity-0" /> : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="truncate">{playlist.name}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {playlist._count?.videos || 0} vids
                    </span>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        <Separator className="my-2" />

        {showCreateForm ? (
          <form onSubmit={handleCreatePlaylist} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Name</label>
              <Input
                id="name"
                placeholder="Enter playlist name"
                className="h-9 rounded-xl text-sm"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground">Privacy</span>
                <span className="text-[10px] text-muted-foreground">Publicly visible or private</span>
              </span>
              <div className="flex items-center space-x-2">
                <Switch
                  id="privacy"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <label htmlFor="privacy" className="text-xs">{isPublic ? "Public" : "Private"}</label>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateForm(false)} className="rounded-full text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!newPlaylistName.trim() || createPlaylistAndAddMutation.isPending} className="rounded-full text-xs">
                Create & Add
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="w-full justify-start gap-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium mt-1"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create new playlist</span>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
