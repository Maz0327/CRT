import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Search, Bell, User, ChevronDown, Plus, Folder, Menu, X } from 'lucide-react';
import { 
  Home, 
  Inbox, 
  Radar, 
  FileText, 
  Rss, 
  Settings,
  FolderOpen
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../../../components/ui/sheet';
import { ProjectSwitcher } from './ProjectSwitcher';
import { PopoverMenu, PopoverMenuItem } from '../primitives/PopoverMenu';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../primitives/ThemeToggle';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/captures', icon: Inbox, label: 'Captures' },
  { to: '/moments', icon: Radar, label: 'Moments' },
  { to: '/briefs', icon: FileText, label: 'Briefs' },
  { to: '/feeds', icon: Rss, label: 'Feeds' },
  { to: '/truth-lab', icon: Search, label: 'Truth Lab' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface AppHeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AppHeader({ title, breadcrumbs }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      className="glass-header sticky top-0 z-50 h-14 md:h-16 px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4 min-w-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-ink truncate">Content Radar</h1>
          <div className="hidden sm:block">
            <ProjectSwitcher />
          </div>
        </div>
        
        {breadcrumbs && (
          <nav className="hidden lg:flex items-center gap-2 text-sm text-muted-ink min-w-0">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-ink transition-colors truncate">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-ink truncate">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}
        
        {title && !breadcrumbs && (
          <h2 className="hidden lg:block text-sm font-medium text-muted-ink truncate max-w-[200px]">{title}</h2>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location === item.to || 
              (item.to !== '/' && location && location.startsWith(item.to));
            
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  'relative flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap min-h-[40px] flex-shrink-0',
                  'hover:bg-white/10 transition-colors',
                  isActive
                    ? 'text-ink bg-white/10' 
                    : 'text-muted-ink hover:text-ink'
                )}
              >
                <item.icon className="w-4 h-4 stroke-1 flex-shrink-0 text-ink" />
                <span className="hidden lg:block">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-blue-500/20 rounded-lg border border-blue-500/30"
                    layoutId="activeNavItem"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Burger Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px]">
              <Menu className="w-5 h-5 stroke-1 text-ink" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-[280px] frost-card frost-strong p-0 md:hidden">
            <div className="flex flex-col h-full overflow-y-auto px-4">
              {/* Header */}
              <div className="flex items-center justify-between py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-ink">Content Radar</h2>
                <SheetClose asChild>
                  <button className="p-1.5 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                    <X className="w-4 h-4 stroke-1 text-ink" />
                  </button>
                </SheetClose>
              </div>

              {/* Project Switcher */}
              <div className="py-3 border-b border-white/10">
                <ProjectSwitcher />
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = location === item.to || 
                    (item.to !== '/' && location && location.startsWith(item.to));
                  
                  return (
                    <SheetClose key={item.to} asChild>
                      <Link
                        href={item.to}
                       className={cn(
                         'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-sm min-h-[44px]',
                         'hover:bg-white/10',
                         'text-left font-medium',
                         isActive 
                           ? 'text-ink bg-white/10 border border-blue-500/30' 
                           : 'text-muted-ink hover:text-ink'
                       )}
                      >
                       <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              {/* User Menu */}
              <div className="py-3 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name || user.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 frost-subtle rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 stroke-1" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
                    <div className="text-xs text-ink/70 truncate">{user?.email}</div>
                  </div>
                </div>
                <SheetClose asChild>
                  <button
                    onClick={() => signOut().catch(console.error)}
                    className="w-full px-3 py-2 glass rounded-lg hover:frost-subtle transition-colors text-sm"
                  >
                    Sign Out
                  </button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-1.5 md:p-2 flex items-center justify-center hover:frost-subtle rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[36px] min-w-[36px] md:min-h-[40px] md:min-w-[40px]">
            <Search className="w-4 h-4 stroke-1" />
          </button>
          
          <button className="p-1.5 md:p-2 flex items-center justify-center hover:frost-subtle rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 relative min-h-[36px] min-w-[36px] md:min-h-[40px] md:min-w-[40px]">
            <Bell className="w-4 h-4 stroke-1" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full glass-border"></span>
          </button>
          
          <ThemeToggle />
          
          <div className="hidden md:block">
            <PopoverMenu
              trigger={
                <button className="flex items-center gap-1 md:gap-2 p-2 hover:frost-subtle rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[40px]">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name || user.email}
                      className="w-6 h-6 rounded-full border border-white/20"
                    />
                  ) : (
                    <User className="w-4 h-4 stroke-1" />
                  )}
                  <span className="text-sm hidden xl:block truncate max-w-[120px] font-medium">{user?.name || user?.email}</span>
                </button>
              }

            >
              <PopoverMenuItem icon={<User className="w-4 h-4" />}>
                Profile
              </PopoverMenuItem>
              <PopoverMenuItem icon={<Settings className="w-4 h-4" />}>
                Settings
              </PopoverMenuItem>
              <div className="border-t border-white/10 my-2"></div>
              <PopoverMenuItem 
                onClick={() => {/* Sign out in mock mode */}}
              >
                Sign Out
              </PopoverMenuItem>
            </PopoverMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
}