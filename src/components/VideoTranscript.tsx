import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, ExternalLink } from 'lucide-react';

interface WebhookResponse {
  response: {
    text: string;
  };
  output: Array<{
    title: string;
    url: string;
  }>;
}

interface VideoTranscriptProps {
  videoId: string;
}

const VideoTranscript = ({ videoId }: VideoTranscriptProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [webhookData, setWebhookData] = useState<WebhookResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for webhook response data
    const storedData = sessionStorage.getItem(`webhook_${videoId}`);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setWebhookData(parsedData);
      } catch (error) {
        console.error('Error parsing webhook data:', error);
      }
    }
    setIsLoading(false);
  }, [videoId]);

  const handleRelatedVideoClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-gray-600" />
          <span className="font-medium text-gray-900">Analysis Results</span>
        </div>
        {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isVisible && (
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-600">Loading analysis...</p>
            </div>
          ) : webhookData ? (
            <div className="space-y-6">
              {/* Summary Section */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                  📤 Summary:
                </h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {webhookData.response.text}
                </p>
              </div>

              {/* Related Videos Section */}
              {webhookData.output && webhookData.output.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    🔑 Related:
                  </h3>
                  <div className="space-y-2">
                    {webhookData.output.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleRelatedVideoClick(item.url)}
                      >
                        <span className="text-red-600">▶️</span>
                        <span className="flex-1 text-gray-800 hover:text-red-600 transition-colors">
                          {item.title}
                        </span>
                        <ExternalLink size={16} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                Video data has been sent to the processing service. Refresh the page to see results.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Video URL: https://www.youtube.com/watch?v={videoId}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoTranscript;