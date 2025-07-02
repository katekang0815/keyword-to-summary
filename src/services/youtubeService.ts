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
  timeRange: '24h' | '7d' | '30d';
  language: 'en' | 'ko' | 'both';
}

export const searchYouTubeVideos = async (params: SearchParams): Promise<VideoResult[]> => {
  const { keyword, timeRange, language } = params;
  
  // Calculate date for publishedAfter parameter
  const now = new Date();
  let hoursBack: number;
  
  switch (timeRange) {
    case '24h':
      hoursBack = 24;
      break;
    case '7d':
      hoursBack = 168; // 7 days = 168 hours
      break;
    case '30d':
      hoursBack = 720; // 30 days = 720 hours
      break;
    default:
      hoursBack = 24;
  }
  
  const publishedAfter = new Date(now.getTime() - hoursBack * 60 * 60 * 1000).toISOString();
  
  // Step 1: Search for videos
  const searchUrl = new URL(`${BASE_URL}/search`);
  searchUrl.searchParams.append('key', API_KEY);
  searchUrl.searchParams.append('q', keyword);
  searchUrl.searchParams.append('type', 'video');
  searchUrl.searchParams.append('publishedAfter', publishedAfter);
  searchUrl.searchParams.append('maxResults', '50');
  searchUrl.searchParams.append('order', 'date');
  
  if (language !== 'both') {
    searchUrl.searchParams.append('relevanceLanguage', language);
  }

  console.log('Searching YouTube with URL:', searchUrl.toString());

  const searchResponse = await fetch(searchUrl.toString());
  if (!searchResponse.ok) {
    throw new Error(`Search failed: ${searchResponse.statusText}`);
  }
  
  const searchData = await searchResponse.json();
  console.log('Search results:', searchData);
  
  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  // Step 2: Get video details including view counts
  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
  
  const videosUrl = new URL(`${BASE_URL}/videos`);
  videosUrl.searchParams.append('key', API_KEY);
  videosUrl.searchParams.append('id', videoIds);
  videosUrl.searchParams.append('part', 'statistics,snippet,contentDetails');

  console.log('Fetching video details with URL:', videosUrl.toString());

  const videosResponse = await fetch(videosUrl.toString());
  if (!videosResponse.ok) {
    throw new Error(`Videos fetch failed: ${videosResponse.statusText}`);
  }
  
  const videosData = await videosResponse.json();
  console.log('Video details:', videosData);

  // Step 3: Process and filter results
  const videos: VideoResult[] = videosData.items
    .map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount || '0'),
      duration: item.contentDetails.duration,
      channelId: item.snippet.channelId
    }))
    .filter((video: VideoResult) => {
      // Filter by language if specified
      if (language !== 'both') {
        const detectedLang = detectLanguage(video.title);
        if (language === 'en' && detectedLang !== 'en') return false;
        if (language === 'ko' && detectedLang !== 'ko') return false;
      }
      return true;
    })
    .sort((a: VideoResult, b: VideoResult) => b.viewCount - a.viewCount);

  // Return top results based on time range
  let maxResults: number;
  switch (timeRange) {
    case '24h':
      maxResults = 10;
      break;
    case '7d':
      maxResults = 30;
      break;
    case '30d':
      maxResults = 50;
      break;
    default:
      maxResults = 10;
  }
  
  return videos.slice(0, maxResults);
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
