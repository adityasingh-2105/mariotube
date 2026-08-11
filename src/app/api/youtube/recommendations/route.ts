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

const CATEGORY_TOPICS: Record<string, string> = {
  "1": "Film & Animation movie trailers clips animations",
  "2": "Autos & Vehicles supercars automotive reviews racing",
  "10": "Trending Music official music videos top hits",
  "15": "Pets & Animals funny cute dogs cats wildlife",
  "17": "Sports highlights football basketball match goals",
  "19": "Travel & Events travel vlog tourism destinations",
  "20": "Gaming gameplay walkthrough live stream highlights",
  "22": "People & Blogs popular vloggers lifestyle stories",
  "23": "Comedy standup funny comedy sketches hilarious moments",
  "24": "Entertainment trending shows viral clips pop culture",
  "25": "News & Politics breaking news world updates analysis",
  "26": "Howto & Style tutorials lifehacks DIY fashion tips",
  "27": "Education documentary science learning fascinating facts",
  "28": "Science & Technology latest tech gadgets AI innovation",
};

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

  // CASE 1: USER SELECTED A SPECIFIC CATEGORY (e.g. Comedy, Gaming, Music, Sports)
  if (validated.categoryId) {
    const catQuery = CATEGORY_TOPICS[validated.categoryId] || `popular category ${validated.categoryId}`;

    try {
      // Fetch trending videos in this category and search targeted keywords in parallel
      const [catTrending, catSearch] = await Promise.all([
        getTrendingVideos(
          validated.regionCode,
          validated.categoryId,
          validated.pageToken,
          validated.maxResults
        )
          .then((res) => res.items.map(normalizeVideo))
          .catch(() => [] as VideoItem[]),

        searchVideos(catQuery, validated.pageToken, validated.maxResults)
          .then((res) => res.items.map(normalizeSearchResult))
          .catch(() => [] as VideoItem[]),
      ]);

      // Merge and deduplicate results for this category
      const combined = [...catTrending, ...catSearch];
      const seen = new Set<string>();
      personalizedVideos = combined.filter((v) => {
        if (!v.id || seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
      });
    } catch (e) {
      console.error("Category fetch error:", e);
    }
  } 
  // CASE 2: ALL TAB -> PERSONALIZED FEED FOR LOGGED-IN USERS
  else if (user && user.id) {
    const [favorites, history, subscriptions, searches, userChoices] = await Promise.all([
      db.favorite.findMany({
        where: { userId: user.id },
        include: { video: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.watchHistory.findMany({
        where: { userId: user.id },
        include: { video: true },
        orderBy: { watchedAt: "desc" },
        take: 12,
      }),
      db.subscription.findMany({
        where: { userId: user.id },
        take: 6,
      }),
      db.searchHistory.findMany({
        where: { userId: user.id },
        orderBy: { searchedAt: "desc" },
        take: 8,
      }),
      db.userChoice.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const seedSet = new Set<string>();

    searches.forEach((s) => {
      if (s.query) seedSet.add(s.query);
    });

    userChoices.forEach((c) => {
      if (c.tag) seedSet.add(c.tag);
      if (c.category) seedSet.add(c.category);
    });

    favorites.forEach((f) => {
      if (f.video.channelTitle) seedSet.add(f.video.channelTitle);
      const keywords = extractKeywords(f.video.title);
      if (keywords.length >= 2) {
        seedSet.add(`${keywords[0]} ${keywords[1]}`);
      } else if (keywords.length === 1) {
        seedSet.add(keywords[0]);
      }
    });

    history.forEach((h) => {
      if (h.video.channelTitle) seedSet.add(h.video.channelTitle);
      const keywords = extractKeywords(h.video.title);
      if (keywords.length >= 2) {
        seedSet.add(`${keywords[0]} ${keywords[1]}`);
      }
    });

    subscriptions.forEach((s) => {
      if (s.channelTitle) seedSet.add(s.channelTitle);
    });

    const seedKeywords = Array.from(seedSet).filter(Boolean);

    if (seedKeywords.length > 0) {
      isPersonalized = true;
      const chosenSeeds = shuffleArray(seedKeywords).slice(0, 3);

      try {
        const queryPromises = chosenSeeds.map((seed) =>
          searchVideos(seed, validated.pageToken, 6)
            .then((res) => res.items.map(normalizeSearchResult))
            .catch(() => [] as VideoItem[])
        );

        const discoveryPromise = getTrendingVideos(
          validated.regionCode,
          undefined,
          validated.pageToken,
          6
        )
          .then((res) => res.items.map(normalizeVideo))
          .catch(() => [] as VideoItem[]);

        const results = await Promise.all([...queryPromises, discoveryPromise]);

        const merged: VideoItem[] = [];
        const maxLen = Math.max(...results.map((r) => r.length), 0);
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

  // CASE 3: FALLBACK TO FRESH DISCOVERY IF STILL EMPTY
  if (personalizedVideos.length === 0) {
    try {
      const discoveryTopics = shuffleArray([
        "popular music trending",
        "trending gaming videos",
        "technology gadgets reviews",
        "popular comedy viral",
        "world sports highlights",
        "fascinating science facts",
        "latest movies entertainment",
      ]);

      const selectedTopic = discoveryTopics[0];

      const [searchRes, trendingRes] = await Promise.all([
        searchVideos(selectedTopic, validated.pageToken, 8)
          .then((r) => r.items.map(normalizeSearchResult))
          .catch(() => [] as VideoItem[]),
        getTrendingVideos(validated.regionCode, undefined, validated.pageToken, 8)
          .then((r) => r.items.map(normalizeVideo))
          .catch(() => [] as VideoItem[]),
      ]);

      const combined = [...trendingRes, ...searchRes];
      personalizedVideos = shuffleArray(combined);
    } catch (e) {
      console.error("Fallback recommendations error:", e);
    }
  }

  // Final deduplication & format response
  const seenIds = new Set<string>();
  const uniqueVideos = personalizedVideos.filter((v) => {
    if (!v.id || seenIds.has(v.id)) return false;
    seenIds.add(v.id);
    return true;
  });

  return successResponse({
    videos: uniqueVideos.slice(0, validated.maxResults),
    nextPageToken: `page_${Date.now()}`,
    isPersonalized,
  });
});
