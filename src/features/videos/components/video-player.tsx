'use client';

import { useState } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoId: string;
  onEnd?: () => void;
  autoplay?: boolean;
}

export function VideoPlayer({ videoId, onEnd, autoplay = true }: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: autoplay ? 1 : 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      origin: typeof window !== "undefined" ? window.location.origin : "",
    },
  };

  const handleReady = (event: YouTubeEvent) => {
    setIsReady(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsReady(false);
  };

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl hover-glow border border-border/50">
      {/* Skeleton loading preview */}
      {!isReady && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 px-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-white mb-2">Playback Error</h3>
          <p className="text-sm text-zinc-400 max-w-sm mb-6">
            The video could not be loaded. This might be due to restriction policies or network issues.
          </p>
          <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {!hasError && (
        <div className="w-full h-full aspect-video">
          <YouTube
            videoId={videoId}
            className="w-full h-full"
            opts={opts}
            onReady={handleReady}
            onEnd={onEnd}
            onError={handleError}
          />
        </div>
      )}
    </div>
  );
}
