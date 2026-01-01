import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentMpk } from './useCurrentMpk';

export interface WatchlistItem {
  id: string;
  mpk_id: string;
  region: string;
  target_month: string | null;
  target_week: string;
  min_volume: number | null;
  notes: string | null;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch watchlist items for the current MPK
 */
export function useWatchlist() {
  const { data: currentMpk } = useCurrentMpk();
  const mpkId = currentMpk?.id;

  return useQuery({
    queryKey: ['watchlist', mpkId],
    queryFn: async () => {
      if (!mpkId) return [];

      const { data, error } = await supabase
        .from('mpk_watchlist')
        .select('*')
        .eq('mpk_id', mpkId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WatchlistItem[];
    },
    enabled: !!mpkId,
  });
}

/**
 * Hook to add an item to watchlist
 */
export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  const { data: currentMpk } = useCurrentMpk();
  const mpkId = currentMpk?.id;

  return useMutation({
    mutationFn: async (item: {
      region: string;
      target_month: string;
      target_week: string;
      min_volume?: number;
      notes?: string;
    }) => {
      if (!mpkId) throw new Error('MPK not found');

      const { data, error } = await supabase
        .from('mpk_watchlist')
        .insert({
          mpk_id: mpkId,
          region: item.region,
          target_month: item.target_month,
          target_week: item.target_week,
          min_volume: item.min_volume || null,
          notes: item.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WatchlistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', mpkId] });
    },
  });
}

/**
 * Hook to remove an item from watchlist
 */
export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  const { data: currentMpk } = useCurrentMpk();
  const mpkId = currentMpk?.id;

  return useMutation({
    mutationFn: async (watchlistItemId: string) => {
      const { error } = await supabase
        .from('mpk_watchlist')
        .delete()
        .eq('id', watchlistItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', mpkId] });
    },
  });
}

/**
 * Hook to update last_viewed_at timestamp
 */
export function useUpdateWatchlistViewed() {
  const queryClient = useQueryClient();
  const { data: currentMpk } = useCurrentMpk();
  const mpkId = currentMpk?.id;

  return useMutation({
    mutationFn: async (watchlistItemId: string) => {
      const { error } = await supabase
        .from('mpk_watchlist')
        .update({ last_viewed_at: new Date().toISOString() })
        .eq('id', watchlistItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', mpkId] });
    },
  });
}

