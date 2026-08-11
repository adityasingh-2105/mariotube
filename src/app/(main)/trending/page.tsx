'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTrendingVideos } from "@/features/videos/hooks/use-trending-videos";
import { CategoryChips } from "@/components/category-chips";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Globe } from "lucide-react";

const REGIONS = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "BR", name: "Brazil" },
];

export default function TrendingPage() {
  const [regionCode, setRegionCode] = useState("US");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/youtube/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    staleTime: 60 * 60 * 1000,
  });

  const categories = categoriesData?.data?.categories || [];

  // Fetch videos
  const {
    data: videosData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTrendingVideos(regionCode, categoryId);

  const videos = videosData?.pages.flatMap((page) => page.data?.videos || []) || [];

  return (
    <div className="space-y-6">
      {/* Header section with region select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="h-6 w-6 text-primary fill-primary/10" />
          <h1 className="font-display font-bold text-2xl text-foreground">
            Trending Videos
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="h-4.5 w-4.5 text-muted-foreground" />
          <Select value={regionCode} onValueChange={(val) => { if (val) setRegionCode(val); }}>
            <SelectTrigger className="w-[180px] h-9 rounded-xl text-xs font-semibold">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {REGIONS.map((r) => (
                <SelectItem key={r.code} value={r.code} className="text-xs font-medium rounded-lg">
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Pills */}
      <CategoryChips
        categories={categories}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />

      {/* Recommended grid */}
      <InfiniteScroll
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      >
        <VideoGrid videos={videos} isLoading={isLoading} />
      </InfiniteScroll>
    </div>
  );
}
