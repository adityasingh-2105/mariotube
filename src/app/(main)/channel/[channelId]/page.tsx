import { notFound } from "next/navigation";
import { getChannelDetails, normalizeChannel } from "@/lib/youtube";
import { ChannelHeader } from "@/features/channels/components/channel-header";
import { ChannelVideos } from "@/features/channels/components/channel-videos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Eye, Film, Info } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ channelId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { channelId } = await params;
  try {
    const response = await getChannelDetails(channelId);
    if (!response.items || response.items.length === 0) {
      return { title: "Channel Not Found" };
    }
    const channel = normalizeChannel(response.items[0]);
    return {
      title: channel.title,
      description: channel.description || undefined,
    };
  } catch (error) {
    return { title: "View Channel" };
  }
}

export default async function ChannelPage({ params }: Props) {
  const { channelId } = await params;
  let channel;

  try {
    const response = await getChannelDetails(channelId);
    if (!response.items || response.items.length === 0) {
      notFound();
    }
    channel = normalizeChannel(response.items[0]);
  } catch (error) {
    notFound();
  }

  const joinDate = channel.publishedAt
    ? new Date(channel.publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-8">
      {/* Channel Header (Banners, subscriber details) */}
      <ChannelHeader channel={channel} />

      {/* Tabs navigation */}
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-11 p-0 mb-6 gap-6">
          <TabsTrigger
            value="videos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-semibold px-2 pb-3 pt-0"
          >
            Videos
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-semibold px-2 pb-3 pt-0"
          >
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="focus-visible:outline-none">
          <ChannelVideos channelId={channel.id} />
        </TabsContent>

        <TabsContent value="about" className="focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Description card */}
            <Card className="md:col-span-2 rounded-2xl bg-card border border-border/40">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 font-display font-bold text-lg">
                  <Info className="h-5 w-5 text-primary" />
                  <h2>Description</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {channel.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            {/* Statistics card */}
            <Card className="rounded-2xl bg-card border border-border/40 h-fit">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 font-display font-bold text-lg">
                  <Film className="h-5 w-5 text-primary" />
                  <h2>Stats</h2>
                </div>
                
                <div className="space-y-4">
                  {joinDate && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground/60" />
                      <span>Joined {joinDate}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 text-muted-foreground/60" />
                    <span>{parseInt(channel.viewCount).toLocaleString()} total views</span>
                  </div>
                  {channel.country && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>Country:</span>
                      <span className="font-semibold text-foreground">{channel.country}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
