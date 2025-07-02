

interface ResultsHeaderProps {
  count: number;
  timeRange: '24h' | '7d' | '30d' | '60d' | '90d';
  keyword: string;
}

const ResultsHeader = ({ count, timeRange, keyword }: ResultsHeaderProps) => {
  let timeText: string;
  let maxResults: number;
  
  switch (timeRange) {
    case '24h':
      timeText = 'last 24 hours';
      maxResults = 10;
      break;
    case '7d':
      timeText = 'last 7 days';
      maxResults = 30;
      break;
    case '30d':
      timeText = 'last 30 days';
      maxResults = 50;
      break;
    case '60d':
      timeText = 'last 60 days';
      maxResults = 75;
      break;
    case '90d':
      timeText = 'last 90 days';
      maxResults = 100;
      break;
    default:
      timeText = 'last 24 hours';
      maxResults = 10;
  }
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Top {Math.min(count, maxResults)} Most Viewed Videos
      </h2>
      <p className="text-gray-600">
        Showing results for "{keyword}" from the {timeText}
      </p>
    </div>
  );
};

export default ResultsHeader;

