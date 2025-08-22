import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useTour } from "@/components/onboarding/OnboardingTour";
import {
  Home,
  Globe,
  Brain,
  FileText,
  Settings,
  Puzzle,
  TrendingUp,
  FolderOpen,
  PenTool,
  User,
  LogOut,
  Search,
  Target,
  Radar
} from "lucide-react";

const navigation = [
  { name: "Today's Briefing", href: "/", icon: Home },
  { name: "Explore Signals", href: "/explore-signals", icon: Radar },
  { name: "New Signal Capture", href: "/signal-capture", icon: Puzzle },
  { name: "Strategic Brief Lab", href: "/brief-lab", icon: PenTool },
  { name: "Manage", href: "/manage", icon: FolderOpen },
];

export default function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { startTour } = useTour();

  return (
    <nav className="hidden lg:flex items-center space-x-4">
      {navigation.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;
        
        return (
          <Link key={item.name} href={item.href}>
            <div
              data-tour={item.name.toLowerCase().replace(/\s+/g, '-')}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover-lift",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden xl:inline">{item.name}</span>
            </div>
          </Link>
        );
      })}
      
      {/* Chrome Extension Status */}
      <div className="ml-4 pl-4 border-l border-gray-200" data-tour="extension-status">
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 animate-pulse-scale">
          <Puzzle className="h-3 w-3 mr-1" />
          <span className="hidden xl:inline">Extension</span>
        </Badge>
      </div>
      
      {/* User Menu */}
      {user && (
        <div className="ml-4 pl-4 border-l border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={startTour} className="cursor-pointer">
                <Puzzle className="mr-2 h-4 w-4" />
                <span>Take Tour</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </nav>
  );
}