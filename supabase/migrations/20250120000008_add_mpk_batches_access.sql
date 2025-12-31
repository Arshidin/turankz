-- ============================================================================
-- Add RLS policy for MPKs to view anonymized batch data
-- ============================================================================
-- MPKs need to see aggregated supply data (by region, status, grade, target_week)
-- but should NOT see farmer identities, batch numbers, or other identifying info
-- ============================================================================

-- Add RLS policy for MPKs to view batches (anonymized)
-- This allows MPKs to see supply data for Market Overview
CREATE POLICY "MPKs can view anonymized batches"
ON public.batches
FOR SELECT
TO authenticated
USING (
  -- User must be an MPK
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.user_id = auth.uid()
  )
);

-- Add comment for documentation
COMMENT ON POLICY "MPKs can view anonymized batches" ON public.batches IS 
'MPKs can view batches for aggregated supply visibility. The application layer should only select non-identifying fields (id, heads, grade, region, status, target_week, avg_weight) and exclude user_id, batch_number, notes, mpk_interest to maintain anonymity.';

