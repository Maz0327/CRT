import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Bell, Play, Search, Loader2, Plus, Sparkles, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "../hooks/use-toast";
import Navigation from "@/components/layout/Navigation";
import MobileNav from "@/components/layout/MobileNav";

interface HeaderProps {
  onRefresh: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  type ScheduleStatus = { isRunning: boolean; lastRun?: string; nextRun?: string };
  
  const { data: scheduleStatus } = useQuery<ScheduleStatus>({
    queryKey: ['/api/schedule/status'],
    queryFn: () => api.get<ScheduleStatus>('/api/schedule/status'),
    refetchInterval: 5000,
  });

  type ScanResult = { success: boolean; itemsProcessed: number; errors: any[] };

  const runScanMutation = useMutation({
    mutationFn: () => api.post<ScanResult>('/api/scan/run'),
    onSuccess: (result) => {
      toast({
        title: "Scan completed",
        description: `Processed ${result.itemsProcessed} items${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`,
        variant: result.success ? "default" : "destructive",
      });
      onRefresh();
    },
    onError: () => {
      toast({
        title: "Scan failed",
        description: "Unable to run content scan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log("Search:", searchQuery);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu */}
            <MobileNav />
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-radar-chart text-white text-sm"></i>
              </div>
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                <span className="hidden sm:inline">Content Radar</span>
                <span className="sm:hidden">Radar</span>
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="ml-8">
              <Navigation />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Search - Hidden on mobile */}
            <form onSubmit={handleSearch} className="relative hidden xl:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search trends, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-60 xl:w-80 transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </form>
            
            {/* Search button for mobile/tablet */}
            <Button variant="ghost" size="sm" className="xl:hidden hover-lift">
              <Search className="h-4 w-4" />
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover-lift">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
            
            {/* Quick Capture Button */}
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 hover-lift border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => window.open('/my-captures', '_self')}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Capture</span>
            </Button>

            {/* Google API Status */}
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 animate-pulse-scale">
              <Sparkles className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Google AI</span>
            </Badge>

            {/* Run Scan Button */}
            <Button 
              onClick={() => runScanMutation.mutate()}
              disabled={runScanMutation.isPending}
              size="sm"
              className="flex items-center space-x-2 hover-lift"
            >
              {runScanMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {runScanMutation.isPending ? "Scanning..." : "Run Scan"}
              </span>
            </Button>
            
            {/* User Avatar */}
            <Avatar className="h-8 w-8 hover-lift cursor-pointer transition-all duration-200">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
