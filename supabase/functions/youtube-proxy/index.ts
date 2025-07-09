import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  keyword: string;
  timeRange: '24h' | '7d' | '30d' | '60d' | '90d';
  language: 'en' | 'ko' | 'both';
  videoDuration?: 'short' | 'medium' | 'long' | 'any';
}

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  duration: string;
  channelId: string;
}

const detectLanguage = (text: string): 'en' | 'ko' | 'unknown' => {
  const koreanRegex = /[\u3131-\u3163\uac00-\ud7a3]/;
  const englishRegex = /^[a-zA-Z0-9\s\W]*$/;
  
  if (koreanRegex.test(text)) return 'ko';
  if (englishRegex.test(text)) return 'en';
  return 'unknown';
};

const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const formatDuration = (duration: string): string => {
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

const getDurationInMinutes = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]?.replace('H', '') || '0');
  const minutes = parseInt(match[2]?.replace('M', '') || '0');
  const seconds = parseInt(match[3]?.replace('S', '') || '0');
  
  return hours * 60 + minutes + (seconds > 0 ? 1 : 0); // Round up if there are seconds
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    const { searchParams } = await req.json() as { searchParams: SearchParams };
    
    // Input validation
    if (!searchParams.keyword || typeof searchParams.keyword !== 'string') {
      throw new Error('Invalid keyword parameter');
    }
    
    if (!['24h', '7d', '30d', '60d', '90d'].includes(searchParams.timeRange)) {
      throw new Error('Invalid timeRange parameter');
    }
    
    if (!['en', 'ko', 'both'].includes(searchParams.language)) {
      throw new Error('Invalid language parameter');
    }
    
    if (searchParams.videoDuration && !['short', 'medium', 'long', 'any'].includes(searchParams.videoDuration)) {
      throw new Error('Invalid videoDuration parameter');
    }

    // Sanitize keyword
    const sanitizedKeyword = searchParams.keyword.trim().substring(0, 100);
    if (!sanitizedKeyword) {
      throw new Error('Keyword cannot be empty');
    }

    const { keyword, timeRange, language, videoDuration } = searchParams;
    const now = new Date();
    
    // Parse timeRange
    const match = timeRange.match(/^(\d+)([hd])$/);
    let publishedAfter: Date;
    if (match) {
      const amount = parseInt(match[1], 10);
      const unit = match[2];
      const msBack = unit === 'h'
        ? amount * 60 * 60 * 1000
        : amount * 24 * 60 * 60 * 1000;
      publishedAfter = new Date(now.getTime() - msBack);
    } else {
      publishedAfter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const BASE_URL = 'https://www.googleapis.com/youtube/v3';
    
    // Build search URL
    const searchUrl = new URL(`${BASE_URL}/search`);
    searchUrl.searchParams.set('key', API_KEY);
    searchUrl.searchParams.set('q', sanitizedKeyword);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('order', 'viewCount');
    searchUrl.searchParams.set('publishedAfter', publishedAfter.toISOString());
    searchUrl.searchParams.set('publishedBefore', now.toISOString());
    searchUrl.searchParams.set('maxResults', '50');
    if (language !== 'both') {
      searchUrl.searchParams.set('relevanceLanguage', language);
    }
    if (videoDuration && videoDuration !== 'any') {
      searchUrl.searchParams.set('videoDuration', videoDuration);
    }

    console.log('Making YouTube search request:', sanitizedKeyword);
    const searchResp = await fetch(searchUrl.toString());
    if (!searchResp.ok) {
      throw new Error(`Search failed: ${searchResp.statusText}`);
    }
    
    const searchData = await searchResp.json();
    if (!searchData.items?.length) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get video details
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const videosUrl = new URL(`${BASE_URL}/videos`);
    videosUrl.searchParams.set('key', API_KEY);
    videosUrl.searchParams.set('id', videoIds);
    videosUrl.searchParams.set('part', 'statistics,snippet,contentDetails');

    const videosResp = await fetch(videosUrl.toString());
    if (!videosResp.ok) {
      throw new Error(`Videos fetch failed: ${videosResp.statusText}`);
    }
    
    const videosData = await videosResp.json();

    // Process and filter videos
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
        // Language filter
        if (language !== 'both') {
          const lang = detectLanguage(v.title);
          if (lang !== language) return false;
        }
        
        // Duration filter - specifically filter for videos less than 23 minutes
        if (videoDuration && videoDuration !== 'any') {
          const durationInMinutes = getDurationInMinutes(v.duration);
          if (durationInMinutes >= 23) return false; // Filter out videos 23 minutes or longer
        }
        
        return true;
      })
      .sort((a, b) => b.viewCount - a.viewCount);

    // Limit results based on time range
    const maxResultsByRange: Record<string, number> = {
      '24h': 10,
      '7d': 30,
      '30d': 30,
      '60d': 30,
      '90d': 30,
    };
    const maxResults = maxResultsByRange[timeRange] ?? 10;

    console.log(`Returning ${Math.min(videos.length, maxResults)} videos`);
    return new Response(JSON.stringify(videos.slice(0, maxResults)), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('YouTube proxy error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});