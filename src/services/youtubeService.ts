const API_KEY = 'AIzaSyARXeG-NsIv-MfZCVe3mqqIR5EOFwAo3L0';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  duration: string;
  channelId: string;
}

export interface SearchParams {
  keyword: string;
  timeRange: '24h' | '7d' | '30d' | '60d' | '90d';
  language: 'en' | 'ko' | 'both';
}

export const searchYouTubeVideos = async (params: SearchParams): Promise<VideoResult[]> => {
  const { keyword, timeRange, language } = params;
  const now = new Date();
  
  // Parse timeRange like “7d” or “24h” into a Date
  const match = timeRange.match(/^(\d+)([hd])$/);
  let publishedAfter: Date;
  if (match) {
    const amount = parseInt(match[1], 10);
    const unit   = match[2];
    const msBack = unit === 'h'
      ? amount * 60 * 60 * 1000
      : amount * 24 * 60 * 60 * 1000;
    publishedAfter = new Date(now.getTime() - msBack);
  } else {
    // Fallback to 24h
    publishedAfter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  // Build the search URL
  const searchUrl = new URL(`${BASE_URL}/search`);
  searchUrl.searchParams.set('key', API_KEY);
  searchUrl.searchParams.set('q', keyword);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('order', 'viewCount');                // <-- sort by views
  searchUrl.searchParams.set('publishedAfter', publishedAfter.toISOString());
  // Optionally bound it above to “now”
  searchUrl.searchParams.set('publishedBefore', now.toISOString());
  searchUrl.searchParams.set('maxResults', '50');
  if (language !== 'both') {
    searchUrl.searchParams.set('relevanceLanguage', language);
  }

  const searchResp = await fetch(searchUrl.toString());
  if (!searchResp.ok) {
    throw new Error(`Search failed: ${searchResp.statusText}`);
  }
  const searchData = await searchResp.json();
  if (!searchData.items?.length) {
    return [];
  }

  // Pull details for each video
  const videoIds = searchData.items.map((it: any) => it.id.videoId).join(',');
  const videosUrl = new URL(`${BASE_URL}/videos`);
  videosUrl.searchParams.set('key', API_KEY);
  videosUrl.searchParams.set('id', videoIds);
  videosUrl.searchParams.set('part', 'statistics,snippet,contentDetails');

  const videosResp = await fetch(videosUrl.toString());
  if (!videosResp.ok) {
    throw new Error(`Videos fetch failed: ${videosResp.statusText}`);
  }
  const videosData = await videosResp.json();

  // Map, language‐filter and sort by viewCount just in case
  const videos: VideoResult[] = videosData.items
    .map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount || '0', 10),
      duration: item.contentDetails.duration,
      channelId: item.snippet.channelId,
    }))
    .filter((v) => {
      if (language === 'both') return true;
      const lang = detectLanguage(v.title);
      return lang === language;
    })
    .sort((a, b) => b.viewCount - a.viewCount);

  // Decide how many to return per range
  const maxResultsByRange: Record<string, number> = {
    '24h': 10,
    '7d':  30,
    '30d': 30,
    '60d': 30,
    '90d': 30,
  };
  const maxResults = maxResultsByRange[timeRange] ?? 10;

  return videos.slice(0, maxResults);
};

export const fetchVideoDetails = async (videoId: string): Promise<VideoResult | null> => {
  // Stub function for future API implementation
  console.log('Fetching video details for ID:', videoId);
  
  // For now, return null - this can be implemented later to fetch full details
  // from YouTube API using the video ID
  return null;
};

const detectLanguage = (text: string): 'en' | 'ko' | 'unknown' => {
  const koreanRegex = /[\u3131-\u3163\uac00-\ud7a3]/;
  const englishRegex = /^[a-zA-Z0-9\s\W]*$/;
  
  if (koreanRegex.test(text)) return 'ko';
  if (englishRegex.test(text)) return 'en';
  return 'unknown';
};

export const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1]?.replace('H', '') || '0');
  const minutes = parseInt(match[2]?.replace('M', '') || '0');
  const seconds = parseInt(match[3]?.replace('S', '') || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
