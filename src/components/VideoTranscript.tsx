
import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface VideoTranscriptProps {
  videoId: string;
}

const VideoTranscript = ({ videoId }: VideoTranscriptProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendToWebhook = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5678/webhook-test/summaryapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      if (response.ok) {
        setMessage('Video data sent successfully to processing platform');
      } else {
        setMessage('Failed to send video data');
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
      setMessage('Failed to send video data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      sendToWebhook();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-gray-600" />
          <span className="font-medium text-gray-900">Process Video</span>
          <span className="text-sm text-gray-500">({videoId})</span>
        </div>
        {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isVisible && (
        <div className="px-6 pb-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <p className="text-gray-600 mt-2">Sending video data to processing platform...</p>
            </div>
          )}

          {message && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">{message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoTranscript;
