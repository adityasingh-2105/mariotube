import { WatchHistory } from "@/features/library/components/watch-history";
import { History } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watch History",
};

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
        <History className="h-6 w-6 text-primary fill-primary/10" />
        <h1 className="font-display font-bold text-2xl text-foreground">
          Watch History
        </h1>
      </div>

      <WatchHistory />
    </div>
  );
}
