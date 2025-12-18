import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePremiumSettings } from './usePremiums';
import { useActivePriceGrid } from './usePriceGrid';
import { 
  calculatePremiumBreakdown, 
  BatchPremiumContext, 
  PremiumBreakdown 
} from '@/lib/premium-eligibility';
import { Json } from '@/integrations/supabase/types';

interface MatchWithPremiums {
  id: string;
  batch_id: string;
  base_price_per_kg: number | null;
  standard_premium: number;
  predictability_premium: number;
  volume_consistency_premium: number;
  reliability_premium: number;
  total_premium: number;
  total_price_per_kg: number | null;
  premium_locked: boolean;
  premium_locked_at: string | null;
  premium_breakdown: Record<string, unknown> | null;
}

// Hook to calculate premium eligibility for a batch (before finalization)
export function useCalculatePremiumEligibility(
  batchId: string | null,
  farmerId: string | null
) {
  const { data: allPremiums } = usePremiumSettings();
  const { data: activeGrid } = useActivePriceGrid();

  return useQuery({
    queryKey: ['premium-eligibility', batchId, farmerId],
    queryFn: async (): Promise<PremiumBreakdown | null> => {
      if (!batchId || !farmerId || !allPremiums) return null;

      // Fetch batch details
      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (batchError || !batch) return null;

      // Fetch farmer details
      const { data: farmer, error: farmerError } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .single();

      if (farmerError || !farmer) return null;

      // Fetch matching window if batch is matched
      const { data: match } = await supabase
        .from('pool_matches')
        .select('matching_window_id')
        .eq('batch_id', batchId)
        .maybeSingle();

      let lockDate: string | null = null;
      if (match?.matching_window_id) {
        const { data: window } = await supabase
          .from('matching_windows')
          .select('lock_date')
          .eq('id', match.matching_window_id)
          .single();
        lockDate = window?.lock_date || null;
      }

      // Calculate months active
      const createdAt = new Date(farmer.created_at);
      const now = new Date();
      const monthsActive = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30));

      // Calculate delivery rate
      const totalBatches = farmer.total_confirmations + farmer.total_declines;
      const deliveryRate = totalBatches > 0 
        ? Math.round((farmer.total_confirmations / totalBatches) * 100)
        : 100;

      // Check for post-confirmation edits (simplified: check if updated after status became confirmed)
      const hasEdits = batch.status === 'confirmed' && 
        new Date(batch.updated_at) > new Date(batch.created_at);

      // Find base price from grid
      let basePricePerKg = 0;
      const gridCells = activeGrid?.cells;
      if (gridCells && batch.avg_weight && batch.gender) {
        const matchingCell = gridCells.find(cell => 
          batch.avg_weight! >= cell.weight_min && 
          batch.avg_weight! <= cell.weight_max &&
          cell.sex.toLowerCase() === batch.gender?.toLowerCase()
        );
        basePricePerKg = matchingCell?.base_price || 0;
      }

      const context: BatchPremiumContext = {
        batchId: batch.id,
        standardStatus: batch.standard_status || 'non_standard',
        confirmedAt: batch.status === 'confirmed' || batch.status === 'matched' 
          ? batch.updated_at 
          : null,
        hasPostConfirmationEdits: hasEdits,
        farmerId: farmer.id,
        farmerGrading: farmer.grading,
        farmerReliability: farmer.reliability,
        totalFulfilledBatches: farmer.total_confirmations,
        deliveryRate,
        monthsActive,
        matchingWindowLockDate: lockDate,
      };

      return calculatePremiumBreakdown(context, basePricePerKg, allPremiums);
    },
    enabled: !!batchId && !!farmerId && !!allPremiums,
  });
}

// Hook to lock premium eligibility when matching is finalized
export function useLockMatchingPremiums() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      matchId, 
      breakdown 
    }: { 
      matchId: string; 
      breakdown: PremiumBreakdown;
    }) => {
      const standardPremium = breakdown.premiums.find(p => p.type === 'standard');
      const predictabilityPremium = breakdown.premiums.find(p => p.type === 'predictability');
      const volumeConsistencyPremium = breakdown.premiums.find(p => p.type === 'volume_consistency');
      const reliabilityPremium = breakdown.premiums.find(p => p.type === 'reliability');

      const { error } = await supabase
        .from('pool_matches')
        .update({
          base_price_per_kg: breakdown.basePricePerKg,
          standard_premium: standardPremium?.eligible ? standardPremium.value : 0,
          predictability_premium: predictabilityPremium?.eligible ? predictabilityPremium.value : 0,
          volume_consistency_premium: volumeConsistencyPremium?.eligible ? volumeConsistencyPremium.value : 0,
          reliability_premium: reliabilityPremium?.eligible ? reliabilityPremium.value : 0,
          total_premium: breakdown.totalPremium,
          total_price_per_kg: breakdown.totalPricePerKg,
          premium_locked: true,
          premium_locked_at: new Date().toISOString(),
          premium_breakdown: {
            premiums: breakdown.premiums.map(p => ({
              type: p.type,
              levelKey: p.levelKey,
              levelName: p.levelName,
              value: p.value,
              eligible: p.eligible,
              reason: p.reason,
            })),
            calculatedAt: new Date().toISOString(),
          } as unknown as Json,
        })
        .eq('id', matchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
      queryClient.invalidateQueries({ queryKey: ['pool-matches'] });
    },
  });
}

// Hook to get locked premium breakdown for a finalized match
export function useLockedPremiumBreakdown(matchId: string | null) {
  return useQuery({
    queryKey: ['locked-premium-breakdown', matchId],
    queryFn: async (): Promise<PremiumBreakdown | null> => {
      if (!matchId) return null;

      const { data, error } = await supabase
        .from('pool_matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error || !data || !data.premium_locked) return null;

      const match = data as unknown as MatchWithPremiums;

      // Reconstruct breakdown from stored values
      const storedBreakdown = match.premium_breakdown as { premiums?: unknown[] } | null;

      return {
        basePricePerKg: match.base_price_per_kg || 0,
        premiums: (storedBreakdown?.premiums || []) as PremiumBreakdown['premiums'],
        totalPremium: match.total_premium,
        totalPricePerKg: match.total_price_per_kg || 0,
      };
    },
    enabled: !!matchId,
  });
}