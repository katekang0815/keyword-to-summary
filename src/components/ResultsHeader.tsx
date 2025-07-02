
interface ResultsHeaderProps {
  count: number;
  timeRange: '24h' | '7d';
  keyword: string;
}

const ResultsHeader = ({ count, timeRange, keyword }: ResultsHeaderProps) => {
  const timeText = timeRange === '24h' ? 'last 24 hours' : 'last 7 days';
  const maxResults = timeRange === '24h' ? 10 : 30;
  
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
