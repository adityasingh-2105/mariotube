import { useInfiniteQuery } from "@tanstack/react-query";
import type { VideoItem } from "@/lib/youtube-types";

interface RecommendationsResponse {
  success: boolean;
  data: {
    videos: VideoItem[];
    nextPageToken?: string;
    isPersonalized: boolean;
    seedKeyword?: string;
  };
}

export function useRecommendations(regionCode = "US", categoryId?: string) {
  return useInfiniteQuery<RecommendationsResponse>({
    queryKey: ["recommendations", regionCode, categoryId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ regionCode });
      if (categoryId) params.set("categoryId", categoryId);
      if (pageParam) params.set("pageToken", pageParam as string);
      
      const res = await fetch(`/api/youtube/recommendations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
    initialPageParam: "" as string,
    getNextPageParam: (lastPage) => lastPage.data?.nextPageToken ?? undefined,
    staleTime: 30 * 1000, // 30s freshness allows new recommendations on refresh
    refetchOnWindowFocus: false,
  });
}
