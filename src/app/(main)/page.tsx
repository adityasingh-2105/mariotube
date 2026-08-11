'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRecommendations } from "@/features/videos/hooks/use-recommendations";
import { CategoryChips } from "@/components/category-chips";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Flame } from "lucide-react";

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/youtube/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour stale
  });

  const categories = categoriesData?.data?.categories || [];

  // Fetch videos
  const {
    data: videosData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecommendations("US", selectedCategoryId);

  const videos = videosData?.pages.flatMap((page) => page.data?.videos || []) || [];
  const isPersonalized = videosData?.pages[0]?.data?.isPersonalized || false;

  const selectedCategoryName = categories.find((c: any) => c.id === selectedCategoryId)?.title;

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <CategoryChips
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      {/* Header section */}
      <div className="flex items-center gap-3 pb-1">
        <Flame className="h-6 w-6 text-primary fill-primary" />
        <h2 className="font-display font-bold text-2xl text-foreground">
          {selectedCategoryName ? `${selectedCategoryName} Videos` : "Recommended Content"}
        </h2>
        {selectedCategoryName ? (
          <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
            {selectedCategoryName}
          </span>
        ) : isPersonalized ? (
          <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
            Personalized ✨
          </span>
        ) : (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">
            Trending 🔥
          </span>
        )}
      </div>

      {/* Video list */}
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
