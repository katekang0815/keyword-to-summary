import { useState, useEffect } from 'react';
import { ExternalLink, Volume2, VolumeX } from 'lucide-react';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const handlePlaySummary = () => {
    if (!speechSynthesis || !webhookData) return;

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(webhookData.response.text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  };

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

  const parseStructuredContent = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      let trimmedLine = line.trim();
      
      // Remove markdown headers (## and #) but keep the text
      trimmedLine = trimmedLine.replace(/^#{1,2}\s*/, '');
      
      // Main headings (first line or lines that look like main titles)
      if (index === 0 || (trimmedLine.length > 0 && !trimmedLine.includes(':') && !trimmedLine.startsWith('-') && trimmedLine === trimmedLine.toUpperCase())) {
        elements.push(
          <h2 key={index} className="text-xl font-bold text-gray-900 mb-3 mt-6 first:mt-0">
            {trimmedLine}
          </h2>
        );
      }
      // Section headings (lines that end with headings style or are standalone short lines)
      else if (trimmedLine.length < 60 && !trimmedLine.includes('.') && !trimmedLine.includes(',') && !trimmedLine.includes(':')) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-gray-800 mb-2 mt-5">
            {trimmedLine}
          </h3>
        );
      }
      // List items with labels (like "Core Tools:", "Advanced Tools:")
      else if (trimmedLine.includes(':') && trimmedLine.split(':')[0].length < 30) {
        const [label, content] = trimmedLine.split(':');
        elements.push(
          <div key={index} className="mb-2">
            <span className="font-semibold text-gray-800">{label.trim()}:</span>
            <span className="text-gray-700 ml-1">{content.trim()}</span>
          </div>
        );
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={index} className="text-gray-700 leading-relaxed mb-3">
            {trimmedLine}
          </p>
        );
      }
    });
    
    return elements;
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  📌 Summary:
                </h3>
                <button
                  onClick={handlePlaySummary}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                  disabled={!speechSynthesis}
                >
                  {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  {isPlaying ? 'Stop' : 'Listen'}
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                {parseStructuredContent(webhookData.response.text)}
              </div>
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