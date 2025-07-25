
import { useState, useEffect } from 'react';
import { searchYouTubeVideos, VideoResult, SearchParams } from '@/services/youtubeService';
import SearchFilters from '@/components/SearchFilters';
import VideoCard from '@/components/VideoCard';
import ResultsHeader from '@/components/ResultsHeader';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    timeRange: '24h',
    language: 'both',
    videoDuration: 'any'
  });
  
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  // Load saved search results and params from sessionStorage on mount
  useEffect(() => {
    const savedResults = sessionStorage.getItem('searchResults');
    const savedParams = sessionStorage.getItem('searchParams');
    const savedHasSearched = sessionStorage.getItem('hasSearched');

    if (savedResults && savedParams && savedHasSearched) {
      setVideos(JSON.parse(savedResults));
      setSearchParams(JSON.parse(savedParams));
      setHasSearched(JSON.parse(savedHasSearched));
    }
  }, []);

  const handleSearch = async () => {
    if (!searchParams.keyword.trim()) {
      toast({
        title: "Please enter a keyword",
        description: "You need to provide a search keyword to find videos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(false);
    
    try {
      console.log('Starting search with params:', searchParams);
      const results = await searchYouTubeVideos(searchParams);
      console.log('Search completed, found videos:', results.length);
      
      setVideos(results);
      setHasSearched(true);
      
      // Save search results and params to sessionStorage
      sessionStorage.setItem('searchResults', JSON.stringify(results));
      sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
      sessionStorage.setItem('hasSearched', JSON.stringify(true));
      
      if (results.length === 0) {
        toast({
          title: "No videos found",
          description: "Try adjusting your search criteria or keywords.",
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${results.length} trending videos.`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            YouTube Scraper with AI Summaries
          </h1>
          <p className="text-gray-600">
            Instant YouTube Research: Find & Summarize Top Videos
          </p>
        </div>

        <SearchFilters
          params={searchParams}
          onParamsChange={setSearchParams}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Searching for trending videos...</p>
          </div>
        )}

        {hasSearched && !isLoading && (
          <>
            {videos.length > 0 ? (
              <>
                <ResultsHeader
                  count={videos.length}
                  timeRange={searchParams.timeRange}
                  keyword={searchParams.keyword}
                />
                
                <div className="space-y-4">
                  {videos.map((video, index) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  No videos found for your search criteria. Try different keywords or adjust the filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
