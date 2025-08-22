// client/src/components/layout/AppLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NavItem: React.FC<{ to: string; label: string; onClick?: () => void }> = ({ to, label, onClick }) => {
  const [location] = useLocation();
  const isActive = location === to || (to !== '/' && location.startsWith(to));
  
  return (
    <Link href={to} onClick={onClick}>
      <a className={`rounded-full px-3 py-1.5 text-sm hover:bg-white/10 transition no-underline ${
        isActive ? 'bg-white/10 text-foreground font-medium' : 'text-foreground/70'
      }`}>
        {label}
      </a>
    </Link>
  );
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const toggle = () => setCollapsed(!collapsed);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Apple-inspired glass header */}
      <header className="sticky top-0 z-50 glass h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <a className="font-semibold tracking-wide text-foreground">
              Content Radar
            </a>
          </Link>
          <button
            onClick={toggle}
            className="glass rounded-full px-3 py-1.5 text-sm transition hover:bg-white/10"
            aria-label="Toggle sidebar"
          >
            {collapsed ? '☰' : '×'}
          </button>
        </div>
        <nav className="flex items-center gap-1">
          <NavItem to="/captures-inbox" label="Captures" />
          <NavItem to="/moments-radar" label="Moments" />
          <NavItem to="/brief-builder-v2" label="Brief Builder" />
          <NavItem to="/feeds" label="Feeds" />
          <NavItem to="/settings" label="Settings" />
          <ThemeToggle />
        </nav>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`h-[calc(100vh-56px)] shrink-0 border-r border-zinc-800 bg-zinc-900 p-3 transition-all ${
            collapsed ? 'w-[56px]' : 'w-64'
          }`}
        >
          {!collapsed && (
            <div className="mb-3">
              <div className="rounded-md border border-zinc-700 bg-zinc-950 p-2">
                <div className="text-xs uppercase tracking-wide text-zinc-400">Strategic Intelligence</div>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/captures-inbox" label="Captures Inbox" />
            <NavItem to="/feeds" label="Feeds" />
            <NavItem to="/settings" label="Settings" />
          </nav>
        </aside>

        {/* Content */}
        <main className="max-w-7xl mx-auto p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
};