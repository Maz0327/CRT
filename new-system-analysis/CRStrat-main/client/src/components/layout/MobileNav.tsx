import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Globe,
  Brain,
  FileText,
  Settings,
  Menu,
  X,
  Puzzle
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Intelligence", href: "/intelligence", icon: Globe },
  { name: "Analysis", href: "/analysis", icon: Brain },
  { name: "Briefs", href: "/briefs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MobileNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="lg:hidden">
        {/* Mobile Menu Button */}
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setOpen(false)}
        >
          {/* Slide-out Panel */}
          <div 
            className="fixed left-0 top-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <i className="fas fa-radar-chart text-white text-sm"></i>
                  </div>
                  <h2 className="text-lg font-semibold">Content Radar</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4">
                <div className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link key={item.name} href={item.href}>
                        <div
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Extension Status */}
                <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 text-sm">
                    <Puzzle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 font-medium">Chrome Extension</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Active & Connected</p>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t">
                <div className="text-xs text-gray-500 text-center">
                  Strategic Intelligence Platform
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
      <Menu className="h-5 w-5" />
    </Button>
  );
}