import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { type VideoItem } from "@/lib/youtube-types";
import { VideoCard } from "@/features/videos/components/video-card";
import { PlaylistCard } from "@/features/playlists/components/playlist-card";
import { CreatePlaylistDialog } from "@/features/playlists/components/create-playlist-dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, History, Heart, Clock, ListVideo, Library } from "lucide-react";
import Link from "next/link";

import { SignInButton } from "@/features/auth/components/sign-in-button";

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 max-w-md mx-auto space-y-5">
        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-primary shadow-inner">
          <Library className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-extrabold text-2xl">Enjoy your favorite videos</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to access your watch history, liked videos, custom playlists, and subscriptions across any device.
          </p>
        </div>
        <SignInButton className="rounded-full px-6 h-11 font-bold shadow-lg shadow-primary/15" />
      </div>
    );
  }

  const userId = session.user.id;

  // 1. Fetch recent history (first 4 items)
  const historyEntries = await db.watchHistory.findMany({
    where: { userId },
    include: { video: true },
    orderBy: { watchedAt: "desc" },
    take: 4,
  });

  const historyVideos: VideoItem[] = historyEntries.map((h) => ({
    id: h.video.youtubeId,
    title: h.video.title,
    description: h.video.description || "",
    thumbnailUrl: h.video.thumbnailUrl || "",
    channelId: h.video.channelId || "",
    channelTitle: h.video.channelTitle || "",
    publishedAt: h.video.publishedAt?.toISOString() || h.watchedAt.toISOString(),
    duration: h.video.duration || "",
  }));

  // 2. Fetch favorites (first 4 items)
  const favoriteEntries = await db.favorite.findMany({
    where: { userId },
    include: { video: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const favoriteVideos: VideoItem[] = favoriteEntries.map((f) => ({
    id: f.video.youtubeId,
    title: f.video.title,
    description: f.video.description || "",
    thumbnailUrl: f.video.thumbnailUrl || "",
    channelId: f.video.channelId || "",
    channelTitle: f.video.channelTitle || "",
    publishedAt: f.video.publishedAt?.toISOString() || f.createdAt.toISOString(),
    duration: f.video.duration || "",
  }));

  // 3. Fetch watch later (first 4 items)
  const watchLaterPlaylist = await db.playlist.findFirst({
    where: { userId, isSystem: true, systemType: "watch-later" },
    include: {
      videos: {
        include: { video: true },
        orderBy: { addedAt: "desc" },
        take: 4,
      },
    },
  });

  const watchLaterVideos: VideoItem[] = watchLaterPlaylist
    ? watchLaterPlaylist.videos.map((pv) => ({
        id: pv.video.youtubeId,
        title: pv.video.title,
        description: pv.video.description || "",
        thumbnailUrl: pv.video.thumbnailUrl || "",
        channelId: pv.video.channelId || "",
        channelTitle: pv.video.channelTitle || "",
        publishedAt: pv.video.publishedAt?.toISOString() || pv.addedAt.toISOString(),
        duration: pv.video.duration || "",
      }))
    : [];

  // 4. Fetch playlists
  const playlists = await db.playlist.findMany({
    where: { userId },
    include: {
      _count: { select: { videos: true } },
      videos: {
        take: 1,
        include: { video: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-10">
      {/* Title */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
        <Library className="h-6 w-6 text-primary fill-primary/10" />
        <h1 className="font-display font-bold text-2xl text-foreground">
          Library Hub
        </h1>
      </div>

      {/* Grid segments */}
      <div className="space-y-10">
        {/* History segment */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/library/history" className="flex items-center gap-2 font-display font-bold text-lg hover:text-primary transition-colors">
              <History className="h-4.5 w-4.5 text-primary" />
              <span>Recent History</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {historyVideos.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted/20 border border-border/30 rounded-2xl p-6 text-center">
              No watch history found. Start playing some videos!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {historyVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>

        {/* Watch Later segment */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/library/watch-later" className="flex items-center gap-2 font-display font-bold text-lg hover:text-primary transition-colors">
              <Clock className="h-4.5 w-4.5 text-primary" />
              <span>Watch Later</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {watchLaterVideos.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted/20 border border-border/30 rounded-2xl p-6 text-center">
              No saved videos. Save items to watch later during play.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {watchLaterVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>

        {/* Favorites segment */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/library/favorites" className="flex items-center gap-2 font-display font-bold text-lg hover:text-primary transition-colors">
              <Heart className="h-4.5 w-4.5 text-primary" />
              <span>Favorites</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {favoriteVideos.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted/20 border border-border/30 rounded-2xl p-6 text-center">
              No favorited videos yet. Click the Like button while streaming.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favoriteVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>

        {/* Playlists segment */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-display font-bold text-lg text-foreground">
              <ListVideo className="h-4.5 w-4.5 text-primary" />
              <span>Your Playlists</span>
            </div>
            <CreatePlaylistDialog />
          </div>
          {playlists.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted/20 border border-border/30 rounded-2xl p-6 text-center">
              No custom playlists yet. Create one to organize content!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
