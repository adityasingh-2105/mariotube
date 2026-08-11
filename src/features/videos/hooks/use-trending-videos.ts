import { useInfiniteQuery } from "@tanstack/react-query";
import type { VideoItem } from "@/lib/youtube-types";

interface TrendingResponse {
  success: boolean;
  data: {
    videos: VideoItem[];
    nextPageToken?: string;
  };
}

export function useTrendingVideos(regionCode = "US", categoryId?: string) {
  return useInfiniteQuery<TrendingResponse>({
    queryKey: ["trending", regionCode, categoryId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        regionCode,
        maxResults: "12",
      });
      if (categoryId) params.set("categoryId", categoryId);
      if (pageParam) params.set("pageToken", pageParam as string);
      
      const res = await fetch(`/api/youtube/trending?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch trending videos");
      return res.json();
    },
    initialPageParam: "" as string,
    getNextPageParam: (lastPage) => lastPage.data?.nextPageToken ?? undefined,
    staleTime: 15 * 60 * 1000, // 15 mins cache
  });
}
