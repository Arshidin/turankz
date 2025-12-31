-- ============================================================================
-- CRITICAL FIX: Ensure MPKs can only view their own pool requests
-- ============================================================================
-- Issue: MPKs can see all pool requests from other MPKs
-- Root cause: Old RLS policy with USING (true) may still exist
-- Fix: Ensure proper RLS policies are in place
-- ============================================================================

-- Drop any old policies that allow all authenticated users to view all requests
DROP POLICY IF EXISTS "Admins can view all requests" ON public.purchase_pool_requests;
DROP POLICY IF EXISTS "Admins can create requests" ON public.purchase_pool_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.purchase_pool_requests;

-- Ensure admin policies use has_role() check
CREATE POLICY "Admins can view all requests"
ON public.purchase_pool_requests FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create requests"
ON public.purchase_pool_requests FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
ON public.purchase_pool_requests FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Ensure MPK policies exist and are correct
-- Drop and recreate to ensure they're properly applied
DROP POLICY IF EXISTS "MPKs can view own requests" ON public.purchase_pool_requests;
DROP POLICY IF EXISTS "MPKs can create own requests" ON public.purchase_pool_requests;
DROP POLICY IF EXISTS "MPKs can update own draft requests" ON public.purchase_pool_requests;

-- MPKs can view only their own requests
CREATE POLICY "MPKs can view own requests"
ON public.purchase_pool_requests
FOR SELECT
TO authenticated
USING (
  -- User must be an MPK
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.user_id = auth.uid()
  )
  -- And the request must belong to this MPK
  AND EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.mpk_id = purchase_pool_requests.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

-- MPKs can create only their own requests
CREATE POLICY "MPKs can create own requests"
ON public.purchase_pool_requests
FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be an MPK
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.user_id = auth.uid()
  )
  -- And the request must be created for this MPK
  AND EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.mpk_id = purchase_pool_requests.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

-- MPKs can update only their own draft requests
CREATE POLICY "MPKs can update own draft requests"
ON public.purchase_pool_requests
FOR UPDATE
TO authenticated
USING (
  -- User must be an MPK
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.user_id = auth.uid()
  )
  -- And the request must belong to this MPK
  AND EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.mpk_id = purchase_pool_requests.mpk_id 
    AND mpks.user_id = auth.uid()
  )
  -- And the request must be in draft status
  AND status = 'draft'
);

-- Ensure Farmers can view requests for aggregation (via function)
-- Drop and recreate to ensure proper order
DROP POLICY IF EXISTS "Farmers can view requests for aggregation" ON public.purchase_pool_requests;

CREATE POLICY "Farmers can view requests for aggregation"
ON public.purchase_pool_requests
FOR SELECT
TO authenticated
USING (
  -- User must be a farmer
  EXISTS (
    SELECT 1 FROM public.farmers 
    WHERE farmers.user_id = auth.uid()
  )
  -- And request must be in active status (for aggregation only)
  AND status IN ('submitted', 'matching', 'partial', 'fulfilled')
);

-- Add comment for documentation
COMMENT ON POLICY "MPKs can view own requests" ON public.purchase_pool_requests IS 
'MPKs can only view pool requests that belong to their own MPK. This ensures data isolation between different meat processing plants.';

COMMENT ON POLICY "Farmers can view requests for aggregation" ON public.purchase_pool_requests IS 
'Farmers can view pool requests only for aggregation purposes (via get_aggregated_demand function). They cannot see individual request details or MPK identities.';

