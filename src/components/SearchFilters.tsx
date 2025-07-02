
import { SearchParams } from '@/services/youtubeService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchFiltersProps {
  params: SearchParams;
  onParamsChange: (params: SearchParams) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const SearchFilters = ({ params, onParamsChange, onSearch, isLoading }: SearchFiltersProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Search YouTube Videos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keyword
          </label>
          <Input
            type="text"
            placeholder="Enter search keyword..."
            value={params.keyword}
            onChange={(e) => onParamsChange({ ...params, keyword: e.target.value })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <Select 
            value={params.timeRange} 
            onValueChange={(value: '24h' | '7d') => onParamsChange({ ...params, timeRange: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <Select 
            value={params.language} 
            onValueChange={(value: 'en' | 'ko' | 'both') => onParamsChange({ ...params, language: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Both English & Korean</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ko">Korean</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          onClick={onSearch}
          disabled={!params.keyword.trim() || isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8"
        >
          {isLoading ? 'Searching...' : 'Search Videos'}
        </Button>
      </div>
    </div>
  );
};

export default SearchFilters;
