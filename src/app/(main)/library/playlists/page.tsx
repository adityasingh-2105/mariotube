'use client';

import { useQuery } from "@tanstack/react-query";
import { PlaylistCard } from "@/features/playlists/components/playlist-card";
import { CreatePlaylistDialog } from "@/features/playlists/components/create-playlist-dialog";
import { EmptyState } from "@/components/empty-state";
import { ListVideo } from "lucide-react";

import { useSession } from "next-auth/react";
import { SignInButton } from "@/features/auth/components/sign-in-button";

export default function PlaylistsPage() {
  const { data: session } = useSession();

  const { data: playlistsData, isLoading, isError } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      const res = await fetch("/api/user/playlists");
      if (!res.ok) throw new Error("Failed to fetch playlists");
      return res.json();
    },
    enabled: !!session,
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-primary shadow-inner">
          <ListVideo className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display font-bold text-xl">Your Playlists</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to create, edit, and organize custom video playlists.
          </p>
        </div>
        <SignInButton className="rounded-full px-6 h-10 font-bold" />
      </div>
    );
  }

  const playlists = playlistsData?.data?.playlists || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <ListVideo className="h-6 w-6 text-primary" />
          <h1 className="font-display font-bold text-2xl text-foreground">
            Your Playlists
          </h1>
        </div>
        <CreatePlaylistDialog />
      </div>

      {isError ? (
        <div className="text-center py-12 text-sm text-destructive">
          Failed to load playlists. Please try again.
        </div>
      ) : !isLoading && playlists.length === 0 ? (
        <EmptyState
          icon={ListVideo}
          title="No playlists yet"
          description="Create your first custom playlist to group and order content."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((playlist: any) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}
