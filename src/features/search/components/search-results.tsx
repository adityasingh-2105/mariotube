'use client';

import { useEffect } from "react";
import { useSearchVideos } from "@/features/videos/hooks/use-search-videos";
import { VideoCard } from "@/features/videos/components/video-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { EmptyState } from "@/components/empty-state";
import { Search } from "lucide-react";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchVideos(query);

  // Automatically track search query into database
  useEffect(() => {
    if (query && query.trim()) {
      fetch("/api/user/choices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search",
          query: query.trim(),
          tag: query.trim(),
        }),
      }).catch(() => {});
    }
  }, [query]);

  const videos = data?.pages.flatMap((page) => page.data?.videos || []) || [];
  
  // Deduplicate video keys
  const uniqueVideos = Array.from(new Map(videos.map(v => [v.id, v])).values());

  if (isError) {
    return (
      <div className="text-center py-12 text-sm text-destructive">
        Error occurred while loading search results. Please try again.
      </div>
    );
  }

  if (!isLoading && uniqueVideos.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No results found"
        description={`We couldn't find any videos matching "${query}". Try different keywords.`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground px-1 font-medium">
        Search results for <span className="text-foreground font-semibold">"{query}"</span>
      </div>

      <InfiniteScroll
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      >
        <div className="flex flex-col gap-6 max-w-5xl">
          {uniqueVideos.map((video) => (
            <VideoCard key={video.id} video={video} variant="search" />
          ))}

          {/* Pagination loading skeleton fallback */}
          {isFetchingNextPage &&
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 animate-pulse p-2.5">
                <div className="w-full sm:w-60 md:w-72 lg:w-80 aspect-video bg-muted rounded-xl" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-5 bg-muted rounded-md w-3/4" />
                  <div className="h-4 bg-muted rounded-md w-1/4" />
                  <div className="h-8 bg-muted rounded-md w-1/3 my-2" />
                  <div className="h-4 bg-muted rounded-md w-1/2" />
                </div>
              </div>
            ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
