-- ============================================================================
-- CRITICAL FIX: Replace insecure RLS policies with proper role checks
-- ============================================================================
-- Issue: Many admin-only policies use USING(true) which allows ANY authenticated user
-- Fix: Replace with has_role() check to ensure only admins can access
-- ============================================================================

-- ============================================================================
-- FARMERS TABLE
-- ============================================================================

-- Drop old insecure policies
DROP POLICY IF EXISTS "Admins can view all farmers" ON public.farmers;
DROP POLICY IF EXISTS "Admins can update farmers" ON public.farmers;
DROP POLICY IF EXISTS "Admins can create farmers" ON public.farmers;

-- Create secure admin policies
CREATE POLICY "Admins can view all farmers"
ON public.farmers FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update farmers"
ON public.farmers FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create farmers"
ON public.farmers FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- FARMER ACTIVITY LOG
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view activity logs" ON public.farmer_activity_log;
DROP POLICY IF EXISTS "Admins can create activity logs" ON public.farmer_activity_log;

CREATE POLICY "Admins can view activity logs"
ON public.farmer_activity_log FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create activity logs"
ON public.farmer_activity_log FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- MPKS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all mpks" ON public.mpks;
DROP POLICY IF EXISTS "Admins can update mpks" ON public.mpks;
DROP POLICY IF EXISTS "Admins can create mpks" ON public.mpks;

CREATE POLICY "Admins can view all mpks"
ON public.mpks FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update mpks"
ON public.mpks FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create mpks"
ON public.mpks FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- MPK ACTIVITY LOG
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view mpk activity logs" ON public.mpk_activity_log;
DROP POLICY IF EXISTS "Admins can create mpk activity logs" ON public.mpk_activity_log;

CREATE POLICY "Admins can view mpk activity logs"
ON public.mpk_activity_log FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create mpk activity logs"
ON public.mpk_activity_log FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- PURCHASE POOL REQUESTS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all requests" ON public.purchase_pool_requests;
DROP POLICY IF EXISTS "Admins can create requests" ON public.purchase_pool_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.purchase_pool_requests;

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

-- ============================================================================
-- POOL MATCHES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view matches" ON public.pool_matches;
DROP POLICY IF EXISTS "Admins can create matches" ON public.pool_matches;
DROP POLICY IF EXISTS "Admins can update matches" ON public.pool_matches;
DROP POLICY IF EXISTS "Admins can delete matches" ON public.pool_matches;

CREATE POLICY "Admins can view matches"
ON public.pool_matches FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create matches"
ON public.pool_matches FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update matches"
ON public.pool_matches FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete matches"
ON public.pool_matches FOR DELETE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- PREMIUM SETTINGS (read-only for all, admin-only for write)
-- ============================================================================

-- These are already correct (read-only for all), but ensure write is admin-only
DROP POLICY IF EXISTS "Admins can insert premium settings" ON public.premium_settings;
DROP POLICY IF EXISTS "Admins can update premium settings" ON public.premium_settings;

CREATE POLICY "Admins can insert premium settings"
ON public.premium_settings FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update premium settings"
ON public.premium_settings FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- PRICE GRID (read-only for all, admin-only for write)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can create price grid versions" ON public.price_grid_versions;
DROP POLICY IF EXISTS "Admins can update price grid versions" ON public.price_grid_versions;
DROP POLICY IF EXISTS "Admins can delete price grid versions" ON public.price_grid_versions;
DROP POLICY IF EXISTS "Admins can create price grid cells" ON public.price_grid_cells;
DROP POLICY IF EXISTS "Admins can update price grid cells" ON public.price_grid_cells;
DROP POLICY IF EXISTS "Admins can delete price grid cells" ON public.price_grid_cells;

CREATE POLICY "Admins can create price grid versions"
ON public.price_grid_versions FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update price grid versions"
ON public.price_grid_versions FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete price grid versions"
ON public.price_grid_versions FOR DELETE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create price grid cells"
ON public.price_grid_cells FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update price grid cells"
ON public.price_grid_cells FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete price grid cells"
ON public.price_grid_cells FOR DELETE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- ACTIVITY LOG (admin-only for view, system for create)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Admins can view execution logs" ON public.execution_activity_log;

CREATE POLICY "Admins can view activity log"
ON public.activity_log FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view execution logs"
ON public.execution_activity_log FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- MATCHING ACTIVITY LOG
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view matching activity logs" ON public.matching_activity_log;
DROP POLICY IF EXISTS "Admins can create matching activity logs" ON public.matching_activity_log;

CREATE POLICY "Admins can view matching activity logs"
ON public.matching_activity_log FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create matching activity logs"
ON public.matching_activity_log FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- POOL REQUEST ACTIVITY LOG
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view pool request activity logs" ON public.pool_request_activity_log;

CREATE POLICY "Admins can view pool request activity logs"
ON public.pool_request_activity_log FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- MATCHING WINDOWS (read-only for all, admin-only for write)
-- ============================================================================

-- The "Everyone can view" policy is correct, but ensure write is admin-only
-- (These should already be correct, but double-check)

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After this migration, verify that:
-- 1. Farmers can only see their own batches (not all farmers)
-- 2. MPKs can only see their own requests (not all requests)
-- 3. Only admins can see all farmers, mpks, requests, matches
-- 4. All authenticated users can still read price grids, premium settings (read-only)

