'use client';

import { type VideoItem } from "@/lib/youtube-types";
import { VideoCard } from "./video-card";
import { VideoSkeleton } from "./video-skeleton";
import { motion } from "framer-motion";

interface VideoGridProps {
  videos: VideoItem[];
  isLoading?: boolean;
  skeletonCount?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function VideoGrid({
  videos,
  isLoading = false,
  skeletonCount = 12,
}: VideoGridProps) {
  // Deduplicate videos by ID to prevent duplicate key rendering crashes
  const uniqueVideos = Array.from(new Map(videos.map(v => [v.id, v])).values());

  if (isLoading && uniqueVideos.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <VideoSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8"
    >
      {uniqueVideos.map((video) => (
        <motion.div key={video.id} variants={itemVariants}>
          <VideoCard video={video} />
        </motion.div>
      ))}
      
      {/* Skeleton cards appended at the bottom while loading pagination */}
      {isLoading &&
        Array.from({ length: 4 }).map((_, index) => (
          <VideoSkeleton key={`load-more-${index}`} />
        ))}
    </motion.div>
  );
}
