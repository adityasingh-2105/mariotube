import { db } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser, withErrorHandling } from "@/lib/api-utils";
import { z } from "zod";

const historySchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1),
  thumbnailUrl: z.string().url().optional(),
  channelTitle: z.string().optional(),
  channelId: z.string().optional(),
  duration: z.string().optional(),
  watchDuration: z.number().optional(),
});

export const GET = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const take = parseInt(searchParams.get("take") || "24", 10);

  const history = await db.watchHistory.findMany({
    where: { userId },
    include: {
      video: true,
    },
    orderBy: { watchedAt: "desc" },
    skip,
    take,
  });

  return successResponse({ history });
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const body = await req.json();
  const validated = historySchema.parse(body);

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

  const historyEntry = await db.watchHistory.create({
    data: {
      userId,
      videoId: video.id,
      watchDuration: validated.watchDuration,
      completed: false, // Default
    },
  });

  return successResponse({ historyEntry });
});

export const DELETE = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  await db.watchHistory.deleteMany({
    where: { userId },
  });

  return successResponse({ message: "Watch history cleared" });
});
