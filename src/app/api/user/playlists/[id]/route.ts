import { db } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser, withErrorHandling } from "@/lib/api-utils";
import { z } from "zod";

const updatePlaylistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

export const GET = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const playlist = await db.playlist.findUnique({
      where: { id },
      include: {
        videos: {
          include: {
            video: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!playlist) {
      return errorResponse("Playlist not found", 404);
    }

    if (playlist.userId !== user.id && !playlist.isPublic) {
      return errorResponse("Unauthorized", 403);
    }

    return successResponse({ playlist });
  }
);

export const PATCH = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const playlist = await db.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      return errorResponse("Playlist not found", 404);
    }

    if (playlist.userId !== user.id) {
      return errorResponse("Unauthorized", 403);
    }

    const body = await req.json();
    const validated = updatePlaylistSchema.parse(body);

    const updated = await db.playlist.update({
      where: { id },
      data: validated,
    });

    return successResponse({ playlist: updated });
  }
);

export const DELETE = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const playlist = await db.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      return errorResponse("Playlist not found", 404);
    }

    if (playlist.userId !== user.id) {
      return errorResponse("Unauthorized", 403);
    }

    if (playlist.isSystem) {
      return errorResponse("Cannot delete system playlists", 400);
    }

    await db.playlist.delete({
      where: { id },
    });

    return successResponse({ message: "Playlist deleted" });
  }
);
