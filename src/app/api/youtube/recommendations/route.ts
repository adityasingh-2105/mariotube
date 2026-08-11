import { searchVideos, getTrendingVideos, normalizeVideo, normalizeSearchResult } from "@/lib/youtube";
import { successResponse, withErrorHandling, validateSearchParams, getAuthenticatedUser } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { z } from "zod";
import type { VideoItem } from "@/lib/youtube-types";

const schema = z.object({
  regionCode: z.string().default("US"),
  categoryId: z.string().optional(),
  pageToken: z.string().optional(),
  maxResults: z.coerce.number().min(1).max(50).default(16),
});

// Helper to clean and extract meaningful topic keywords from video titles
function extractKeywords(title: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "by", "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "from", "up", "down", "of", "off", "over", "under",
    "official", "video", "full", "hd", "4k", "music", "lyrics", "shorts", "reels",
    "new", "trailer", "episode", "part", "live", "stream", "vs", "2024", "2025", "2026"
  ]);

  const clean = title.replace(/[^a-zA-Z0-9\s]/g, " ").toLowerCase();
  const words = clean.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  return words;
}

// Helper to shuffle an array randomly (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const validated = validateSearchParams(searchParams, schema);

  const user = await getAuthenticatedUser();
  
  let personalizedVideos: VideoItem[] = [];
  let isPersonalized = false;
  let seedKeywords: string[] = [];

  if (user && user.id) {
    // 1. Fetch user's Likes (High Weight)
    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      include: { video: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    // 2. Fetch user's Watch History (Medium-High Weight)
    const history = await db.watchHistory.findMany({
      where: { userId: user.id },
      include: { video: true },
      orderBy: { watchedAt: "desc" },
      take: 12,
    });

    // 3. Fetch user's Subscriptions
    const subscriptions = await db.subscription.findMany({
      where: { userId: user.id },
      take: 6,
    });

    // 4. Fetch user's Recent Search History (High Signal)
    const searches = await db.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { searchedAt: "desc" },
      take: 8,
    });

    // 5. Fetch user's Choice tags and categories
    const userChoices = await db.userChoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Collect personalized seed topics
    const seedSet = new Set<string>();

    // Add recent search queries
    searches.forEach((s) => {
      if (s.query) seedSet.add(s.query);
    });

    // Add top choices & categories
    userChoices.forEach((c) => {
      if (c.tag) seedSet.add(c.tag);
      if (c.category) seedSet.add(c.category);
    });

    // Add liked channels & prominent title keywords (highest priority)
    favorites.forEach(f => {
      if (f.video.channelTitle) seedSet.add(f.video.channelTitle);
      const keywords = extractKeywords(f.video.title);
      if (keywords.length >= 2) {
        seedSet.add(`${keywords[0]} ${keywords[1]}`);
      } else if (keywords.length === 1) {
        seedSet.add(keywords[0]);
      }
    });

    // Add watched channels & keywords
    history.forEach(h => {
      if (h.video.channelTitle) seedSet.add(h.video.channelTitle);
      const keywords = extractKeywords(h.video.title);
      if (keywords.length >= 2) {
        seedSet.add(`${keywords[0]} ${keywords[1]}`);
      }
    });

    // Add subscribed channels
    subscriptions.forEach(s => {
      if (s.channelTitle) seedSet.add(s.channelTitle);
    });

    seedKeywords = Array.from(seedSet).filter(Boolean);

    if (seedKeywords.length > 0) {
      isPersonalized = true;
      // Randomly pick 2-3 distinct seed topics from user's interests on each refresh
      const chosenSeeds = shuffleArray(seedKeywords).slice(0, 3);

      try {
        // Query search results for each chosen interest seed in parallel
        const queryPromises = chosenSeeds.map(seed => {
          const query = validated.categoryId 
            ? `${seed}` 
            : seed;
          return searchVideos(query, validated.pageToken, 6)
            .then(res => res.items.map(normalizeSearchResult))
            .catch(() => [] as VideoItem[]);
        });

        // Also fetch a small batch of trending discovery videos to prevent filter bubbles
        const discoveryPromise = getTrendingVideos(
          validated.regionCode,
          validated.categoryId,
          validated.pageToken,
          6
        ).then(res => res.items.map(normalizeVideo)).catch(() => [] as VideoItem[]);

        const results = await Promise.all([...queryPromises, discoveryPromise]);
        
        // Interleave & merge videos
        const merged: VideoItem[] = [];
        const maxLen = Math.max(...results.map(r => r.length), 0);
        for (let i = 0; i < maxLen; i++) {
          for (const list of results) {
            if (list[i]) {
              merged.push(list[i]);
            }
          }
        }
        personalizedVideos = merged;
      } catch (e) {
        console.error("Personalized search error:", e);
      }
    }
  }

  // If not personalized or empty results, load fresh randomized trending/discovery content
  if (personalizedVideos.length === 0) {
    try {
      if (validated.categoryId) {
        // If category is selected, fetch category trending
        const response = await getTrendingVideos(
          validated.regionCode,
          validated.categoryId,
          validated.pageToken,
          validated.maxResults
        );
        personalizedVideos = response.items.map(normalizeVideo);
      } else {
        // Fresh diverse discovery across multiple popular genres
        const discoveryTopics = shuffleArray([
          "popular music trending",
          "trending gaming videos",
          "technology gadgets reviews",
          "popular comedy viral",
          "world sports highlights",
          "fascinating science facts",
          "latest movies entertainment"
        ]);

        const selectedTopic = discoveryTopics[0];
        
        const [searchRes, trendingRes] = await Promise.all([
          searchVideos(selectedTopic, validated.pageToken, 8).then(r => r.items.map(normalizeSearchResult)).catch(() => [] as VideoItem[]),
          getTrendingVideos(validated.regionCode, undefined, validated.pageToken, 8).then(r => r.items.map(normalizeVideo)).catch(() => [] as VideoItem[]),
        ]);

        // Interleave discovery search + trending
        const combined: VideoItem[] = [];
        const maxLen = Math.max(searchRes.length, trendingRes.length);
        for (let i = 0; i < maxLen; i++) {
          if (trendingRes[i]) combined.push(trendingRes[i]);
          if (searchRes[i]) combined.push(searchRes[i]);
        }
        personalizedVideos = combined;
      }
    } catch (e) {
      console.error("Discovery trending error:", e);
    }
  }

  // Deduplicate by ID and shuffle slightly for natural feed diversity
  const uniqueVideos = Array.from(new Map(personalizedVideos.map(v => [v.id, v])).values());
  const finalVideos = shuffleArray(uniqueVideos).slice(0, validated.maxResults);

  return successResponse({
    videos: finalVideos,
    nextPageToken: `page_${Date.now()}`,
    isPersonalized,
    seedKeywords: seedKeywords.slice(0, 3),
  });
});
