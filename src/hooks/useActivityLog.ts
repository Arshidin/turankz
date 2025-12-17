import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ActivityEventType =
  | 'farmer_onboarded'
  | 'farmer_grading_changed'
  | 'farmer_restricted'
  | 'farmer_unrestricted'
  | 'mpk_onboarded'
  | 'mpk_status_changed'
  | 'mpk_restricted'
  | 'mpk_unrestricted'
  | 'pool_request_created'
  | 'pool_request_updated'
  | 'pool_request_cancelled'
  | 'pool_match_proposed'
  | 'pool_match_confirmed'
  | 'batch_confirmed'
  | 'batch_declined'
  | 'invitation_sent'
  | 'invitation_accepted'
  | 'invitation_declined';

export type ActorRole = 'farmer' | 'mpk' | 'admin' | 'system';
export type TargetType = 'farmer' | 'mpk' | 'batch' | 'pool_request' | 'pool_match';

export interface ActivityLogEntry {
  id: string;
  event_type: ActivityEventType;
  actor_role: ActorRole;
  actor_name: string | null;
  target_type: TargetType | null;
  target_id: string | null;
  target_name: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ActivityLogFilters {
  eventType?: ActivityEventType;
  actorRole?: ActorRole;
  startDate?: string;
  endDate?: string;
}

export function useActivityLog(filters?: ActivityLogFilters) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters?.actorRole) {
        query = query.eq('actor_role', filters.actorRole);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setEntries((data as ActivityLogEntry[]) || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.eventType, filters?.actorRole, filters?.startDate, filters?.endDate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    isLoading,
    error,
    refetch: fetchEntries,
  };
}

// Helper to log activity (used by other hooks and components)
export async function logActivity(params: {
  event_type: ActivityEventType;
  actor_role: ActorRole;
  actor_name?: string;
  target_type?: TargetType;
  target_id?: string;
  target_name?: string;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  // Cast to any to handle enum type mismatch with Supabase generated types
  const { error } = await supabase.from('activity_log').insert({
    event_type: params.event_type as string,
    actor_role: params.actor_role,
    actor_name: params.actor_name || null,
    target_type: params.target_type || null,
    target_id: params.target_id || null,
    target_name: params.target_name || null,
    description: params.description,
    metadata: params.metadata || null,
  } as any);

  if (error) {
    console.error('Failed to log activity:', error);
    throw error;
  }
}

// Event type labels for display
export const EVENT_TYPE_LABELS: Record<ActivityEventType, string> = {
  farmer_onboarded: 'Farmer Onboarded',
  farmer_grading_changed: 'Grading Changed',
  farmer_restricted: 'Farmer Restricted',
  farmer_unrestricted: 'Farmer Unrestricted',
  mpk_onboarded: 'MPK Onboarded',
  mpk_status_changed: 'MPK Status Changed',
  mpk_restricted: 'MPK Restricted',
  mpk_unrestricted: 'MPK Unrestricted',
  pool_request_created: 'Request Created',
  pool_request_updated: 'Request Updated',
  pool_request_cancelled: 'Request Cancelled',
  pool_match_proposed: 'Match Proposed',
  pool_match_confirmed: 'Match Confirmed',
  batch_confirmed: 'Batch Confirmed',
  batch_declined: 'Batch Declined',
  invitation_sent: 'Invitation Sent',
  invitation_accepted: 'Invitation Accepted',
  invitation_declined: 'Invitation Declined',
};

export const ACTOR_ROLE_LABELS: Record<ActorRole, string> = {
  farmer: 'Farmer',
  mpk: 'MPK',
  admin: 'Admin',
  system: 'System',
};
