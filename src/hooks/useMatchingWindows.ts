import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  type MatchingWindow, 
  type MatchingWindowStatus,
  isWindowTransitionAllowed,
  getEffectiveWindowStatus,
} from '@/lib/matching-window';

/**
 * Enhance a matching window with its computed effective status based on real dates
 */
function withEffectiveStatus(window: MatchingWindow): MatchingWindow {
  const effectiveStatus = getEffectiveWindowStatus(window);
  return {
    ...window,
    status: effectiveStatus,
  };
}

/**
 * Fetch all matching windows
 */
export const useMatchingWindows = () => {
  return useQuery({
    queryKey: ['matching-windows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matching_windows')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      // Apply effective status computation to each window
      return (data as MatchingWindow[]).map(withEffectiveStatus);
    },
  });
};

/**
 * Fetch the current active or upcoming matching window (computed from real dates)
 */
export const useCurrentMatchingWindow = () => {
  return useQuery({
    queryKey: ['matching-windows', 'current'],
    queryFn: async () => {
      // Get all non-closed windows ordered by start date
      const { data: windows, error } = await supabase
        .from('matching_windows')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      if (!windows || windows.length === 0) return null;

      // Compute effective status for each window and find the most relevant one
      const windowsWithStatus = (windows as MatchingWindow[]).map(withEffectiveStatus);
      
      // Priority: active > locked > upcoming (closest one)
      const activeWindow = windowsWithStatus.find(w => w.status === 'active');
      if (activeWindow) return activeWindow;

      const lockedWindow = windowsWithStatus.find(w => w.status === 'locked');
      if (lockedWindow) return lockedWindow;

      const upcomingWindow = windowsWithStatus.find(w => w.status === 'upcoming');
      if (upcomingWindow) return upcomingWindow;

      return null;
    },
    // Refetch every minute to keep status current with real time
    refetchInterval: 60000,
  });
};

/**
 * Create a new matching window (Admin only)
 */
export const useCreateMatchingWindow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (window: Omit<MatchingWindow, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('matching_windows')
        .insert(window)
        .select()
        .single();

      if (error) throw error;
      return data as MatchingWindow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matching-windows'] });
      toast({
        title: 'Window Created',
        description: 'New matching window has been created.',
      });
    },
    onError: (error) => {
      console.error('Error creating matching window:', error);
      toast({
        title: 'Error',
        description: 'Failed to create matching window.',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Update matching window status (Admin only)
 */
export const useUpdateMatchingWindowStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      currentStatus, 
      newStatus 
    }: { 
      id: string; 
      currentStatus: MatchingWindowStatus; 
      newStatus: MatchingWindowStatus;
    }) => {
      // Validate transition
      if (!isWindowTransitionAllowed(currentStatus, newStatus)) {
        throw new Error(`Invalid transition from ${currentStatus} to ${newStatus}`);
      }

      // If activating a window, ensure no other window is active
      if (newStatus === 'active') {
        const { data: existingActive } = await supabase
          .from('matching_windows')
          .select('id')
          .eq('status', 'active')
          .neq('id', id)
          .maybeSingle();

        if (existingActive) {
          throw new Error('Another window is already active. Close it first.');
        }
      }

      const { data, error } = await supabase
        .from('matching_windows')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MatchingWindow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matching-windows'] });
      toast({
        title: 'Window Updated',
        description: `Window status changed to ${data.status}.`,
      });
    },
    onError: (error) => {
      console.error('Error updating matching window:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update window status.',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Update matching window details (Admin only)
 */
export const useUpdateMatchingWindow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MatchingWindow> & { id: string }) => {
      const { data, error } = await supabase
        .from('matching_windows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MatchingWindow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matching-windows'] });
      toast({
        title: 'Window Updated',
        description: 'Matching window details updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating matching window:', error);
      toast({
        title: 'Error',
        description: 'Failed to update matching window.',
        variant: 'destructive',
      });
    },
  });
};
