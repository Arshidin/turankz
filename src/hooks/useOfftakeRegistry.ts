import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OfftakeEntry {
  mpk_id: string;
  mpk_name: string;
  total_heads: number;
  delivery_periods: string[];
  standard_compliant_heads: number;
  non_standard_heads: number;
  compliance_rate: number;
  matchings: OfftakeMatchingDetail[];
}

export interface OfftakeMatchingDetail {
  id: string;
  batch_id: string;
  batch_number: string;
  heads_matched: number;
  target_week: string;
  grade: string;
  region: string;
  standard_status: string | null;
  finalized_at: string;
}

export interface OfftakeSummary {
  total_mpks: number;
  total_heads: number;
  total_standard_compliant: number;
  total_non_standard: number;
  overall_compliance_rate: number;
  delivery_period_range: {
    earliest: string | null;
    latest: string | null;
  };
}

export function useOfftakeRegistry() {
  return useQuery({
    queryKey: ['offtake-registry'],
    queryFn: async () => {
      // Fetch all finalized matchings with batch and request details
      const { data: matchings, error } = await supabase
        .from('pool_matches')
        .select(`
          id,
          batch_id,
          request_id,
          heads_matched,
          finalized_at,
          batches!inner (
            batch_number,
            target_week,
            grade,
            region,
            standard_status
          ),
          purchase_pool_requests!inner (
            mpk_id,
            mpk_name
          )
        `)
        .eq('status', 'finalized')
        .order('finalized_at', { ascending: false });

      if (error) throw error;

      // Aggregate by MPK
      const mpkMap = new Map<string, OfftakeEntry>();

      for (const match of matchings || []) {
        const batch = match.batches as unknown as {
          batch_number: string;
          target_week: string;
          grade: string;
          region: string;
          standard_status: string | null;
        };
        const request = match.purchase_pool_requests as unknown as {
          mpk_id: string;
          mpk_name: string;
        };

        const mpkId = request.mpk_id;
        const isStandard = batch.standard_status === 'standard';

        if (!mpkMap.has(mpkId)) {
          mpkMap.set(mpkId, {
            mpk_id: mpkId,
            mpk_name: request.mpk_name,
            total_heads: 0,
            delivery_periods: [],
            standard_compliant_heads: 0,
            non_standard_heads: 0,
            compliance_rate: 0,
            matchings: [],
          });
        }

        const entry = mpkMap.get(mpkId)!;
        entry.total_heads += match.heads_matched;
        
        if (isStandard) {
          entry.standard_compliant_heads += match.heads_matched;
        } else {
          entry.non_standard_heads += match.heads_matched;
        }

        if (!entry.delivery_periods.includes(batch.target_week)) {
          entry.delivery_periods.push(batch.target_week);
        }

        entry.matchings.push({
          id: match.id,
          batch_id: match.batch_id,
          batch_number: batch.batch_number,
          heads_matched: match.heads_matched,
          target_week: batch.target_week,
          grade: batch.grade,
          region: batch.region,
          standard_status: batch.standard_status,
          finalized_at: match.finalized_at!,
        });
      }

      // Calculate compliance rates and sort delivery periods
      const entries: OfftakeEntry[] = [];
      for (const entry of mpkMap.values()) {
        entry.compliance_rate = entry.total_heads > 0
          ? Math.round((entry.standard_compliant_heads / entry.total_heads) * 100)
          : 0;
        entry.delivery_periods.sort();
        entries.push(entry);
      }

      // Sort by total heads descending
      entries.sort((a, b) => b.total_heads - a.total_heads);

      // Calculate summary
      const summary: OfftakeSummary = {
        total_mpks: entries.length,
        total_heads: entries.reduce((sum, e) => sum + e.total_heads, 0),
        total_standard_compliant: entries.reduce((sum, e) => sum + e.standard_compliant_heads, 0),
        total_non_standard: entries.reduce((sum, e) => sum + e.non_standard_heads, 0),
        overall_compliance_rate: 0,
        delivery_period_range: {
          earliest: null,
          latest: null,
        },
      };

      if (summary.total_heads > 0) {
        summary.overall_compliance_rate = Math.round(
          (summary.total_standard_compliant / summary.total_heads) * 100
        );
      }

      const allPeriods = entries.flatMap(e => e.delivery_periods).sort();
      if (allPeriods.length > 0) {
        summary.delivery_period_range.earliest = allPeriods[0];
        summary.delivery_period_range.latest = allPeriods[allPeriods.length - 1];
      }

      return { entries, summary };
    },
  });
}
