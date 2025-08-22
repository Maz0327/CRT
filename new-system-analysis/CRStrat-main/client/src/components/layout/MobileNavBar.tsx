import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "../../ui-v2/hooks/useAuth";
import {
  Home,
  Globe,
  Brain,
  FileText,
  Settings,
  FolderOpen,
  PenTool,
  User,
  LogOut,
  Puzzle,
  Search,
  Radar
} from "lucide-react";

const navigation = [
  { name: "Briefing", href: "/", icon: Home },
  { name: "Signals", href: "/explore-signals", icon: Radar },
  { name: "Capture", href: "/signal-capture", icon: Puzzle },
  { name: "Brief Lab", href: "/brief-lab", icon: PenTool },
  { name: "Manage", href: "/manage", icon: FolderOpen },
];

export default function MobileNavBar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <nav className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
        
        {/* User Menu for Mobile */}
        {user && (
          <div
            onClick={() => signOut().catch(console.error)}
            className="flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
          >
            <LogOut className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Logout</span>
          </div>
        )}
      </nav>
    </div>
  );
}