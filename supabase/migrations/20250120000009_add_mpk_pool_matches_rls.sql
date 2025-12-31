-- ============================================================================
-- CRITICAL FIX: Add RLS Policy for MPK to view their own pool matches
-- ============================================================================
-- Issue: MPK cannot view pool_matches for their own requests
-- Root cause: Only admin policies exist, no MPK-specific policy
-- Fix: Add RLS policy allowing MPK to view matches for their own requests
-- ============================================================================

-- Drop any existing MPK policy if it exists (defensive)
DROP POLICY IF EXISTS "MPKs can view own request matches" ON public.pool_matches;

-- MPKs can view matches for their own requests only
CREATE POLICY "MPKs can view own request matches"
ON public.pool_matches
FOR SELECT
TO authenticated
USING (
  -- User must be an MPK
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.user_id = auth.uid()
  )
  -- And the match must belong to a request owned by this MPK
  AND EXISTS (
    SELECT 1 FROM public.purchase_pool_requests pr
    JOIN public.mpks m ON m.mpk_id = pr.mpk_id
    WHERE pr.id = pool_matches.request_id
    AND m.user_id = auth.uid()
  )
);

-- Add comment for documentation
COMMENT ON POLICY "MPKs can view own request matches" ON public.pool_matches IS 
'MPKs can view pool matches only for their own purchase pool requests. This ensures data isolation - MPK cannot see matches for other MPKs requests, and cannot see farmer identities.';

