import { notFound } from "next/navigation";
import { getVideoDetails, normalizeVideo } from "@/lib/youtube";
import { WatchTracker } from "./watch-tracker";
import { WatchLayout } from "@/features/videos/components/watch-layout";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ videoId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoId } = await params;
  try {
    const response = await getVideoDetails(videoId);
    if (!response.items || response.items.length === 0) {
      return { title: "Video Not Found" };
    }
    const video = normalizeVideo(response.items[0]);
    return {
      title: video.title,
      description: video.description || undefined,
      openGraph: {
        title: video.title,
        description: video.description || undefined,
        images: [{ url: video.thumbnailUrl }],
      },
    };
  } catch (error) {
    return { title: "Watch Video" };
  }
}

export default async function WatchPage({ params }: Props) {
  const { videoId } = await params;
  let video;

  try {
    const response = await getVideoDetails(videoId);
    if (!response.items || response.items.length === 0) {
      notFound();
    }
    video = normalizeVideo(response.items[0]);
  } catch (error) {
    notFound();
  }

  // Structured Data Schema markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description,
    "thumbnailUrl": video.thumbnailUrl,
    "uploadDate": video.publishedAt,
    "embedUrl": `https://www.youtube.com/embed/${video.id}`,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": video.viewCount || "0",
    },
  };

  return (
    <div className="space-y-6">
      {/* JSON-LD Rich Snippet SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Invisible component that logs user watch history inside local DB */}
      <WatchTracker videoData={video} />

      <WatchLayout video={video} />
    </div>
  );
}
