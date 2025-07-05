
import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface VideoTranscriptProps {
  videoId: string;
}

const VideoTranscript = ({ videoId }: VideoTranscriptProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sendToWebhook = async () => {
    setIsLoading(true);
    setWebhookResponse(null);
    setError(null);

    try {
      const response = await fetch('http://localhost:5678/webhook/summaryapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      const data = await response.json();

      if (response.ok) {
        setWebhookResponse(data);
      } else {
        setError('Failed to process video data');
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
      setError('Failed to connect to processing service');
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
              <p className="text-gray-600 mt-2">Processing video data...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {webhookResponse && !isLoading && !error && (
            <div className="py-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-700 font-medium">✅ Processing completed successfully</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Response:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">
                  {JSON.stringify(webhookResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoTranscript;
