import { useState } from "react"
import { 
  Activity, 
  Radar, 
  Plus, 
  FlaskConical, 
  Settings,
  TrendingUp,
  Search,
  Brain,
  Target,
  Users,
  Tag,
  Globe,
  Database
} from "lucide-react"
import { Link, useLocation } from "wouter"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../components/ui/sidebar"

const mainItems = [
  { title: "Today's Briefing", url: "/", icon: Activity },
  { title: "Explore Signals", url: "/explore", icon: Radar },
  { title: "New Signal Capture", url: "/capture", icon: Plus },
  { title: "Strategic Brief Lab", url: "/lab", icon: FlaskConical },
  { title: "Projects", url: "/projects", icon: Target },
]

const analyticsItems = [
  { title: "Trend Analysis", url: "/trends", icon: TrendingUp },
  { title: "Signal Search", url: "/search", icon: Search },
  { title: "AI Insights", url: "/insights", icon: Brain },
  { title: "Data Sources", url: "/data-sources", icon: Database },
]

const strategicItems = [
  { title: "Client Profiles", url: "/client-profiles", icon: Users },
  { title: "DSD Brief Builder", url: "/dsd-brief-builder", icon: FlaskConical },
  { title: "Capture Tagging", url: "/capture-tagging", icon: Tag },
  { title: "Truth Analysis", url: "/truth-analysis", icon: Brain },
  { title: "Hypothesis Tracking", url: "/hypothesis-tracking", icon: Target },
  { title: "Cultural Moments", url: "/cultural-moments", icon: Globe },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const [location] = useLocation()
  const currentPath = location
  const collapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-60"} transition-smooth`}
      style={{ 
        backgroundColor: 'var(--sidebar-background)', 
        borderColor: 'var(--sidebar-border)' 
      }}
      collapsible="icon"
    >
      <SidebarContent style={{ backgroundColor: 'var(--sidebar-background)' }}>
        {/* Logo Section */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Radar className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--sidebar-foreground)' }}>TrendFinder</h1>
                <p className="text-xs" style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}>Content Radar</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium" style={{ color: 'var(--sidebar-foreground)', opacity: 0.8 }}>
            Strategic Intelligence
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth"
                      style={{
                        backgroundColor: isActive(item.url) ? 'var(--sidebar-accent)' : 'transparent',
                        color: isActive(item.url) ? 'var(--sidebar-primary)' : 'var(--sidebar-foreground)',
                        fontWeight: isActive(item.url) ? 'bold' : 'normal'
                      }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: 'var(--sidebar-primary)' }} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium" style={{ color: 'var(--sidebar-foreground)', opacity: 0.8 }}>
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth"
                      style={{
                        backgroundColor: isActive(item.url) ? 'var(--sidebar-accent)' : 'transparent',
                        color: isActive(item.url) ? 'var(--sidebar-primary)' : 'var(--sidebar-foreground)',
                        fontWeight: isActive(item.url) ? 'bold' : 'normal'
                      }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: 'var(--sidebar-primary)' }} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Strategic Intelligence Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium" style={{ color: 'var(--sidebar-foreground)', opacity: 0.8 }}>
            Strategic Intelligence
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {strategicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth"
                      style={{
                        backgroundColor: isActive(item.url) ? 'var(--sidebar-accent)' : 'transparent',
                        color: isActive(item.url) ? 'var(--sidebar-primary)' : 'var(--sidebar-foreground)',
                        fontWeight: isActive(item.url) ? 'bold' : 'normal'
                      }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: 'var(--sidebar-primary)' }} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth"
                    style={{
                      backgroundColor: isActive('/settings') ? 'var(--sidebar-accent)' : 'transparent',
                      color: isActive('/settings') ? 'var(--sidebar-primary)' : 'var(--sidebar-foreground)',
                      fontWeight: isActive('/settings') ? 'bold' : 'normal'
                    }}
                  >
                    <Settings className="w-4 h-4" style={{ color: 'var(--sidebar-primary)' }} />
                    {!collapsed && <span>Settings</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}