import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

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
  const [webhookData, setWebhookData] = useState<WebhookResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWebhookData = async () => {
      try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        const response = await fetch('https://yehsun.app.n8n.cloud/webhook-test/summaryapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: videoUrl }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setWebhookData(data);
        }
      } catch (error) {
        console.error('Failed to fetch webhook data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebhookData();
  }, [videoId]);

  const handleRelatedVideoClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
      <div className="px-6 py-6">
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
              Failed to load analysis results. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTranscript;