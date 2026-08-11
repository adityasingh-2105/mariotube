'use client';

import { useState } from "react";
import { VideoPlayer } from "./video-player";
import { VideoInfo } from "./video-info";
import { VideoActions } from "./video-actions";
import { RelatedVideos } from "./related-videos";
import { CommentsSection } from "./comments-section";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SubscribeButton } from "@/features/channels/components/subscribe-button";
import Link from "next/link";

export function WatchLayout({ video }: { video: any }) {
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  return (
    <div className="space-y-6">
      <div className={`flex flex-col transition-all duration-300 ${isTheaterMode ? "w-full space-y-6" : "lg:flex-row gap-6"}`}>
        
        {/* Main Content Area */}
        <div className={`flex flex-col space-y-4 ${isTheaterMode ? "w-full" : "flex-1 lg:max-w-[70%]"}`}>
          <div className="relative group">
            <VideoPlayer videoId={video.id} />
            
            {/* Theater Mode Toggle Overlay Trigger */}
            <div className="absolute right-4 bottom-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="bg-black/85 hover:bg-black text-white border-none rounded-full h-8 px-3 text-xs gap-1.5 cursor-pointer shadow-md"
              >
                {isTheaterMode ? (
                  <>
                    <Minimize className="h-3.5 w-3.5" />
                    Default View
                  </>
                ) : (
                  <>
                    <Maximize className="h-3.5 w-3.5" />
                    Theater Mode
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Details column (YouTube Style Layout) */}
          <div className={`flex flex-col space-y-4 px-1 ${isTheaterMode ? "max-w-5xl mx-auto w-full pt-2" : ""}`}>
            
            {/* 1. Large Bold Video Title */}
            <h1 className="font-display font-extrabold text-xl md:text-2xl leading-snug text-foreground">
              {video.title}
            </h1>

            {/* 2. Channel info (Avatar, Sub count, button) and Actions row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1 border-b border-border/40 pb-4">
              
              {/* Creator details Left column */}
              <div className="flex items-center gap-3">
                <Link href={`/channel/${video.channelId}`}>
                  <Avatar className="h-10 w-10 border border-border/60">
                    <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${video.channelTitle}`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {video.channelTitle?.charAt(0).toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex flex-col min-w-0 mr-4">
                  <Link
                    href={`/channel/${video.channelId}`}
                    className="font-display font-semibold text-sm hover:text-primary transition-colors truncate"
                  >
                    {video.channelTitle}
                  </Link>
                  <span className="text-xs text-muted-foreground truncate">
                    124K subscribers
                  </span>
                </div>
                
                {/* Subscribe Button */}
                <SubscribeButton channelId={video.channelId} channelTitle={video.channelTitle} />
              </div>

              {/* Action Buttons Right column */}
              <VideoActions videoId={video.id} videoData={video} />
            </div>

            {/* 3. Description card container */}
            <VideoInfo video={video} />
            
            {/* If not in theater mode, comments are rendered directly below */}
            {!isTheaterMode && <CommentsSection videoId={video.id} />}
          </div>
        </div>

        {/* Sidebar / Bottom area */}
        <div className={`${isTheaterMode ? "max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-2" : "lg:w-[30%]"} space-y-6`}>
          {isTheaterMode ? (
            <>
              <div className="md:col-span-2">
                <CommentsSection videoId={video.id} />
              </div>
              <div className="md:col-span-1">
                <RelatedVideos videoId={video.id} />
              </div>
            </>
          ) : (
            <RelatedVideos videoId={video.id} />
          )}
        </div>
      </div>
    </div>
  );
}
