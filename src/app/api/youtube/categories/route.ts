import { type NextRequest } from "next/server";
import { getVideoCategories, normalizeCategory } from "@/lib/youtube";
import { successResponse, withErrorHandling, validateSearchParams } from "@/lib/api-utils";
import { z } from "zod";

const schema = z.object({
  regionCode: z.string().default("US"),
});

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const validated = validateSearchParams(searchParams, schema);

  const response = await getVideoCategories(validated.regionCode);
  const categories = response.items
    .filter((item) => item.snippet.assignable)
    .map(normalizeCategory);

  return successResponse({ categories });
});
