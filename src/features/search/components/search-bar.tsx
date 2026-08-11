'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto w-full items-center">
      <div className="relative flex-1">
        <Input
          type="search"
          placeholder="Search MarioTube..."
          className="h-11 px-4 pr-10 rounded-full border border-border bg-muted/30 focus-visible:ring-primary"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1 h-9 w-9 rounded-full text-muted-foreground hover:bg-transparent"
            onClick={() => setQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button type="submit" size="icon" className="h-11 w-11 rounded-full shadow-lg">
        <Search className="h-4.5 w-4.5" />
      </Button>
    </form>
  );
}
