import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FileDown, FileText, Settings, RefreshCw, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ContentFilters } from "@/types";

interface SidebarProps {
  filters: ContentFilters;
  onFiltersChange: (filters: Partial<ContentFilters>) => void;
}

const categories = [
  { id: 'all', label: 'All Categories', count: 247 },
  { id: 'pop-culture', label: 'Pop Culture', count: 89 },
  { id: 'technology', label: 'Technology', count: 76 },
  { id: 'business', label: 'Business', count: 52 },
  { id: 'sports', label: 'Sports', count: 30 },
];

const platforms = [
  { id: 'reddit', label: 'Reddit', icon: 'fab fa-reddit', color: 'text-orange-500' },
  { id: 'youtube', label: 'YouTube', icon: 'fab fa-youtube', color: 'text-red-500' },
  { id: 'news', label: 'News APIs', icon: 'fas fa-newspaper', color: 'text-gray-500' },
  { id: 'twitter', label: 'X (Twitter)', icon: 'fab fa-x-twitter', color: 'text-gray-900' },
];

export default function Sidebar({ filters, onFiltersChange }: SidebarProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['reddit', 'youtube', 'news']);
  const { toast } = useToast();

  const manualScanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/content/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Scan failed');
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: result.success ? "Scan Complete" : "Scan Issues",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Unable to run content scan",
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (format: 'json' | 'csv') => {
      const response = await api.post<{ url: string }>('/api/export', { format });
      return { data: (response as { url: string }).url, format };
    },
    onSuccess: ({ data, format }) => {
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-radar-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: `Data exported as ${format.toUpperCase()}`,
      });
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({ category: categoryId });
  };

  const handlePlatformToggle = (platformId: string) => {
    const newPlatforms = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter(p => p !== platformId)
      : [...selectedPlatforms, platformId];
    
    setSelectedPlatforms(newPlatforms);
    onFiltersChange({ platform: newPlatforms.join(',') });
  };

  return (
    <aside className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 fixed left-0 top-0 bottom-0 overflow-y-auto pt-16">
      <div className="p-6">
        {/* Category Filters */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox
                  checked={filters.category === category.id}
                  onCheckedChange={() => handleCategoryChange(category.id)}
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                  {category.label}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </label>
            ))}
          </div>
        </div>

        {/* Platform Filters */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Platforms</h3>
          <div className="space-y-2">
            {platforms.map((platform) => (
              <label key={platform.id} className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox
                  checked={selectedPlatforms.includes(platform.id)}
                  onCheckedChange={() => handlePlatformToggle(platform.id)}
                />
                <i className={`${platform.icon} ${platform.color}`}></i>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {platform.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Content Scanning Section */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Content Discovery</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-900 mb-1">Manual Scan</div>
              <div className="text-xs text-blue-700 mb-3">
                Scan selected platforms for trending content
              </div>
              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => manualScanMutation.mutate()}
                disabled={manualScanMutation.isPending}
              >
                {manualScanMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Scan Now
                  </>
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-2">
              💡 Automated scanning is disabled to save costs. Use "Scan Now" when you want fresh content.
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Export</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => exportMutation.mutate('csv')}
              disabled={exportMutation.isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => exportMutation.mutate('json')}
              disabled={exportMutation.isPending}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
