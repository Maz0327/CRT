import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Clock, Grid, List } from "lucide-react";
import type { ContentFilters } from "@/types";

interface ContentFiltersProps {
  filters: ContentFilters;
  onFiltersChange: (filters: Partial<ContentFilters>) => void;
}

export default function ContentFilters({ filters, onFiltersChange }: ContentFiltersProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Content Trends</h2>
            <Select
              value={filters.sortBy || 'viralScore'}
              onValueChange={(value) => onFiltersChange({ sortBy: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viralScore">Sort by Trending Score</SelectItem>
                <SelectItem value="recency">Sort by Recency</SelectItem>
                <SelectItem value="engagement">Sort by Engagement</SelectItem>
                <SelectItem value="platform">Sort by Platform</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Clock className="h-4 w-4 text-gray-400" />
              <Select
                value={filters.timeRange || 'hour'}
                onValueChange={(value) => onFiltersChange({ timeRange: value })}
              >
                <SelectTrigger className="border-0 bg-transparent focus:ring-0 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Last hour</SelectItem>
                  <SelectItem value="6hours">Last 6 hours</SelectItem>
                  <SelectItem value="24hours">Last 24 hours</SelectItem>
                  <SelectItem value="week">Last week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="ghost" size="sm">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
