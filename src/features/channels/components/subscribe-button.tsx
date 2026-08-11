'use client';

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubscribeButtonProps {
  channelId: string;
  channelTitle: string;
  channelThumbnail?: string;
  className?: string;
}

export function SubscribeButton({
  channelId,
  channelTitle,
  channelThumbnail,
  className,
}: SubscribeButtonProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Fetch subscription list
  const { data: subsData, isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const res = await fetch("/api/user/subscriptions");
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      return res.json();
    },
    enabled: !!session,
  });

  const isSubscribed = subsData?.data?.subscriptions?.some(
    (sub: any) => sub.channelYoutubeId === channelId
  );

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelYoutubeId: channelId,
          channelTitle,
          channelThumbnail,
        }),
      });
      if (!res.ok) throw new Error("Failed to subscribe");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success(`Subscribed to ${channelTitle}`);
    },
    onError: () => {
      toast.error("Failed to subscribe. Please try again.");
    },
  });

  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/user/subscriptions?channelYoutubeId=${channelId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to unsubscribe");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.info(`Unsubscribed from ${channelTitle}`);
    },
    onError: () => {
      toast.error("Failed to unsubscribe. Please try again.");
    },
  });

  const handleToggleSubscribe = () => {
    if (!session) {
      toast.error("Sign in with Google to subscribe to channels");
      return;
    }

    if (isSubscribed) {
      unsubscribeMutation.mutate();
    } else {
      subscribeMutation.mutate();
    }
  };

  const isMutating = subscribeMutation.isPending || unsubscribeMutation.isPending;

  return (
    <Button
      variant={isSubscribed ? "secondary" : "default"}
      size="sm"
      className={cn(
        "rounded-full font-medium h-9 px-4 transition-all duration-200",
        isSubscribed && "bg-muted text-foreground hover:bg-destructive hover:text-destructive-foreground",
        !isSubscribed && "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:opacity-90",
        className
      )}
      onClick={handleToggleSubscribe}
      disabled={isLoading || isMutating}
    >
      {isSubscribed ? (
        <span className="flex items-center gap-1.5 group">
          <Bell className="h-3.5 w-3.5 group-hover:hidden" />
          <BellOff className="h-3.5 w-3.5 hidden group-hover:inline" />
          <span className="group-hover:hidden">Subscribed</span>
          <span className="hidden group-hover:inline">Unsubscribe</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Subscribe
        </span>
      )}
    </Button>
  );
}
