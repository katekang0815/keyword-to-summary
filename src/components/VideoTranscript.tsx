import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface VideoTranscriptProps {
  videoId: string;
}

const VideoTranscript = ({ videoId }: VideoTranscriptProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-gray-600" />
          <span className="font-medium text-gray-900">Video Processing</span>
        </div>
        {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isVisible && (
        <div className="px-6 pb-6">
          <div className="text-center py-8">
            <p className="text-gray-600">
              Video data has been sent to the processing service. Check your n8n platform for results.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Video URL: https://www.youtube.com/watch?v={videoId}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTranscript;