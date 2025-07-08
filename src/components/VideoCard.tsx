
import { VideoResult, formatViewCount, formatDuration } from '@/services/youtubeService';
import { useNavigate } from 'react-router-dom';

interface VideoCardProps {
  video: VideoResult;
  rank: number;
}

const VideoCard = ({ video, rank }: VideoCardProps) => {
  const navigate = useNavigate();

  const handleVideoClick = async () => {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
      
      // Send video URL to webhook
      const response = await fetch('https://yehsun.app.n8n.cloud/webhook-test/summaryapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });
      
      if (response.ok) {
        const webhookData = await response.json();
        // Store webhook response for this video
        sessionStorage.setItem(`webhook_${video.id}`, JSON.stringify(webhookData));
      }
      
      // Navigate to detail page with video data
      navigate(`/videos/${video.id}`, { state: { video } });
    } catch (error) {
      console.error('Failed to send video URL to webhook:', error);
      // Still navigate even if webhook fails
      navigate(`/videos/${video.id}`, { state: { video } });
    }
  };

  const formatTimeAgo = (publishedAt: string) => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleVideoClick}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="relative">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-40 h-24 object-cover rounded-lg"
            />
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {rank}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight mb-2">
                {video.title}
              </h3>
              
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="font-medium">{video.channelTitle}</span>
                <span>{formatViewCount(video.viewCount)} views</span>
                <span>{formatTimeAgo(video.publishedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
