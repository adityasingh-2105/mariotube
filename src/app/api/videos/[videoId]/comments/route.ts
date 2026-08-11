import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/api-utils";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1).max(500),
  parentId: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    const comments = await db.comment.findMany({
      where: {
        videoId,
        parentId: null, // Only fetch top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse({ comments });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to load comments", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.id) {
      return errorResponse("Unauthorized", 401);
    }

    const { videoId } = await params;
    const body = await req.json();
    const validated = commentSchema.parse(body);

    // Verify if Video exists in our local database first.
    // If not, upsert it so foreign key constraint does not fail.
    let video = await db.video.findUnique({
      where: { youtubeId: videoId },
    });

    if (!video) {
      video = await db.video.create({
        data: {
          youtubeId: videoId,
          title: "Unknown Video",
          description: "",
          thumbnailUrl: "",
        },
      });
    }

    const comment = await db.comment.create({
      data: {
        content: validated.content,
        videoId: video.id,
        userId: user.id,
        parentId: validated.parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return successResponse({ comment }, 210);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to post comment", 500);
  }
}
