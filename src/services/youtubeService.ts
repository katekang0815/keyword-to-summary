import { supabase } from '@/integrations/supabase/client';

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
  // Input validation and sanitization
  if (!params.keyword || typeof params.keyword !== 'string') {
    throw new Error('Invalid search keyword');
  }
  
  const sanitizedKeyword = params.keyword.trim();
  if (!sanitizedKeyword) {
    throw new Error('Search keyword cannot be empty');
  }
  
  if (!['24h', '7d', '30d', '60d', '90d'].includes(params.timeRange)) {
    throw new Error('Invalid time range');
  }
  
  if (!['en', 'ko', 'both'].includes(params.language)) {
    throw new Error('Invalid language selection');
  }

  try {
    console.log('Making secure YouTube search request:', sanitizedKeyword);
    
    const { data, error } = await supabase.functions.invoke('youtube-proxy', {
      body: { 
        searchParams: {
          keyword: sanitizedKeyword,
          timeRange: params.timeRange,
          language: params.language
        }
      }
    });

    if (error) {
      console.error('YouTube proxy error:', error);
      throw new Error('Failed to search videos');
    }

    return data || [];
  } catch (error) {
    console.error('YouTube search error:', error);
    throw error instanceof Error ? error : new Error('Failed to search videos');
  }
};

export const fetchVideoDetails = async (videoId: string): Promise<VideoResult | null> => {
  // Input validation
  if (!videoId || typeof videoId !== 'string') {
    throw new Error('Invalid video ID');
  }
  
  // Sanitize video ID (YouTube video IDs are alphanumeric with dashes and underscores)
  const sanitizedVideoId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!sanitizedVideoId || sanitizedVideoId.length !== 11) {
    throw new Error('Invalid video ID format');
  }
  
  console.log('Fetching video details for ID:', sanitizedVideoId);
  
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