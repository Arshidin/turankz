/**
 * useRealtimeSubscription Hook
 *
 * Sprint 11-12: Supabase real-time subscriptions for live data updates.
 * Replaces polling with WebSocket-based real-time updates.
 *
 * Usage:
 * ```tsx
 * // Subscribe to all changes on a table
 * useRealtimeSubscription('batches', {
 *   onInsert: (payload) => queryClient.invalidateQueries(['batches']),
 *   onUpdate: (payload) => queryClient.invalidateQueries(['batches']),
 *   onDelete: (payload) => queryClient.invalidateQueries(['batches']),
 * });
 *
 * // Subscribe with filter
 * useRealtimeSubscription('batches', {
 *   filter: { column: 'farmer_id', value: farmerId },
 *   onUpdate: (payload) => refetch(),
 * });
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeFilter {
  column: string;
  value: string | number;
}

interface RealtimeCallbacks<T = Record<string, unknown>> {
  /** Called when a new row is inserted */
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  /** Called when a row is updated */
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  /** Called when a row is deleted */
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  /** Called on any change (INSERT, UPDATE, DELETE) */
  onAny?: (payload: RealtimePostgresChangesPayload<T>) => void;
  /** Filter to apply to the subscription */
  filter?: RealtimeFilter;
  /** Events to listen to. Defaults to ['INSERT', 'UPDATE', 'DELETE'] */
  events?: PostgresChangeEvent[];
  /** Whether subscription is enabled. Defaults to true */
  enabled?: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Subscribe to real-time changes on a Supabase table
 *
 * @param table - The table name to subscribe to
 * @param callbacks - Callback functions and options
 * @returns Object with subscription status
 */
export function useRealtimeSubscription<T = Record<string, unknown>>(
  table: string,
  callbacks: RealtimeCallbacks<T>
): { isSubscribed: boolean } {
  const {
    onInsert,
    onUpdate,
    onDelete,
    onAny,
    filter,
    events = ['INSERT', 'UPDATE', 'DELETE'],
    enabled = true,
  } = callbacks;

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  // Memoize the change handler
  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      // Call specific handler based on event type
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload);
          break;
        case 'UPDATE':
          onUpdate?.(payload);
          break;
        case 'DELETE':
          onDelete?.(payload);
          break;
      }

      // Always call onAny if provided
      onAny?.(payload);
    },
    [onInsert, onUpdate, onDelete, onAny]
  );

  useEffect(() => {
    if (!enabled) {
      // Clean up existing subscription if disabled
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
      return;
    }

    // Build channel name
    const channelName = filter
      ? `${table}:${filter.column}:${filter.value}`
      : `${table}:all`;

    // Create channel configuration
    const channelConfig: {
      event: PostgresChangeEvent;
      schema: string;
      table: string;
      filter?: string;
    } = {
      event: events.length === 1 ? events[0] : '*',
      schema: 'public',
      table,
    };

    // Add filter if provided
    if (filter) {
      channelConfig.filter = `${filter.column}=eq.${filter.value}`;
    }

    // Create and subscribe to channel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        channelConfig as any,
        handleChange as (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
      )
      .subscribe((status) => {
        isSubscribedRef.current = status === 'SUBSCRIBED';
      });

    channelRef.current = channel;

    // Cleanup on unmount or dependency change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [table, filter?.column, filter?.value, enabled, events.join(','), handleChange]);

  return {
    isSubscribed: isSubscribedRef.current,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Subscribe to batch changes for a specific farmer
 */
export function useBatchRealtimeUpdates(
  farmerId: string | undefined,
  onUpdate: () => void,
  enabled = true
) {
  return useRealtimeSubscription('batches', {
    filter: farmerId ? { column: 'farmer_id', value: farmerId } : undefined,
    onAny: onUpdate,
    enabled: enabled && !!farmerId,
  });
}

/**
 * Subscribe to pool request changes for a specific MPK
 */
export function usePoolRequestRealtimeUpdates(
  mpkId: string | undefined,
  onUpdate: () => void,
  enabled = true
) {
  return useRealtimeSubscription('pool_requests', {
    filter: mpkId ? { column: 'mpk_id', value: mpkId } : undefined,
    onAny: onUpdate,
    enabled: enabled && !!mpkId,
  });
}

/**
 * Subscribe to execution changes
 */
export function useExecutionRealtimeUpdates(
  onUpdate: () => void,
  enabled = true
) {
  return useRealtimeSubscription('executions', {
    onAny: onUpdate,
    enabled,
  });
}

/**
 * Subscribe to matching window changes (useful for admin)
 */
export function useMatchingWindowRealtimeUpdates(
  onUpdate: () => void,
  enabled = true
) {
  return useRealtimeSubscription('matching_windows', {
    onAny: onUpdate,
    enabled,
  });
}

/**
 * Subscribe to multiple tables at once
 * Returns cleanup function
 */
export function useMultiTableRealtimeUpdates(
  tables: string[],
  onUpdate: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    const channels: RealtimeChannel[] = [];

    tables.forEach((table) => {
      const channel = supabase
        .channel(`multi:${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          onUpdate
        )
        .subscribe();

      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [tables.join(','), enabled, onUpdate]);
}
