import { FavoritesGrid } from "@/features/library/components/favorites-grid";
import { Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorites",
};

export default function FavoritesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
        <Heart className="h-6 w-6 text-primary fill-rose-500/10" />
        <h1 className="font-display font-bold text-2xl text-foreground">
          Favorites
        </h1>
      </div>

      <FavoritesGrid />
    </div>
  );
}
