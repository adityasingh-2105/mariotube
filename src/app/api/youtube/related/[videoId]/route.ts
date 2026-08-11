import { type NextRequest } from "next/server";
import { getRelatedVideos, normalizeSearchResult } from "@/lib/youtube";
import { successResponse, withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ videoId: string }> }) => {
    const { videoId } = await params;
    const response = await getRelatedVideos(videoId);
    
    // Filter out items that are not videos or have missing IDs
    const videos = response.items
      .filter((item) => item.id && item.id.videoId)
      .map(normalizeSearchResult);

    return successResponse({ videos });
  }
);
