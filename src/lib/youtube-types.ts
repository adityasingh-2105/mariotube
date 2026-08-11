export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

export interface YouTubeVideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  tags?: string[];
  categoryId?: string;
  liveBroadcastContent?: string;
}

export interface YouTubeVideoStatistics {
  viewCount?: string;
  likeCount?: string;
  dislikeCount?: string;
  favoriteCount?: string;
  commentCount?: string;
}

export interface YouTubeVideoContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
}

export interface YouTubeVideo {
  kind: string;
  etag: string;
  id: string | { kind: string; videoId: string };
  snippet: YouTubeVideoSnippet;
  statistics?: YouTubeVideoStatistics;
  contentDetails?: YouTubeVideoContentDetails;
}

export interface YouTubeSearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet: YouTubeVideoSnippet;
}

export interface YouTubeChannelSnippet {
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnails: YouTubeThumbnails;
  country?: string;
}

export interface YouTubeChannelStatistics {
  viewCount: string;
  subscriberCount: string;
  hiddenSubscriberCount: boolean;
  videoCount: string;
}

export interface YouTubeChannelBrandingSettings {
  channel?: {
    title?: string;
    description?: string;
    keywords?: string;
    unsubscribedTrailer?: string;
  };
  image?: {
    bannerExternalUrl?: string;
  };
}

export interface YouTubeChannel {
  kind: string;
  etag: string;
  id: string;
  snippet: YouTubeChannelSnippet;
  statistics?: YouTubeChannelStatistics;
  brandingSettings?: YouTubeChannelBrandingSettings;
}

export interface YouTubeCategory {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    channelId: string;
    title: string;
    assignable: boolean;
  };
}

export interface YouTubePageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface YouTubeListResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: YouTubePageInfo;
  items: T[];
}

export interface YouTubePlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    channelTitle: string;
    playlistId: string;
    position: number;
    resourceId: {
      kind: string;
      videoId: string;
    };
  };
}

// Normalized types for the app
export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  channelThumbnail?: string;
  publishedAt: string;
  viewCount?: string;
  likeCount?: string;
  duration?: string;
  commentCount?: string;
}

export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  country?: string;
  publishedAt: string;
}

export interface CategoryItem {
  id: string;
  title: string;
}
