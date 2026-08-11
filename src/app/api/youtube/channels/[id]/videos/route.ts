import { getChannelVideos, normalizeSearchResult } from "@/lib/youtube";
import { successResponse, withErrorHandling, validateSearchParams } from "@/lib/api-utils";
import { z } from "zod";

const schema = z.object({
  pageToken: z.string().optional(),
  maxResults: z.coerce.number().min(1).max(50).default(12),
});

export const GET = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const validated = validateSearchParams(searchParams, schema);

    const response = await getChannelVideos(id, validated.pageToken, validated.maxResults);
    const videos = response.items.map(normalizeSearchResult);

    return successResponse({
      videos,
      nextPageToken: response.nextPageToken,
    });
  }
);
