'use client';

import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SubscribeButton } from "@/features/channels/components/subscribe-button";
import { EmptyState } from "@/components/empty-state";
import { Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

import { useSession } from "next-auth/react";
import { SignInButton } from "@/features/auth/components/sign-in-button";

export default function SubscriptionsPage() {
  const { data: session } = useSession();

  const { data: subsData, isLoading, isError } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const res = await fetch("/api/user/subscriptions");
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      return res.json();
    },
    enabled: !!session,
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-primary shadow-inner">
          <Users className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display font-bold text-xl">Don't miss new videos</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to see updates from your favorite YouTube channels.
          </p>
        </div>
        <SignInButton className="rounded-full px-6 h-10 font-bold" />
      </div>
    );
  }

  const subscriptions = subsData?.data?.subscriptions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
        <Users className="h-6 w-6 text-primary fill-primary/10" />
        <h1 className="font-display font-bold text-2xl text-foreground">
          Subscriptions
        </h1>
      </div>

      {isError ? (
        <div className="text-center py-12 text-sm text-destructive">
          Failed to load subscriptions. Please try again.
        </div>
      ) : !isLoading && subscriptions.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No subscriptions yet"
          description="Subscribe to YouTube creators within MarioTube to keep track of channels."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subscriptions.map((sub: any) => {
            const initials = sub.channelTitle ? sub.channelTitle.charAt(0).toUpperCase() : "C";
            return (
              <Card key={sub.id} className="rounded-2xl bg-card border border-border/40 hover-glow">
                <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                  <Link href={`/channel/${sub.channelYoutubeId}`}>
                    <Avatar className="h-16 w-16 border-2 border-border shadow">
                      <AvatarImage src={sub.channelThumbnail || ""} alt={sub.channelTitle || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="space-y-1">
                    <Link
                      href={`/channel/${sub.channelYoutubeId}`}
                      className="font-display font-bold text-sm leading-none hover:text-primary transition-colors line-clamp-1"
                    >
                      {sub.channelTitle}
                    </Link>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider pt-0.5">
                      YouTube Creator
                    </p>
                  </div>

                  <SubscribeButton
                    channelId={sub.channelYoutubeId}
                    channelTitle={sub.channelTitle || ""}
                    channelThumbnail={sub.channelThumbnail || ""}
                    className="w-full text-xs font-semibold h-8 rounded-xl"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
