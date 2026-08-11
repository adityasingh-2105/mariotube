'use client';

import { useState } from "react";
import { type VideoItem } from "@/lib/youtube-types";
import { formatViewCount, formatRelativeTime } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SubscribeButton } from "@/features/channels/components/subscribe-button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoInfoProps {
  video: VideoItem;
}

export function VideoInfo({ video }: { video: VideoInfoProps["video"] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const initials = video.channelTitle ? video.channelTitle.charAt(0).toUpperCase() : "C";

  return (
    <>
      {video.description && (
        <div className="rounded-2xl bg-secondary/35 p-4 border border-border/30 hover:bg-secondary/50 transition-colors duration-200">
          <div className="flex flex-wrap items-center gap-1.5 font-bold text-sm text-foreground mb-2">
            {video.viewCount && (
              <span>{formatViewCount(video.viewCount)} views</span>
            )}
            <span>•</span>
            <span>{formatRelativeTime(video.publishedAt)}</span>
          </div>

          <motion.div
            animate={{ height: isExpanded ? "auto" : "72px" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="relative overflow-hidden text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap"
          >
            {video.description}
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            )}
          </motion.div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1 mt-2 h-7 text-xs font-semibold text-foreground hover:bg-transparent"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
