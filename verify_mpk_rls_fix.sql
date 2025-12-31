-- ============================================================================
-- VERIFICATION SCRIPT: Check RLS policies for purchase_pool_requests
-- ============================================================================
-- Run this script after applying migration 20250120000006_fix_mpk_requests_rls.sql
-- to verify that policies are correctly configured
-- ============================================================================

-- 1. Check all existing policies on purchase_pool_requests
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'purchase_pool_requests'
ORDER BY policyname;

-- 2. Verify that no policy uses USING (true) for SELECT
SELECT 
  policyname,
  cmd,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'purchase_pool_requests'
  AND cmd = 'SELECT'
  AND (qual LIKE '%true%' OR qual IS NULL);

-- Expected: Should return 0 rows (no policies with USING (true))

-- 3. Check that MPK policy exists and is correct
SELECT 
  policyname,
  cmd,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'purchase_pool_requests'
  AND policyname = 'MPKs can view own requests';

-- Expected: Should return 1 row with proper EXISTS checks

-- 4. Check that Admin policy uses has_role()
SELECT 
  policyname,
  cmd,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'purchase_pool_requests'
  AND policyname = 'Admins can view all requests'
  AND qual LIKE '%has_role%';

-- Expected: Should return 1 row with has_role() check

-- 5. Test query as MPK user (replace with actual MPK user_id)
-- This should only return requests for that MPK
-- Uncomment and replace <mpk_user_id> with actual user ID for testing
/*
SET ROLE authenticated;
SET request.jwt.claim.sub = '<mpk_user_id>';

SELECT 
  id,
  request_number,
  mpk_id,
  mpk_name,
  status
FROM public.purchase_pool_requests
ORDER BY created_at DESC;

RESET ROLE;
*/

-- 6. Summary
SELECT 
  COUNT(*) as total_policies,
  COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
  COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
  COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies
FROM pg_policies
WHERE tablename = 'purchase_pool_requests';

-- Expected results:
-- - total_policies: 6-7 (Admin SELECT/INSERT/UPDATE, MPK SELECT/INSERT/UPDATE, Farmer SELECT)
-- - All SELECT policies should have proper USING clauses (not true)

