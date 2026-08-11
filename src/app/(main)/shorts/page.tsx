'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Loader2,
  Sparkles,
  Music2,
} from "lucide-react";
import { CommentsSection } from "@/features/videos/components/comments-section";
import { toast } from "sonner";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { useSession } from "next-auth/react";

interface ShortItem {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl?: string;
  likes: string;
  comments: string;
}

export default function ShortsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayHud, setShowPlayHud] = useState<"play" | "pause" | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});
  const [dislikedShorts, setDislikedShorts] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activePlayerRef = useRef<any>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  // 1. Fetch Shorts with Infinite Scroll & Random Rotation
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["infinite-shorts"],
    queryFn: async ({ pageParam = "" }) => {
      const res = await fetch(`/api/youtube/shorts?pageToken=${pageParam}&maxResults=10`);
      if (!res.ok) throw new Error("Failed to fetch shorts");
      return res.json();
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage?.data?.nextPageToken ?? undefined,
    staleTime: 2 * 60 * 1000,
  });

  const allShorts: ShortItem[] =
    data?.pages.flatMap((page) => page?.data?.shorts || []) || [];

  // Deduplicate shorts list
  const uniqueShorts = Array.from(
    new Map(allShorts.map((s) => [s.id, s])).values()
  );

  // 2. Like Mutation (Syncs with user DB Favorites to personalize recommendation engine)
  const likeMutation = useMutation({
    mutationFn: async ({ short, isLiked }: { short: ShortItem; isLiked: boolean }) => {
      if (!session) return;
      if (isLiked) {
        // Remove like
        await fetch(`/api/user/favorites?videoId=${short.id}`, { method: "DELETE" });
      } else {
        // Add like
        await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: short.id,
            title: short.title,
            channelTitle: short.channelTitle,
            channelId: short.channelId,
            thumbnailUrl: short.thumbnailUrl || "",
          }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });

  // 3. Track Watch Duration (>6s recorded as positive watch signal in SQLite)
  const recordWatchHistory = useCallback(
    (short: ShortItem) => {
      if (!session) return;
      fetch("/api/user/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: short.id,
          title: short.title,
          channelTitle: short.channelTitle,
          channelId: short.channelId,
          thumbnailUrl: short.thumbnailUrl || "",
          watchDuration: "PT30S",
        }),
      }).catch(() => {});
    },
    [session]
  );

  // Start watch tracking timer when active short changes
  useEffect(() => {
    if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    const currentShort = uniqueShorts[activeIndex];
    if (currentShort && isPlaying) {
      watchTimerRef.current = setTimeout(() => {
        recordWatchHistory(currentShort);
      }, 6000);
    }
    return () => {
      if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    };
  }, [activeIndex, isPlaying, uniqueShorts, recordWatchHistory]);

  // 4. Scroll to Index helper with smooth trackpad/wheel snap
  const scrollToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= uniqueShorts.length) return;
      const targetElement = itemRefs.current[index];
      if (targetElement && containerRef.current) {
        isScrollingRef.current = true;
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setActiveIndex(index);
        setIsPlaying(true);
        setShowComments(false);
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      }
    },
    [uniqueShorts.length]
  );

  // 5. Native Mouse Wheel & Trackpad Snap Controller
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let wheelTimeout: NodeJS.Timeout | null = null;
    let accumulatedDelta = 0;

    const handleWheel = (e: WheelEvent) => {
      // Allow standard trackpad pinch or slow scroll, but snap cleanly on decisive wheel movement
      accumulatedDelta += e.deltaY;

      if (wheelTimeout) clearTimeout(wheelTimeout);

      wheelTimeout = setTimeout(() => {
        if (Math.abs(accumulatedDelta) > 40) {
          if (accumulatedDelta > 0) {
            // Scroll down
            scrollToIndex(activeIndex + 1);
          } else {
            // Scroll up
            scrollToIndex(activeIndex - 1);
          }
        }
        accumulatedDelta = 0;
      }, 60);
    };

    container.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [activeIndex, scrollToIndex]);

  // 6. Keyboard navigation (Arrow Up, Arrow Down, Spacebar, M for mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "m" || e.key === "M") {
        setIsMuted((prev) => !prev);
        toast.info(isMuted ? "Sound Unmuted" : "Sound Muted", { duration: 1000 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, isMuted, scrollToIndex]);

  // 7. Auto-fetch next page when reaching near the end
  useEffect(() => {
    if (
      activeIndex >= uniqueShorts.length - 2 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [activeIndex, uniqueShorts.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 8. Like / Dislike handlers
  const handleLike = (short: ShortItem) => {
    const isCurrentlyLiked = !!likedShorts[short.id];
    setLikedShorts((prev) => ({ ...prev, [short.id]: !isCurrentlyLiked }));
    setDislikedShorts((prev) => ({ ...prev, [short.id]: false }));

    likeMutation.mutate({ short, isLiked: isCurrentlyLiked });

    if (!isCurrentlyLiked) {
      toast.success("Liked! Recommendation algorithm will suggest more like this ✨", {
        duration: 2500,
      });
    }
  };

  const handleDislike = (shortId: string) => {
    const isCurrentlyDisliked = !!dislikedShorts[shortId];
    setDislikedShorts((prev) => ({ ...prev, [shortId]: !isCurrentlyDisliked }));
    setLikedShorts((prev) => ({ ...prev, [shortId]: false }));
  };

  const handleShare = (shortId: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/watch/${shortId}`);
      toast.success("Short link copied to clipboard!");
    }
  };

  const togglePlayPause = () => {
    if (activePlayerRef.current) {
      if (isPlaying) {
        activePlayerRef.current.pauseVideo();
        setIsPlaying(false);
        setShowPlayHud("pause");
      } else {
        activePlayerRef.current.playVideo();
        setIsPlaying(true);
        setShowPlayHud("play");
      }
      setTimeout(() => setShowPlayHud(null), 700);
    }
  };

  if (isLoading && uniqueShorts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-sm font-semibold text-muted-foreground mt-3">
          Loading fresh personalized Shorts...
        </span>
      </div>
    );
  }

  const activeShort = uniqueShorts[activeIndex] || uniqueShorts[0];

  return (
    <div className="relative flex justify-center items-center w-full h-[calc(100vh-4.5rem)] overflow-hidden select-none">
      
      {/* Quick Jump Keyboard / Mouse Wheel Navigation Controls */}
      <div className="hidden lg:flex flex-col gap-2 absolute right-6 top-1/2 -translate-y-1/2 z-30">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="h-10 w-10 rounded-full shadow-lg hover:bg-muted"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex >= uniqueShorts.length - 1}
          className="h-10 w-10 rounded-full shadow-lg hover:bg-muted"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Snap Scroll Container */}
      <div
        ref={containerRef}
        className="w-full max-w-[440px] h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar flex flex-col items-center py-2 space-y-6"
      >
        {uniqueShorts.map((short, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={`${short.id}-${index}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="snap-center shrink-0 relative w-full h-[calc(100vh-5.5rem)] min-h-[580px] max-h-[820px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-border/40 group flex"
            >
              {/* Click-to-play Video Box */}
              <div
                className="relative w-full h-full cursor-pointer"
                onClick={togglePlayPause}
              >
                {/* Active YouTube Iframe */}
                {isActive ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    <YouTube
                      videoId={short.id}
                      opts={{
                        height: "100%",
                        width: "100%",
                        playerVars: {
                          autoplay: 1,
                          controls: 0,
                          loop: 1,
                          playlist: short.id,
                          modestbranding: 1,
                          rel: 0,
                          playsinline: 1,
                          origin: typeof window !== "undefined" ? window.location.origin : "",
                        },
                      }}
                      className="w-full h-full scale-[1.35] origin-center"
                      onReady={(e: YouTubeEvent) => {
                        activePlayerRef.current = e.target;
                        if (isMuted) {
                          e.target.mute();
                        } else {
                          e.target.unMute();
                        }
                        e.target.playVideo();
                        setIsPlaying(true);
                      }}
                      onEnd={(e: YouTubeEvent) => e.target.playVideo()}
                    />
                  </div>
                ) : (
                  /* Lazy loading poster thumbnail when inactive */
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(https://i.ytimg.com/vi/${short.id}/hqdefault.jpg)`,
                    }}
                  />
                )}

                {/* Animated HUD for Play/Pause */}
                <AnimatePresence>
                  {showPlayHud && isActive && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 0.9 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                      <div className="h-16 w-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
                        {showPlayHud === "play" ? (
                          <Play className="h-8 w-8 fill-current ml-1" />
                        ) : (
                          <Pause className="h-8 w-8 fill-current" />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Top overlay shadow + Mute Toggle button */}
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-20 flex justify-between items-start p-4">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                    <span>Personalized Feed</span>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextMuted = !isMuted;
                      setIsMuted(nextMuted);
                      if (activePlayerRef.current) {
                        if (nextMuted) activePlayerRef.current.mute();
                        else activePlayerRef.current.unMute();
                      }
                    }}
                    className="h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 text-white pointer-events-auto border-none"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4.5 w-4.5 text-red-400" />
                    ) : (
                      <Volume2 className="h-4.5 w-4.5" />
                    )}
                  </Button>
                </div>

                {/* Bottom metadata details */}
                <div
                  className="absolute bottom-0 inset-x-0 right-16 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-20 space-y-2 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-white/30">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${short.channelTitle}`}
                      />
                      <AvatarFallback>{short.channelTitle[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-display font-bold text-xs truncate max-w-[130px]">
                      @{short.channelTitle}
                    </span>
                    <Button
                      size="sm"
                      className="h-7 px-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-[11px] font-bold shadow-md"
                    >
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed line-clamp-2 drop-shadow-sm">
                    {short.title}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-300">
                    <Music2 className="h-3 w-3 text-primary animate-pulse" />
                    <span className="truncate">{short.channelTitle} • Original Audio</span>
                  </div>
                </div>
              </div>

              {/* Right YouTube Shorts Action Buttons Bar */}
              <div
                className="absolute right-2 bottom-6 z-30 flex flex-col items-center gap-4 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Like Button */}
                <div className="flex flex-col items-center gap-1">
                  <Button
                    size="icon"
                    onClick={() => handleLike(short)}
                    className={`h-11 w-11 rounded-full border-none shadow-xl transition-transform active:scale-90 ${
                      likedShorts[short.id]
                        ? "bg-primary text-white scale-105"
                        : "bg-black/60 hover:bg-black/80 text-white"
                    }`}
                  >
                    <ThumbsUp
                      className={`h-5 w-5 ${
                        likedShorts[short.id] ? "fill-white" : ""
                      }`}
                    />
                  </Button>
                  <span className="text-[10px] text-white font-extrabold drop-shadow">
                    {likedShorts[short.id] ? "Liked" : short.likes}
                  </span>
                </div>

                {/* Dislike Button */}
                <div className="flex flex-col items-center gap-1">
                  <Button
                    size="icon"
                    onClick={() => handleDislike(short.id)}
                    className={`h-11 w-11 rounded-full border-none shadow-xl transition-transform active:scale-90 ${
                      dislikedShorts[short.id]
                        ? "bg-zinc-700 text-white"
                        : "bg-black/60 hover:bg-black/80 text-white"
                    }`}
                  >
                    <ThumbsDown
                      className={`h-5 w-5 ${
                        dislikedShorts[short.id] ? "fill-white" : ""
                      }`}
                    />
                  </Button>
                  <span className="text-[10px] text-white font-bold drop-shadow">
                    Dislike
                  </span>
                </div>

                {/* Comments Trigger */}
                <div className="flex flex-col items-center gap-1">
                  <Button
                    size="icon"
                    onClick={() => setShowComments(!showComments)}
                    className={`h-11 w-11 rounded-full border-none shadow-xl transition-transform active:scale-90 ${
                      showComments
                        ? "bg-primary text-white"
                        : "bg-black/60 hover:bg-black/80 text-white"
                    }`}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  <span className="text-[10px] text-white font-extrabold drop-shadow">
                    {short.comments}
                  </span>
                </div>

                {/* Share Button */}
                <div className="flex flex-col items-center gap-1">
                  <Button
                    size="icon"
                    onClick={() => handleShare(short.id)}
                    className="h-11 w-11 rounded-full bg-black/60 hover:bg-black/80 border-none text-white shadow-xl transition-transform active:scale-90"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <span className="text-[10px] text-white font-bold drop-shadow">
                    Share
                  </span>
                </div>

                {/* Rotating Vinyl Soundtrack Disk */}
                <div className="w-9 h-9 rounded-full bg-zinc-900 border-2 border-white/60 flex items-center justify-center animate-[spin_4s_linear_infinite] shadow-lg">
                  <Music2 className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading more indicator at bottom */}
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 py-4 text-muted-foreground text-xs font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading more reels...
          </div>
        )}
      </div>

      {/* Slide-out Interactive Comments Panel */}
      <AnimatePresence>
        {showComments && activeShort && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed inset-y-16 right-4 sm:right-12 w-full max-w-[380px] bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl rounded-3xl z-40 p-5 flex flex-col overflow-y-auto no-scrollbar"
          >
            <div className="flex justify-between items-center pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">Comments</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowComments(false)}
                className="h-7 px-2 text-xs rounded-full"
              >
                Close
              </Button>
            </div>
            <div className="flex-1 pt-3">
              <CommentsSection videoId={activeShort.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
