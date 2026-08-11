import { getTrendingVideos, normalizeVideo } from "@/lib/youtube";
import { successResponse, withErrorHandling, validateSearchParams } from "@/lib/api-utils";
import { z } from "zod";

const schema = z.object({
  regionCode: z.string().default("US"),
  categoryId: z.string().optional(),
  pageToken: z.string().optional(),
  maxResults: z.coerce.number().min(1).max(50).default(12),
});

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const validated = validateSearchParams(searchParams, schema);

  const response = await getTrendingVideos(
    validated.regionCode,
    validated.categoryId,
    validated.pageToken,
    validated.maxResults
  );
  const videos = response.items.map(normalizeVideo);

  return successResponse({
    videos,
    nextPageToken: response.nextPageToken,
  });
});
