import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListVideo, Lock, Globe } from "lucide-react";

interface PlaylistCardProps {
  playlist: {
    id: string;
    name: string;
    description?: string | null;
    isPublic: boolean;
    _count?: {
      videos: number;
    } | null;
    videos?: Array<{
      video: {
        thumbnailUrl: string | null;
      };
    }> | null;
  };
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const videoCount = playlist._count?.videos ?? playlist.videos?.length ?? 0;
  
  // Try to find a thumbnail from the first video, or use fallback
  const firstVideoThumb = playlist.videos?.[0]?.video?.thumbnailUrl;
  
  return (
    <Card className="group border-none bg-transparent shadow-none overflow-hidden rounded-xl">
      <CardContent className="p-0 flex flex-col space-y-2.5">
        <Link href={`/library/playlists/${playlist.id}`} className="relative aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border border-border/40 block">
          {firstVideoThumb ? (
            <Image
              src={firstVideoThumb}
              alt={playlist.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/60">
              <ListVideo className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}

          {/* Mosaic/Side panel overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white border-l border-white/10">
            <ListVideo className="h-6 w-6 mb-1 text-primary-foreground/90" />
            <span className="text-sm font-bold">{videoCount}</span>
            <span className="text-[10px] font-semibold tracking-wider text-primary-foreground/70 uppercase">vids</span>
          </div>

          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm p-1 rounded-md text-white text-[10px] font-semibold flex items-center gap-1">
            {playlist.isPublic ? (
              <>
                <Globe className="h-3 w-3" />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                <span>Private</span>
              </>
            )}
          </div>
        </Link>

        <div className="flex flex-col px-1">
          <Link
            href={`/library/playlists/${playlist.id}`}
            className="font-display font-bold text-sm leading-snug hover:text-primary transition-colors text-foreground line-clamp-1"
          >
            {playlist.name}
          </Link>
          {playlist.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {playlist.description}
            </p>
          )}
          <Badge variant="outline" className="w-fit text-[10px] rounded-full font-medium mt-1.5 border-border/60 text-muted-foreground">
            {videoCount === 1 ? "1 video" : `${videoCount} videos`}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
