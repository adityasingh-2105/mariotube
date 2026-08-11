import { useInfiniteQuery } from "@tanstack/react-query";
import type { VideoItem } from "@/lib/youtube-types";

interface SearchResponse {
  success: boolean;
  data: {
    videos: VideoItem[];
    nextPageToken?: string;
  };
}

export function useSearchVideos(query: string) {
  return useInfiniteQuery<SearchResponse>({
    queryKey: ["search", query],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        q: query,
        maxResults: "12",
      });
      if (pageParam) params.set("pageToken", pageParam as string);
      
      const res = await fetch(`/api/youtube/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch search results");
      return res.json();
    },
    initialPageParam: "" as string,
    getNextPageParam: (lastPage) => lastPage.data?.nextPageToken ?? undefined,
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 mins cache
  });
}
