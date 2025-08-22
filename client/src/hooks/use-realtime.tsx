import { useEffect, useState } from 'react';
import { realtimeService } from '../services/supabase-realtime';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@shared/supabase-client';

export function useRealtimeCaptures() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const channel = realtimeService.subscribeToCaptureUpdates(
      // On new capture
      (capture) => {
        queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
        
        if (capture.viral_score && capture.viral_score >= 80) {
          toast({
            title: "🔥 Viral Content Detected!",
            description: `New high-scoring content: ${capture.title}`,
            variant: "default",
          });
        }
      },
      // On update
      (capture) => {
        queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
        queryClient.invalidateQueries({ queryKey: ['/api/captures', capture.id] });
      },
      // On delete
      (id) => {
        queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
        queryClient.removeQueries({ queryKey: ['/api/captures', id] });
      }
    );

    return () => {
      realtimeService.unsubscribe('captures');
    };
  }, [queryClient, toast]);
}

export function useRealtimeCulturalMoments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = realtimeService.subscribeToCulturalMoments(
      (moment) => {
        queryClient.invalidateQueries({ queryKey: ['/api/cultural-moments'] });
        
        toast({
          title: "🌊 Cultural Moment Emerging!",
          description: `${moment.title}: ${moment.description}`,
          variant: "default",
        });
      }
    );

    return () => {
      realtimeService.unsubscribe('cultural-moments');
    };
  }, [queryClient, toast]);
}

export function useRealtimeBriefs() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const channel = realtimeService.subscribeToBriefUpdates(
      user.id,
      (brief) => {
        queryClient.invalidateQueries({ queryKey: ['/api/briefs'] });
        queryClient.invalidateQueries({ queryKey: ['/api/briefs', brief.id] });
        
        toast({
          title: "📋 Brief Updated",
          description: `${brief.title} has been updated`,
          variant: "default",
        });
      }
    );

    return () => {
      realtimeService.unsubscribe(`briefs-${user.id}`);
    };
  }, [user, queryClient, toast]);
}

export function usePresence(room: string) {
  const { user } = useSupabaseAuth();
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const userInfo = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email?.split('@')[0],
      avatar: user.user_metadata?.avatar_url,
      online_at: new Date().toISOString(),
    };

    const channel = realtimeService.subscribeToPresence(
      room,
      user.id,
      userInfo,
      setOnlineUsers
    );

    return () => {
      realtimeService.unsubscribe(`presence-${room}`);
    };
  }, [room, user]);

  return { onlineUsers };
}

// Hook for real-time collaboration on specific content
export function useContentCollaboration(contentId: string) {
  const { user } = useSupabaseAuth();
  const [activeEditors, setActiveEditors] = useState<any[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !contentId) return;

    // Join collaboration room
    const roomName = `content-${contentId}`;
    const userInfo = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email?.split('@')[0],
      editing: true,
      cursor: null,
    };

    const channel = realtimeService.subscribeToPresence(
      roomName,
      user.id,
      userInfo,
      setActiveEditors
    );

    // Listen for live updates
    const updateChannel = supabase
      .channel(`content-updates-${contentId}`)
      .on('broadcast', { event: 'content-update' }, (payload) => {
        setLiveUpdates((prev) => [...prev, payload.payload]);
      })
      .subscribe();

    return () => {
      realtimeService.unsubscribe(`presence-${roomName}`);
      supabase.removeChannel(updateChannel);
    };
  }, [contentId, user]);

  const broadcastUpdate = (update: any) => {
    realtimeService.broadcastEvent(
      `content-updates-${contentId}`,
      'content-update',
      {
        userId: user?.id,
        update,
        timestamp: new Date().toISOString(),
      }
    );
  };

  return {
    activeEditors,
    liveUpdates,
    broadcastUpdate,
  };
}

// Hook for real-time dashboard metrics
export function useRealtimeDashboard() {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    capturesProcessing: 0,
    viralDetections: 0,
  });

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-metrics')
      .on('broadcast', { event: 'metrics-update' }, (payload) => {
        setMetrics(payload.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return metrics;
}