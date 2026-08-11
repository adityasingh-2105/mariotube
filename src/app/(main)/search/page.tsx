import { SearchResults } from "@/features/search/components/search-results";
import { EmptyState } from "@/components/empty-state";
import { Search } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for "${q}"` : "Search",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: query } = await searchParams;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {query ? (
        <SearchResults query={query} />
      ) : (
        <EmptyState
          icon={Search}
          title="Search MarioTube"
          description="Search for videos, topics, creators, or playlists using keywords."
        />
      )}
    </div>
  );
}
