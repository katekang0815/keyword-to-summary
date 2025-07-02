
import { useParams, useLocation, Link } from 'react-router-dom';
import { VideoResult, fetchVideoDetails, formatViewCount, formatDuration } from '@/services/youtubeService';
import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [videoDetails, setVideoDetails] = useState<VideoResult | null>(null);
  
  // Get video data from navigation state if available
  const videoFromState = location.state?.video as VideoResult;

  useEffect(() => {
    if (id && !videoFromState) {
      // In the future, fetch video details from API using the ID
      fetchVideoDetails(id).then(setVideoDetails);
    }
  }, [id, videoFromState]);

  const video = videoFromState || videoDetails;

  if (!video && !videoFromState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Video not found or loading...</p>
          <Link 
            to="/" 
            className="text-orange-500 hover:text-orange-600 flex items-center gap-2 justify-center"
          >
            <ArrowLeft size={16} />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const handleWatchOnYouTube = () => {
    if (video) {
      window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
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

  if (!video) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Search
        </Link>

        {/* Video Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Thumbnail */}
          <div className="relative">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white text-sm px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-medium">{video.channelTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{formatViewCount(video.viewCount)} views</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{formatTimeAgo(video.publishedAt)}</span>
              </div>
            </div>

            {/* Watch on YouTube Button */}
            <button
              onClick={handleWatchOnYouTube}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              <ExternalLink size={18} />
              Watch on YouTube
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
