import "server-only";
import type {
  YouTubeListResponse,
  YouTubeVideo,
  YouTubeSearchResult,
  YouTubeChannel,
  YouTubeCategory,
  VideoItem,
  ChannelInfo,
  CategoryItem,
} from "./youtube-types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY;

// Simple in-memory cache
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttlMs: number): void {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
  if (cache.size > 500) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

// ---- MOCK DATA DATABASE FALLBACK FOR EASY OF-BOX TESTING ----
const MOCK_VIDEOS = [
  {
    id: "jfKfPfyJRdk",
    title: "lofi hip hop radio 📚 beats to relax/study to",
    description: "Welcome to lofi hip hop radio. Enjoy study beats, relaxing music, and deep chill vibes for working or sleeping.",
    thumbnailUrl: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    channelId: "UC82717_lofi_girl",
    channelTitle: "Lofi Girl",
    publishedAt: "2026-01-01T12:00:00Z",
    viewCount: "82710342",
    likeCount: "4321092",
    duration: "PT24H00M00S",
    categoryId: "10",
  },
  {
    id: "tPEE9ZwTmy0",
    title: "Cyberpunk 2077 – Official Launch Trailer",
    description: "Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
    thumbnailUrl: "https://i.ytimg.com/vi/tPEE9ZwTmy0/hqdefault.jpg",
    channelId: "UC_cyberpunk",
    channelTitle: "Cyberpunk 2077 Official",
    publishedAt: "2025-12-10T15:30:00Z",
    viewCount: "34902198",
    likeCount: "1289304",
    duration: "PT2M10S",
    categoryId: "20",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    description: "The official video for Never Gonna Give You Up by Rick Astley. Subscribe to the official Rick Astley YouTube channel.",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    channelId: "UC_rickastley",
    channelTitle: "Rick Astley",
    publishedAt: "2009-10-25T12:00:00Z",
    viewCount: "1450289304",
    likeCount: "18930489",
    duration: "PT3M32S",
    categoryId: "10",
  },
  {
    id: "f1vMvQ92mOk",
    title: "The Ultimate Future Tech Tour!",
    description: "Exploring the most futuristic tech concepts, gadgets, smart homes, and concepts currently available or upcoming.",
    thumbnailUrl: "https://i.ytimg.com/vi/f1vMvQ92mOk/hqdefault.jpg",
    channelId: "UC_mkbhd",
    channelTitle: "Marques Brownlee",
    publishedAt: "2026-06-15T18:00:00Z",
    viewCount: "8930129",
    likeCount: "432190",
    duration: "PT14M35S",
    categoryId: "28",
  },
  {
    id: "t70h829n2l8",
    title: "Key & Peele - Substitute Teacher",
    description: "Jacqueline is back and ready to take names in the classroom. Classic substitute teacher sketch from Comedy Central.",
    thumbnailUrl: "https://i.ytimg.com/vi/t70h829n2l8/hqdefault.jpg",
    channelId: "UC_comedycentral",
    channelTitle: "Comedy Central",
    publishedAt: "2013-10-18T10:00:00Z",
    viewCount: "210983049",
    likeCount: "8901238",
    duration: "PT3M08S",
    categoryId: "23",
  },
  {
    id: "yWGYtQ-rEBE",
    title: "iPhone 15 Pro Review: The Titanium Upgrade!",
    description: "Is the switch to Titanium, Action button, and USB-C enough to upgrade? Let's check out the detailed review.",
    thumbnailUrl: "https://i.ytimg.com/vi/yWGYtQ-rEBE/hqdefault.jpg",
    channelId: "UC_mkbhd",
    channelTitle: "Marques Brownlee",
    publishedAt: "2025-09-22T19:00:00Z",
    viewCount: "12893048",
    likeCount: "543210",
    duration: "PT18M12S",
    categoryId: "28",
  },
  {
    id: "0e3GPea1Tyg",
    title: "A Minecraft Movie | Teaser Trailer",
    description: "Welcome to A Minecraft Movie! In theaters 2025. Watch the official teaser trailer.",
    thumbnailUrl: "https://i.ytimg.com/vi/0e3GPea1Tyg/hqdefault.jpg",
    channelId: "UC_warnerbros",
    channelTitle: "Warner Bros. Pictures",
    publishedAt: "2026-04-01T14:00:00Z",
    viewCount: "45092301",
    likeCount: "2304928",
    duration: "PT1M22S",
    categoryId: "20",
  },
  {
    id: "2Vv-BfVoq4g",
    title: "Ed Sheeran - Perfect (Official Music Video)",
    description: "Perfect is taken from the studio album divide. Watch the official music video starring Ed Sheeran.",
    thumbnailUrl: "https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg",
    channelId: "UC_edsheeran",
    channelTitle: "Ed Sheeran",
    publishedAt: "2017-11-09T14:00:00Z",
    viewCount: "3590219804",
    likeCount: "21980342",
    duration: "PT4M40S",
    categoryId: "10",
  },
  {
    id: "9bZkp7q19f0",
    title: "WWE Royal Rumble — Full Match Highlights",
    description: "Catch the action, surprises, and highlights from the WWE Royal Rumble pay-per-view match.",
    thumbnailUrl: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
    channelId: "UC_wwe",
    channelTitle: "WWE",
    publishedAt: "2026-02-01T10:00:00Z",
    viewCount: "12304928",
    likeCount: "540921",
    duration: "PT15M30S",
    categoryId: "17",
  },
  {
    id: "y6120QOlsfU",
    title: "Roman Reigns & Cody Rhodes Contract Signing - SmackDown Highlights",
    description: "The Undisputed WWE Universal Championship match contract is signed between Roman Reigns and Cody Rhodes on SmackDown.",
    thumbnailUrl: "https://i.ytimg.com/vi/y6120QOlsfU/hqdefault.jpg",
    channelId: "UC_wwe",
    channelTitle: "WWE",
    publishedAt: "2026-04-10T12:00:00Z",
    viewCount: "8920198",
    likeCount: "340912",
    duration: "PT8M45S",
    categoryId: "17",
  }
];
const MOCK_CATEGORIES: YouTubeCategory[] = [
  { id: "10", kind: "youtube#videoCategory", etag: "tag_music", snippet: { title: "Music", assignable: true, channelId: "UC" } },
  { id: "20", kind: "youtube#videoCategory", etag: "tag_gaming", snippet: { title: "Gaming", assignable: true, channelId: "UC" } },
  { id: "23", kind: "youtube#videoCategory", etag: "tag_comedy", snippet: { title: "Comedy", assignable: true, channelId: "UC" } },
  { id: "17", kind: "youtube#videoCategory", etag: "tag_sports", snippet: { title: "Sports", assignable: true, channelId: "UC" } },
  { id: "28", kind: "youtube#videoCategory", etag: "tag_tech", snippet: { title: "Science & Technology", assignable: true, channelId: "UC" } }
];

async function scrapeYouTubeSearch(query: string): Promise<YouTubeVideo[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const html = await res.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});/);
    if (!match) throw new Error("Could not find ytInitialData");
    const data = JSON.parse(match[1]);
    
    const videos: any[] = [];
    const searchRecursive = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.videoRenderer) {
        videos.push(obj.videoRenderer);
      }
      for (const k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          searchRecursive(obj[k]);
        }
      }
    };
    searchRecursive(data);

    return videos.map((v: any) => {
      const title = v.title?.runs?.[0]?.text || v.title?.simpleText || "";
      const channelTitle = v.ownerText?.runs?.[0]?.text || "";
      const channelId = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || "";
      const durationRaw = v.lengthText?.simpleText || "";
      const thumbUrl = v.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
      const viewCountText = v.viewCountText?.simpleText || v.viewCountText?.runs?.[0]?.text || "0 views";
      const viewCountClean = viewCountText.replace(/[^\d]/g, "") || "0";

      let durationIso = "PT0S";
      if (durationRaw) {
        const parts = durationRaw.split(":").map(Number);
        if (parts.length === 2) {
          durationIso = `PT${parts[0]}M${parts[1]}S`;
        } else if (parts.length === 3) {
          durationIso = `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
        }
      }

      return {
        kind: "youtube#video",
        etag: "mock_etag",
        id: v.videoId,
        snippet: {
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 5).toISOString(),
          channelId,
          title,
          description: v.descriptionSnippet?.runs?.[0]?.text || "",
          thumbnails: {
            default: { url: thumbUrl, width: 120, height: 90 },
            medium: { url: thumbUrl, width: 320, height: 180 },
            high: { url: thumbUrl, width: 480, height: 360 },
          },
          channelTitle,
          categoryId: "10",
        },
        statistics: {
          viewCount: viewCountClean,
          likeCount: "0",
          favoriteCount: "0",
          commentCount: "0",
        },
        contentDetails: {
          duration: durationIso,
          dimension: "2d",
          definition: "hd",
          caption: "false",
          licensedContent: false,
        },
      };
    });
  } catch (error) {
    console.error("YouTube scraping failed:", error);
    return [];
  }
}

async function getMockResponse<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  if (endpoint === "videoCategories") {
    return {
      kind: "youtube#videoCategoryListResponse",
      etag: "mock_etag",
      items: MOCK_CATEGORIES,
    } as unknown as T;
  }

  if (endpoint === "channels") {
    const channelId = params.id || "UC_default";
    const mockChannel: YouTubeChannel = {
      kind: "youtube#channel",
      etag: "mock_etag",
      id: channelId,
      snippet: {
        title: "Channel Details",
        description: "Official channel details parsed from YouTube.",
        customUrl: `@channel`,
        publishedAt: "2015-01-01T00:00:00Z",
        thumbnails: {
          default: { url: `https://api.dicebear.com/7.x/initials/svg?seed=${channelId}`, width: 88, height: 88 },
          medium: { url: `https://api.dicebear.com/7.x/initials/svg?seed=${channelId}`, width: 240, height: 240 },
          high: { url: `https://api.dicebear.com/7.x/initials/svg?seed=${channelId}`, width: 800, height: 800 },
        },
        country: "US",
      },
      statistics: {
        viewCount: "589021980",
        subscriberCount: "1250000",
        videoCount: "482",
        hiddenSubscriberCount: false,
      },
      brandingSettings: {
        channel: { title: "Creator Profile" },
        image: {
          bannerExternalUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
        },
      },
    };
    return {
      kind: "youtube#channelListResponse",
      etag: "mock_etag",
      items: [mockChannel],
    } as unknown as T;
  }

  // Handle Videos (List or Trending)
  if (endpoint === "videos") {
    const videoId = params.id;
    if (videoId) {
      const scraped = await scrapeYouTubeSearch(videoId);
      const matchingVideo = scraped.find((v) => v.id === videoId) || scraped[0];
      if (matchingVideo) {
        return {
          kind: "youtube#videoListResponse",
          etag: "mock_etag",
          items: [matchingVideo],
        } as unknown as T;
      }
    }

    const catId = params.videoCategoryId;
    let searchQuery = "popular videos";
    if (catId === "10") searchQuery = "trending music hits";
    else if (catId === "20") searchQuery = "trending gaming walkthroughs";
    else if (catId === "23") searchQuery = "popular comedy sketches";
    else if (catId === "17") searchQuery = "sports highlights trending";
    else if (catId === "28") searchQuery = "new tech reviews";

    const items = await scrapeYouTubeSearch(searchQuery);
    return {
      kind: "youtube#videoListResponse",
      etag: "mock_etag",
      items,
    } as unknown as T;
  }

  // Handle Search and Channel Videos
  if (endpoint === "search") {
    const q = params.q || "";
    const channelId = params.channelId;
    let query = q;
    if (channelId) {
      query = `channel ${channelId} uploads`;
    }
    const scraped = await scrapeYouTubeSearch(query);
    const items = scraped.map((v) => ({
      kind: "youtube#searchResult",
      etag: "mock_etag",
      id: { kind: "youtube#video", videoId: v.id },
      snippet: {
        publishedAt: v.snippet.publishedAt,
        channelId: v.snippet.channelId,
        title: v.snippet.title,
        description: v.snippet.description,
        thumbnails: v.snippet.thumbnails,
        channelTitle: v.snippet.channelTitle,
      },
    }));

    return {
      kind: "youtube#searchListResponse",
      etag: "mock_etag",
      pageInfo: { totalResults: items.length, resultsPerPage: items.length },
      items,
    } as unknown as T;
  }

  return {
    kind: "youtube#genericResponse",
    etag: "mock_etag",
    items: [],
  } as unknown as T;
}

async function youtubeApiFetch<T>(endpoint: string, params: Record<string, string>, cacheTtlMs = 5 * 60 * 1000): Promise<T> {
  if (!API_KEY || API_KEY.includes("placeholder")) {
    console.warn("Using mock YouTube API data fallback (no API key configured)");
    return await getMockResponse<T>(endpoint, params);
  }

  const searchParams = new URLSearchParams({ ...params, key: API_KEY });
  const url = `${YOUTUBE_API_BASE}/${endpoint}?${searchParams.toString()}`;
  const cacheKey = url;

  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(url, {
      next: { revalidate: Math.floor(cacheTtlMs / 1000) },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`YouTube API returned error (${response.status}): ${JSON.stringify(errorData)}. Falling back to mock data.`);
      return await getMockResponse<T>(endpoint, params);
    }

    const data = await response.json() as T;
    setCache(cacheKey, data, cacheTtlMs);
    return data;
  } catch (error) {
    console.warn("YouTube API call failed, falling back to mock data:", error);
    return await getMockResponse<T>(endpoint, params);
  }
}

// ---- PUBLIC API METHODS ----

export async function searchVideos(
  query: string,
  pageToken?: string,
  maxResults = 12
): Promise<YouTubeListResponse<YouTubeSearchResult>> {
  return youtubeApiFetch<YouTubeListResponse<YouTubeSearchResult>>(
    "search",
    {
      part: "snippet",
      q: query,
      type: "video",
      maxResults: maxResults.toString(),
      ...(pageToken ? { pageToken } : {}),
    },
    5 * 60 * 1000
  );
}

export async function getVideoDetails(
  videoIds: string | string[]
): Promise<YouTubeListResponse<YouTubeVideo>> {
  const ids = Array.isArray(videoIds) ? videoIds.join(",") : videoIds;
  return youtubeApiFetch<YouTubeListResponse<YouTubeVideo>>(
    "videos",
    {
      part: "snippet,statistics,contentDetails",
      id: ids,
    },
    5 * 60 * 1000
  );
}

export async function getTrendingVideos(
  regionCode = "US",
  categoryId?: string,
  pageToken?: string,
  maxResults = 12
): Promise<YouTubeListResponse<YouTubeVideo>> {
  return youtubeApiFetch<YouTubeListResponse<YouTubeVideo>>(
    "videos",
    {
      part: "snippet,statistics,contentDetails",
      chart: "mostPopular",
      regionCode,
      maxResults: maxResults.toString(),
      ...(categoryId ? { videoCategoryId: categoryId } : {}),
      ...(pageToken ? { pageToken } : {}),
    },
    15 * 60 * 1000
  );
}

export async function getChannelDetails(
  channelId: string
): Promise<YouTubeListResponse<YouTubeChannel>> {
  return youtubeApiFetch<YouTubeListResponse<YouTubeChannel>>(
    "channels",
    {
      part: "snippet,statistics,brandingSettings",
      id: channelId,
    },
    30 * 60 * 1000
  );
}

export async function getChannelVideos(
  channelId: string,
  pageToken?: string,
  maxResults = 12
): Promise<YouTubeListResponse<YouTubeSearchResult>> {
  return youtubeApiFetch<YouTubeListResponse<YouTubeSearchResult>>(
    "search",
    {
      part: "snippet",
      channelId,
      type: "video",
      order: "date",
      maxResults: maxResults.toString(),
      ...(pageToken ? { pageToken } : {}),
    },
    10 * 60 * 1000
  );
}

export async function getVideoCategories(
  regionCode = "US"
): Promise<YouTubeListResponse<YouTubeCategory>> {
  return youtubeApiFetch<YouTubeListResponse<YouTubeCategory>>(
    "videoCategories",
    {
      part: "snippet",
      regionCode,
    },
    60 * 60 * 1000
  );
}

export async function getRelatedVideos(
  videoId: string,
  maxResults = 12
): Promise<YouTubeListResponse<YouTubeSearchResult>> {
  try {
    const videoData = await getVideoDetails(videoId);
    const video = videoData.items[0];
    if (!video) throw new Error("Video not found");

    const searchQuery = video.snippet.tags?.slice(0, 3).join(" ") || video.snippet.title.split(" ").slice(0, 4).join(" ");

    return youtubeApiFetch<YouTubeListResponse<YouTubeSearchResult>>(
      "search",
      {
        part: "snippet",
        q: searchQuery,
        type: "video",
        maxResults: maxResults.toString(),
        ...(video.snippet.categoryId ? { videoCategoryId: video.snippet.categoryId } : {}),
      },
      10 * 60 * 1000
    );
  } catch {
    return { kind: "", etag: "", pageInfo: { totalResults: 0, resultsPerPage: 0 }, items: [] };
  }
}

// ---- NORMALIZERS ----

export function normalizeVideo(video: YouTubeVideo): VideoItem {
  const videoId = typeof video.id === "string" ? video.id : video.id?.videoId || "";
  return {
    id: videoId,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnailUrl:
      video.snippet.thumbnails.maxres?.url ||
      video.snippet.thumbnails.high?.url ||
      video.snippet.thumbnails.medium?.url ||
      video.snippet.thumbnails.default?.url ||
      "",
    channelId: video.snippet.channelId,
    channelTitle: video.snippet.channelTitle,
    publishedAt: video.snippet.publishedAt,
    viewCount: video.statistics?.viewCount,
    likeCount: video.statistics?.likeCount,
    duration: video.contentDetails?.duration,
    commentCount: video.statistics?.commentCount,
  };
}

export function normalizeSearchResult(result: YouTubeSearchResult): VideoItem {
  return {
    id: result.id.videoId || "",
    title: result.snippet.title,
    description: result.snippet.description,
    thumbnailUrl:
      result.snippet.thumbnails.high?.url ||
      result.snippet.thumbnails.medium?.url ||
      result.snippet.thumbnails.default?.url ||
      "",
    channelId: result.snippet.channelId,
    channelTitle: result.snippet.channelTitle,
    publishedAt: result.snippet.publishedAt,
  };
}

export function normalizeChannel(channel: YouTubeChannel): ChannelInfo {
  return {
    id: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl,
    thumbnailUrl:
      channel.snippet.thumbnails.high?.url ||
      channel.snippet.thumbnails.medium?.url ||
      channel.snippet.thumbnails.default?.url ||
      "",
    bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl,
    subscriberCount: channel.statistics?.subscriberCount || "0",
    videoCount: channel.statistics?.videoCount || "0",
    viewCount: channel.statistics?.viewCount || "0",
    country: channel.snippet.country,
    publishedAt: channel.snippet.publishedAt,
  };
}

export function normalizeCategory(category: YouTubeCategory): CategoryItem {
  return {
    id: category.id,
    title: category.snippet.title,
  };
}
