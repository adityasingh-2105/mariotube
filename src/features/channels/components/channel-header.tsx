'use client';

import { type ChannelInfo } from "@/lib/youtube-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SubscribeButton } from "./subscribe-button";
import { Badge } from "@/components/ui/badge";
import { formatViewCount } from "@/lib/utils";
import { Eye, Film, Users } from "lucide-react";
import Image from "next/image";

interface ChannelHeaderProps {
  channel: ChannelInfo;
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  const initials = channel.title ? channel.title.charAt(0).toUpperCase() : "C";

  return (
    <div className="flex flex-col space-y-6">
      {/* Banner */}
      <div className="relative h-28 sm:h-36 md:h-48 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 border border-border/40">
        {channel.bannerUrl && (
          <Image
            src={channel.bannerUrl}
            alt={`${channel.title} banner`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
      </div>

      {/* Profile Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2 -mt-14 sm:-mt-10 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background bg-card shadow-lg">
            <AvatarImage src={channel.thumbnailUrl} alt={channel.title} />
            <AvatarFallback className="bg-primary/10 text-primary font-display font-bold text-3xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col space-y-2">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground leading-none">
              {channel.title}
            </h1>
            {channel.customUrl && (
              <p className="text-sm font-semibold text-muted-foreground">
                {channel.customUrl}
              </p>
            )}
            
            {/* Quick stats badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs rounded-full font-medium">
                <Users className="h-3.5 w-3.5" />
                {formatViewCount(channel.subscriberCount).replace("views", "subs")}
              </Badge>
              <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs rounded-full font-medium">
                <Film className="h-3.5 w-3.5" />
                {parseInt(channel.videoCount).toLocaleString()} vids
              </Badge>
              <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs rounded-full font-medium">
                <Eye className="h-3.5 w-3.5" />
                {formatViewCount(channel.viewCount)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Subscribe button */}
        <div className="flex justify-center sm:justify-end mb-1">
          <SubscribeButton
            channelId={channel.id}
            channelTitle={channel.title}
            channelThumbnail={channel.thumbnailUrl}
            className="h-10 px-6 font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
