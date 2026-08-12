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

  // Primary search with the exact query
  let response = await searchVideos(validated.q, validated.pageToken, validated.maxResults);
  let videos = response.items.map(normalizeSearchResult);

  // Fuzzy fallback: if no results or very few results, try individual words
  if (videos.length < 3 && !validated.pageToken) {
    const words = validated.q
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 3); // Take first 3 meaningful words

    if (words.length > 0 && words.length < validated.q.split(/\s+/).length) {
      // Try with just the key words joined
      const fuzzyQuery = words.join(" ");
      try {
        const fuzzyResponse = await searchVideos(fuzzyQuery, undefined, validated.maxResults);
        const fuzzyVideos = fuzzyResponse.items.map(normalizeSearchResult);

        // Merge: keep original results first, add non-duplicate fuzzy results
        const existingIds = new Set(videos.map((v) => v.id));
        const additionalVideos = fuzzyVideos.filter((v) => !existingIds.has(v.id));
        videos = [...videos, ...additionalVideos].slice(0, validated.maxResults);
      } catch {
        // Fuzzy search failed, return whatever we have
      }
    }
  }

  return successResponse({
    videos,
    nextPageToken: response.nextPageToken,
    query: validated.q,
  });
});
