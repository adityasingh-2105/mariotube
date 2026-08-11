import { db } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser, withErrorHandling } from "@/lib/api-utils";
import { z } from "zod";

const favoriteSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1).optional(),
  thumbnailUrl: z.string().url().optional(),
  channelTitle: z.string().optional(),
  channelId: z.string().optional(),
  duration: z.string().optional(),
});

export const GET = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const take = parseInt(searchParams.get("take") || "24", 10);

  const favorites = await db.favorite.findMany({
    where: { userId },
    include: {
      video: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  return successResponse({ favorites: favorites.map((f) => f.video) });
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const body = await req.json();
  const validated = favoriteSchema.parse(body);

  if (!validated.title) {
    return errorResponse("Title is required for adding favorite", 400);
  }

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

  const favorite = await db.favorite.upsert({
    where: {
      userId_videoId: {
        userId,
        videoId: video.id,
      },
    },
    update: {},
    create: {
      userId,
      videoId: video.id,
    },
  });

  return successResponse({ favorite });
});

export const DELETE = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  
  if (!videoId) {
    // Fallback to body read if not in searchParams
    const body = await req.json().catch(() => ({}));
    const validated = z.object({ videoId: z.string().min(1) }).parse(body);
    const video = await db.video.findUnique({
      where: { youtubeId: validated.videoId },
    });
    if (!video) return errorResponse("Video not found", 404);
    await db.favorite.delete({
      where: {
        userId_videoId: {
          userId,
          videoId: video.id,
        },
      },
    });
    return successResponse({ message: "Favorite removed" });
  }

  const video = await db.video.findUnique({
    where: { youtubeId: videoId },
  });

  if (!video) {
    return errorResponse("Video not found", 404);
  }

  await db.favorite.delete({
    where: {
      userId_videoId: {
        userId,
        videoId: video.id,
      },
    },
  });

  return successResponse({ message: "Favorite removed" });
});
