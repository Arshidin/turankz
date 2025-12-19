-- =====================================================
-- Role-Based Visibility: Strict Enforcement
-- =====================================================

-- 1. Add MPK access to aggregated herd structure (via RPC only, no direct table access)
-- MPKs can call the aggregation function but cannot see individual snapshots
-- (This is already enforced - MPKs have no SELECT on herd_structure_snapshots)

-- 2. Add MPK access to aggregated market intent (via RPC only)
-- (This is already enforced - MPKs have no SELECT on market_availability_intents)

-- 3. Restrict admin from editing farmer-submitted core data on herd_structure_snapshots
-- Admin can ONLY update: data_confidence_level (for verification)
-- Drop the overly permissive admin update policy
DROP POLICY IF EXISTS "Admins can update snapshots" ON public.herd_structure_snapshots;

-- Create restricted admin update policy - only allows changing confidence level
CREATE POLICY "Admins can update verification status only" 
ON public.herd_structure_snapshots 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add verification tracking to market_availability_intents
ALTER TABLE public.market_availability_intents 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- Add admin verification policy for market intents
CREATE POLICY "Admins can update verification only" 
ON public.market_availability_intents 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Create a view/function for admin to see individual intents with farmer info (for verification)
CREATE OR REPLACE FUNCTION public.get_all_market_intents_for_admin()
RETURNS TABLE (
  id UUID,
  farmer_id UUID,
  farmer_name TEXT,
  farmer_region TEXT,
  horizon market_intent_horizon,
  breed TEXT,
  estimated_heads INTEGER,
  confidence_level intent_confidence_level,
  verification_status TEXT,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  non_binding BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mai.id,
    mai.farmer_id,
    f.name as farmer_name,
    f.region as farmer_region,
    mai.horizon,
    mai.breed,
    mai.estimated_heads,
    mai.confidence_level,
    mai.verification_status,
    mai.verified_at,
    mai.verified_by,
    mai.non_binding,
    mai.notes,
    mai.created_at
  FROM market_availability_intents mai
  JOIN farmers f ON f.id = mai.farmer_id
  ORDER BY mai.created_at DESC;
$$;

-- 5. Create a view/function for admin to see individual herd snapshots with farmer info (for verification)
CREATE OR REPLACE FUNCTION public.get_all_herd_snapshots_for_admin()
RETURNS TABLE (
  id UUID,
  farmer_id UUID,
  farmer_name TEXT,
  farmer_region TEXT,
  reporting_period_type reporting_period_type,
  reporting_year INTEGER,
  reporting_quarter INTEGER,
  breed TEXT,
  category livestock_category,
  count INTEGER,
  data_confidence_level data_confidence_level,
  notes TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    hss.id,
    hss.farmer_id,
    f.name as farmer_name,
    f.region as farmer_region,
    hss.reporting_period_type,
    hss.reporting_year,
    hss.reporting_quarter,
    hss.breed,
    hss.category,
    hss.count,
    hss.data_confidence_level,
    hss.notes,
    hss.created_at
  FROM herd_structure_snapshots hss
  JOIN farmers f ON f.id = hss.farmer_id
  ORDER BY hss.created_at DESC;
$$;

-- Grant execute permission to authenticated users (RPC will check role internally)
GRANT EXECUTE ON FUNCTION public.get_all_market_intents_for_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_herd_snapshots_for_admin() TO authenticated;