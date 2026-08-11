import { db } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser, withErrorHandling } from "@/lib/api-utils";
import { z } from "zod";

const watchLaterSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1).optional(),
  thumbnailUrl: z.string().url().optional(),
  channelTitle: z.string().optional(),
  channelId: z.string().optional(),
  duration: z.string().optional(),
});

async function getOrCreateWatchLaterPlaylist(userId: string) {
  let playlist = await db.playlist.findFirst({
    where: {
      userId,
      isSystem: true,
      systemType: "watch-later",
    },
  });

  if (!playlist) {
    playlist = await db.playlist.create({
      data: {
        name: "Watch Later",
        description: "Videos saved to watch later",
        isPublic: false,
        isSystem: true,
        systemType: "watch-later",
        userId,
      },
    });
  }

  return playlist;
}

export const GET = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const playlist = await getOrCreateWatchLaterPlaylist(userId);

  const playlistWithVideos = await db.playlist.findUnique({
    where: { id: playlist.id },
    include: {
      videos: {
        include: {
          video: true,
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  const videos = playlistWithVideos ? playlistWithVideos.videos.map((pv) => pv.video) : [];
  return successResponse({ videos });
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const body = await req.json();
  const validated = watchLaterSchema.parse(body);

  if (!validated.title) {
    return errorResponse("Title is required", 400);
  }

  const playlist = await getOrCreateWatchLaterPlaylist(userId);

  // Upsert video metadata
  const video = await db.video.upsert({
    where: { youtubeId: validated.videoId },
    update: {
      title: validated.title,
      thumbnailUrl: validated.thumbnailUrl,
      channelTitle: validated.channelTitle,
      channelId: validated.channelId,
      duration: validated.duration,
    },
    create: {
      youtubeId: validated.videoId,
      title: validated.title,
      thumbnailUrl: validated.thumbnailUrl,
      channelTitle: validated.channelTitle,
      channelId: validated.channelId,
      duration: validated.duration,
    },
  });

  // Add to Watch Later
  await db.playlistVideo.upsert({
    where: {
      playlistId_videoId: {
        playlistId: playlist.id,
        videoId: video.id,
      },
    },
    update: {},
    create: {
      playlistId: playlist.id,
      videoId: video.id,
      position: 0,
    },
  });

  return successResponse({ message: "Added to Watch Later" });
});

export const DELETE = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const { searchParams } = new URL(req.url);
  let videoId = searchParams.get("videoId");

  if (!videoId) {
    const body = await req.json().catch(() => ({}));
    const validated = z.object({ videoId: z.string().min(1) }).parse(body);
    videoId = validated.videoId;
  }

  const playlist = await getOrCreateWatchLaterPlaylist(userId);
  const video = await db.video.findUnique({
    where: { youtubeId: videoId },
  });

  if (!video) {
    return errorResponse("Video not found", 404);
  }

  await db.playlistVideo.delete({
    where: {
      playlistId_videoId: {
        playlistId: playlist.id,
        videoId: video.id,
      },
    },
  });

  return successResponse({ message: "Removed from Watch Later" });
});
