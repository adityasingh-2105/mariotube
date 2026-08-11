'use client';

import { useRef } from "react";
import { type CategoryItem } from "@/lib/youtube-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  categories: CategoryItem[];
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
}

export function CategoryChips({
  categories,
  selectedId,
  onSelect,
}: CategoryChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full overflow-hidden pb-3 pt-1">
      <div
        ref={containerRef}
        className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth"
      >
        <Button
          variant={selectedId === undefined ? "default" : "secondary"}
          className={cn(
            "rounded-full px-4 py-1 h-8 text-xs font-medium whitespace-nowrap transition-all duration-200",
            selectedId === undefined && "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
          )}
          onClick={() => onSelect(undefined)}
        >
          All
        </Button>
        {categories.map((category) => {
          const isSelected = selectedId === category.id;
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "secondary"}
              className={cn(
                "rounded-full px-4 py-1 h-8 text-xs font-medium whitespace-nowrap transition-all duration-200",
                isSelected && "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              )}
              onClick={() => onSelect(category.id)}
            >
              {category.title}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
