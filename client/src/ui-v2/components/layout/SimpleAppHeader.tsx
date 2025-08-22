import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Search, Bell, User, ChevronDown, Plus, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AppHeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AppHeader({ title, breadcrumbs }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const [location] = useLocation();

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

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search Button */}
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Search className="w-4 h-4 md:w-5 md:h-5 text-muted-ink" />
        </button>

        {/* User Menu */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
              <User className="w-4 h-4 text-muted-ink" />
              <span className="text-sm font-medium text-ink truncate max-w-[120px]">
                {user.name || user.email}
              </span>
            </div>
            
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-ink hover:text-red-400"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        )}
      </div>
    </motion.header>
  );
}