'use client';

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreatePlaylistDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  editPlaylist?: {
    id: string;
    name: string;
    description?: string | null;
    isPublic: boolean;
  };
}

export function CreatePlaylistDialog({
  onSuccess,
  trigger,
  editPlaylist,
}: CreatePlaylistDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(editPlaylist?.name || "");
  const [description, setDescription] = useState(editPlaylist?.description || "");
  const [isPublic, setIsPublic] = useState(editPlaylist?.isPublic ?? true);

  const queryClient = useQueryClient();

  const isEditing = !!editPlaylist;

  const playlistMutation = useMutation({
    mutationFn: async () => {
      const url = isEditing ? `/api/user/playlists/${editPlaylist.id}` : "/api/user/playlists";
      const method = isEditing ? "PATCH" : "POST";
      const body = JSON.stringify({ name, description, isPublic });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error("Failed to save playlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      if (editPlaylist) {
        queryClient.invalidateQueries({ queryKey: ["playlist", editPlaylist.id] });
      }
      toast.success(isEditing ? "Playlist updated successfully" : "Playlist created successfully");
      setOpen(false);
      
      // Reset form if creating
      if (!isEditing) {
        setName("");
        setDescription("");
        setIsPublic(true);
      }

      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast.error("Failed to save playlist. Try a different name.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      playlistMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger className="cursor-pointer outline-none select-none">
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger className="h-8 px-3 rounded-full inline-flex items-center justify-center text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer outline-none">
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Create Playlist</span>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-lg">
            {isEditing ? "Edit Playlist Details" : "Create New Playlist"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Name input */}
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
              Playlist Name
            </label>
            <Input
              id="name"
              placeholder="e.g. Chill Beats, Coding Session"
              className="rounded-xl h-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {/* Description input */}
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="description" className="text-xs font-semibold text-muted-foreground">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              placeholder="What is this playlist about?"
              className="rounded-xl min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Privacy settings */}
          <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border/40">
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-semibold">Privacy Settings</span>
              <span className="text-xs text-muted-foreground">
                Public playlists are visible in search results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <label htmlFor="isPublic" className="text-xs font-medium">
                {isPublic ? "Public" : "Private"}
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-full text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || playlistMutation.isPending}
              className="rounded-full text-sm font-semibold shadow-sm"
            >
              {playlistMutation.isPending
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Playlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
