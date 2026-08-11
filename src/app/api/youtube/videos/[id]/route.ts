import { type NextRequest } from "next/server";
import { getVideoDetails, normalizeVideo } from "@/lib/youtube";
import { successResponse, errorResponse, withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const response = await getVideoDetails(id);
    
    if (!response.items || response.items.length === 0) {
      return errorResponse("Video not found", 404);
    }

    const video = normalizeVideo(response.items[0]);
    return successResponse({ video });
  }
);
