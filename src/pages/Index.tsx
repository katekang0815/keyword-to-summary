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
    language: 'both'
  });
  
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  // Load preserved state on component mount
  useEffect(() => {
    const preservedState = sessionStorage.getItem('youtube-search-state');
    if (preservedState) {
      try {
        const parsed = JSON.parse(preservedState);
        setSearchParams(parsed.searchParams);
        setVideos(parsed.videos);
        setHasSearched(parsed.hasSearched);
        // Clear the preserved state after loading
        sessionStorage.removeItem('youtube-search-state');
      } catch (error) {
        console.error('Error loading preserved state:', error);
      }
    }
  }, []);

  // Preserve state when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasSearched && videos.length > 0) {
        sessionStorage.setItem('youtube-search-state', JSON.stringify({
          searchParams,
          videos,
          hasSearched
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [searchParams, videos, hasSearched]);

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
            YouTube Trending Videos
          </h1>
          <p className="text-gray-600">
            Discover the most viewed videos
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
