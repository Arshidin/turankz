import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/contexts/RoleContext';

export type NotificationType = 
  | 'pool_invitation'
  | 'batch_action_required'
  | 'batch_status_changed'
  | 'grading_updated'
  | 'request_status_changed'
  | 'watchlist_supply_added'
  | 'matching_window_approaching'
  | 'request_at_risk'
  | 'farmer_declined'
  | 'request_stalled'
  | 'reliability_dropped';

export interface Notification {
  id: string;
  user_role: 'farmer' | 'mpk' | 'admin';
  target_id: string | null;
  notification_type: NotificationType;
  title: string;
  description: string;
  link_to: string | null;
  is_read: boolean;
  is_urgent: boolean;
  created_at: string;
}

export function useNotifications() {
  const { role } = useRole();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!role) return;
    
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_role', role)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setNotifications((data as Notification[]) || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!role) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_role=eq.${role}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (updateError) throw updateError;
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!role) return;
    
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_role', role)
        .eq('is_read', false);

      if (updateError) throw updateError;
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [role]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const urgentCount = notifications.filter((n) => n.is_urgent && !n.is_read).length;

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    urgentCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

// Helper to create notifications (used by other hooks)
export async function createNotification(params: {
  user_role: 'farmer' | 'mpk' | 'admin';
  target_id?: string;
  notification_type: NotificationType;
  title: string;
  description: string;
  link_to?: string;
  is_urgent?: boolean;
}) {
  const { error } = await supabase.from('notifications').insert({
    user_role: params.user_role,
    target_id: params.target_id || null,
    notification_type: params.notification_type,
    title: params.title,
    description: params.description,
    link_to: params.link_to || null,
    is_urgent: params.is_urgent || false,
  });

  if (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}
