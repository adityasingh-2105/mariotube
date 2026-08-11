import { db } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser, withErrorHandling } from "@/lib/api-utils";
import { z } from "zod";

const subscribeSchema = z.object({
  channelYoutubeId: z.string().min(1),
  channelTitle: z.string().optional(),
  channelThumbnail: z.string().url().optional(),
});

export const GET = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const subscriptions = await db.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return successResponse({ subscriptions });
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const body = await req.json();
  const validated = subscribeSchema.parse(body);

  const subscription = await db.subscription.upsert({
    where: {
      userId_channelYoutubeId: {
        userId,
        channelYoutubeId: validated.channelYoutubeId,
      },
    },
    update: {
      channelTitle: validated.channelTitle,
      channelThumbnail: validated.channelThumbnail,
    },
    create: {
      userId,
      channelYoutubeId: validated.channelYoutubeId,
      channelTitle: validated.channelTitle,
      channelThumbnail: validated.channelThumbnail,
    },
  });

  return successResponse({ subscription });
});

export const DELETE = withErrorHandling(async (req: Request) => {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);
  const userId = user.id as string;

  const { searchParams } = new URL(req.url);
  const channelYoutubeId = searchParams.get("channelYoutubeId");

  if (!channelYoutubeId) {
    const body = await req.json().catch(() => ({}));
    const validated = z.object({ channelYoutubeId: z.string().min(1) }).parse(body);
    
    await db.subscription.delete({
      where: {
        userId_channelYoutubeId: {
          userId,
          channelYoutubeId: validated.channelYoutubeId,
        },
      },
    });
    return successResponse({ message: "Unsubscribed successfully" });
  }

  await db.subscription.delete({
    where: {
      userId_channelYoutubeId: {
        userId,
        channelYoutubeId,
      },
    },
  });

  return successResponse({ message: "Unsubscribed successfully" });
});
