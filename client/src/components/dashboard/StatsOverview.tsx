import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Flame, Globe, Star, Brain, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn, StaggeredFadeIn } from "@/components/ui/fade-in";

import type { DashboardStats } from '@/types/dashboard';

interface StatsOverviewProps {
  stats?: DashboardStats;
  variant?: 'dashboard' | 'strategic';
}

export default function StatsOverview({ stats, variant = 'dashboard' }: StatsOverviewProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatCards = () => {
    if (variant === 'strategic') {
      return [
        {
          title: "Content Signals",
          value: stats.totalTrends,
          change: "+12%",
          changeLabel: "from last hour",
          icon: TrendingUp,
          bgColor: "bg-blue-100 dark:bg-blue-900/20",
          iconColor: "text-blue-600",
        },
        {
          title: "Truth Analyzed",
          value: stats?.truthAnalyzed ?? 0,
          change: "+25%",
          changeLabel: "depth insights",
          icon: Brain,
          bgColor: "bg-purple-100 dark:bg-purple-900/20",
          iconColor: "text-purple-600",
        },
        {
          title: "Cultural Moments",
          value: stats.activeSources,
          change: "4 trending",
          changeLabel: "viral potential",
          icon: Flame,
          bgColor: "bg-orange-100 dark:bg-orange-900/20",
          iconColor: "text-orange-600",
        },
        {
          title: "Hypotheses",
          value: stats?.hypothesesTracked ?? 0,
          change: "85%",
          changeLabel: "accuracy rate",
          icon: Target,
          bgColor: "bg-green-100 dark:bg-green-900/20",
          iconColor: "text-green-600",
        },
      ];
    }

    return [
      {
        title: "Total Trends",
        value: stats.totalTrends,
        change: "+12%",
        changeLabel: "from last hour",
        icon: TrendingUp,
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
        iconColor: "text-blue-600",
      },
      {
        title: "Viral Potential",
        value: stats.viralPotential,
        change: "+25%",
        changeLabel: "high-scoring content",
        icon: Flame,
        bgColor: "bg-orange-100 dark:bg-orange-900/20",
        iconColor: "text-orange-600",
      },
      {
        title: "Active Sources",
        value: stats.activeSources,
        change: "All platforms online",
        changeLabel: "",
        icon: Globe,
        bgColor: "bg-green-100 dark:bg-green-900/20",
        iconColor: "text-green-600",
      },
      {
        title: "Avg. Score",
        value: stats.avgScore,
        change: "+0.8",
        changeLabel: "from yesterday",
        icon: Star,
        bgColor: "bg-purple-100 dark:bg-purple-900/20",
        iconColor: "text-purple-600",
      },
    ];
  };

  const statCards = getStatCards();

  return (
    <FadeIn>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StaggeredFadeIn staggerDelay={50}>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-transparent hover:border-l-blue-500"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                    <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
                      <Icon className={`${stat.iconColor} h-5 w-5`} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <span className="text-green-600 font-medium">{stat.change}</span>
                    {stat.changeLabel && (
                      <span className="text-gray-600 dark:text-gray-400 ml-1">{stat.changeLabel}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </StaggeredFadeIn>
      </div>
    </FadeIn>
  );
}