
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

interface VideoTranscriptProps {
  videoId: string;
}

const VideoTranscript = ({ videoId }: VideoTranscriptProps) => {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && transcript.length === 0 && isAvailable === null) {
      fetchTranscript();
    }
  }, [isVisible, videoId]);

  const fetchTranscript = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase
        .functions
        .invoke("get-transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
      
      console.log('⏯️ get-transcript result:', { data: response.data, error: response.error });
      
      if (response.error) {
        throw response.error;
      }

      setTranscript(response.data.transcript || []);
      setIsAvailable(response.data.available);
      
      if (!response.data.available) {
        setError(response.data.error || 'Transcript not available');
      }
    } catch (err) {
      console.error('Error fetching transcript:', err);
      setError('Failed to load transcript');
      setIsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTimestampClick = (startTime: number) => {
    // In a real implementation, this would seek to the timestamp in the video player
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(startTime)}s`;
    window.open(youtubeUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-gray-600" />
          <span className="font-medium text-gray-900">Transcript</span>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            ID: {videoId}
          </span>
        </div>
        {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isVisible && (
        <div className="px-6 pb-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <p className="text-gray-600 mt-2">Loading transcript...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">{error}</p>
            </div>
          )}

          {!isLoading && isAvailable && transcript.length > 0 && (
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
              <div className="space-y-3">
                {transcript.map((item, index) => (
                  <div key={index} className="flex gap-3 group">
                    <button
                      onClick={() => handleTimestampClick(item.start)}
                      className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-mono bg-blue-50 px-2 py-1 rounded group-hover:bg-blue-100 transition-colors"
                    >
                      {formatTime(item.start)}
                    </button>
                    <p className="text-gray-800 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoTranscript;
