'use client';

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { type VideoItem } from "@/lib/youtube-types";

interface WatchTrackerProps {
  videoData: VideoItem;
}

export function WatchTracker({ videoData }: WatchTrackerProps) {
  const { data: session } = useSession();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    // If not authenticated or already tracked this videoId on this mount, skip
    if (!session || trackedRef.current === videoData.id) return;

    const logHistory = async () => {
      try {
        trackedRef.current = videoData.id;
        await fetch("/api/user/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: videoData.id,
            title: videoData.title,
            thumbnailUrl: videoData.thumbnailUrl,
            channelTitle: videoData.channelTitle,
            channelId: videoData.channelId,
            duration: videoData.duration,
            watchDuration: 0, // Placeholder
          }),
        });
      } catch (error) {
        console.error("Failed to log watch history:", error);
      }
    };

    logHistory();
  }, [videoData, session]);

  return null;
}
