import { db } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser, withErrorHandling } from "@/lib/api-utils";
import { z } from "zod";

const addVideoSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1),
  thumbnailUrl: z.string().url().optional(),
  channelTitle: z.string().optional(),
  channelId: z.string().optional(),
  duration: z.string().optional(),
});

const removeVideoSchema = z.object({
  videoId: z.string().min(1),
});

export const POST = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id: playlistId } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const playlist = await db.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return errorResponse("Playlist not found", 404);
    }

    if (playlist.userId !== user.id) {
      return errorResponse("Unauthorized", 403);
    }

    const body = await req.json();
    const validated = addVideoSchema.parse(body);

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

    // Get max position in playlist
    const maxPositionVideo = await db.playlistVideo.findFirst({
      where: { playlistId },
      orderBy: { position: "desc" },
    });
    const nextPosition = maxPositionVideo ? maxPositionVideo.position + 1 : 0;

    // Add to playlist
    const playlistVideo = await db.playlistVideo.upsert({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId: video.id,
        },
      },
      update: {},
      create: {
        playlistId,
        videoId: video.id,
        position: nextPosition,
      },
    });

    return successResponse({ playlistVideo });
  }
);

export const DELETE = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id: playlistId } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const playlist = await db.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return errorResponse("Playlist not found", 404);
    }

    if (playlist.userId !== user.id) {
      return errorResponse("Unauthorized", 403);
    }

    const body = await req.json();
    const validated = removeVideoSchema.parse(body);

    const video = await db.video.findUnique({
      where: { youtubeId: validated.videoId },
    });

    if (!video) {
      return errorResponse("Video not found in database", 404);
    }

    await db.playlistVideo.delete({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId: video.id,
        },
      },
    });

    return successResponse({ message: "Video removed from playlist" });
  }
);
