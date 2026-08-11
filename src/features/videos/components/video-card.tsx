'use client';

import Link from "next/link";
import Image from "next/image";
import { type VideoItem } from "@/lib/youtube-types";
import { formatViewCount, formatRelativeTime, formatDuration, getYouTubeThumbnail } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

interface VideoCardProps {
  video: VideoItem;
  variant?: "default" | "horizontal" | "search";
}

export function VideoCard({ video, variant = "default" }: VideoCardProps) {
  const thumbnail = video.thumbnailUrl || getYouTubeThumbnail(video.id);
  const initials = video.channelTitle ? video.channelTitle.charAt(0).toUpperCase() : "C";

  if (variant === "search") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group relative flex flex-col sm:flex-row gap-4 rounded-2xl overflow-hidden hover:bg-secondary/25 p-2.5 transition-colors duration-200"
      >
        <Link href={`/watch/${video.id}`} className="relative aspect-video w-full sm:w-60 md:w-72 lg:w-80 flex-shrink-0 rounded-xl overflow-hidden bg-black block">
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 320px"
          />
          {video.duration && (
            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <div className="w-12 h-12 rounded-full bg-primary/95 flex items-center justify-center text-primary-foreground shadow-lg">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>
          </div>
        </Link>
        <div className="flex flex-col flex-1 min-w-0 py-1 justify-start">
          <Link href={`/watch/${video.id}`} className="font-display font-bold text-sm sm:text-base md:text-lg line-clamp-2 leading-tight hover:text-primary transition-colors text-foreground">
            {video.title}
          </Link>
          <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            {video.viewCount ? `${formatViewCount(video.viewCount)} views • ` : ""}{formatRelativeTime(video.publishedAt)}
          </div>
          
          {/* Channel info section */}
          <div className="flex items-center gap-2 my-2.5">
            <Link href={`/channel/${video.channelId}`} className="flex-shrink-0">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link href={`/channel/${video.channelId}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate font-medium">
              {video.channelTitle}
            </Link>
          </div>

          {video.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed hidden md:block">
              {video.description}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === "horizontal") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group relative flex gap-3 rounded-xl overflow-hidden hover:bg-muted/50 p-1.5 transition-colors duration-200"
      >
        <Link href={`/watch/${video.id}`} className="relative aspect-video w-36 sm:w-40 md:w-44 flex-shrink-0 rounded-lg overflow-hidden bg-black">
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 150px, 200px"
          />
          {video.duration && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-semibold px-1 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <div className="w-9 h-9 rounded-full bg-primary/95 flex items-center justify-center text-primary-foreground shadow-lg">
              <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
            </div>
          </div>
        </Link>
        <div className="flex flex-col flex-1 min-w-0 py-0.5 justify-start">
          <Link href={`/watch/${video.id}`} className="font-display font-semibold text-xs sm:text-sm line-clamp-2 leading-snug hover:text-primary transition-colors">
            {video.title}
          </Link>
          <Link href={`/channel/${video.channelId}`} className="text-[10px] sm:text-xs text-muted-foreground mt-1 hover:text-foreground transition-colors truncate">
            {video.channelTitle}
          </Link>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 truncate">
            {video.viewCount ? `${formatViewCount(video.viewCount)} • ` : ""}{formatRelativeTime(video.publishedAt)}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="border-none bg-transparent shadow-none overflow-hidden rounded-xl">
        <CardContent className="p-0 flex flex-col space-y-2.5">
          <Link href={`/watch/${video.id}`} className="relative aspect-video w-full rounded-xl overflow-hidden bg-black block">
            <Image
              src={thumbnail}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={false}
            />
            {video.duration && (
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                {formatDuration(video.duration)}
              </span>
            )}
            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <div className="w-12 h-12 rounded-full bg-primary/95 flex items-center justify-center text-primary-foreground shadow-lg">
                <Play className="h-6 w-6 fill-current ml-1" />
              </div>
            </div>
          </Link>
          <div className="flex gap-3 px-1">
            <Link href={`/channel/${video.channelId}`} className="mt-0.5 flex-shrink-0">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-col min-w-0">
              <Link href={`/watch/${video.id}`} className="font-display font-bold text-sm line-clamp-2 leading-tight hover:text-primary transition-colors text-foreground">
                {video.title}
              </Link>
              <Link href={`/channel/${video.channelId}`} className="text-xs text-muted-foreground mt-1 hover:text-foreground transition-colors truncate">
                {video.channelTitle}
              </Link>
              <div className="text-xs text-muted-foreground mt-0.5">
                {video.viewCount ? `${formatViewCount(video.viewCount)} • ` : ""}{formatRelativeTime(video.publishedAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
