import { searchVideos, normalizeSearchResult } from "@/lib/youtube";
import { successResponse, withErrorHandling, validateSearchParams } from "@/lib/api-utils";
import { z } from "zod";

const schema = z.object({
  q: z.string().min(1),
  pageToken: z.string().optional(),
  maxResults: z.coerce.number().min(1).max(50).default(12),
});

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const validated = validateSearchParams(searchParams, schema);

  const response = await searchVideos(validated.q, validated.pageToken, validated.maxResults);
  const videos = response.items.map(normalizeSearchResult);

  return successResponse({
    videos,
    nextPageToken: response.nextPageToken,
  });
});
