import { db } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser, withErrorHandling } from "@/lib/api-utils";
import { z } from "zod";

const createPlaylistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
});

export const GET = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const playlists = await db.playlist.findMany({
    where: { userId },
    include: {
      _count: {
        select: { videos: true },
      },
      videos: {
        take: 1,
        include: {
          video: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return successResponse({ playlists });
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const body = await req.json();
  const validated = createPlaylistSchema.parse(body);

  const playlist = await db.playlist.create({
    data: {
      name: validated.name,
      description: validated.description,
      isPublic: validated.isPublic,
      userId,
    },
  });

  return successResponse({ playlist });
});
