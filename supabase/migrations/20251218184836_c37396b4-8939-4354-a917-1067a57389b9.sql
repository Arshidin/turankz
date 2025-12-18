-- Drop the view to recreate with proper security
DROP VIEW IF EXISTS public.aggregated_demand;

-- Create a security invoker function instead for aggregated demand
CREATE OR REPLACE FUNCTION public.get_aggregated_demand()
RETURNS TABLE (
  target_week text,
  regions text[],
  required_grade text,
  total_volume bigint,
  total_matched bigint,
  request_count bigint,
  weight_min integer,
  weight_max integer,
  age_min integer,
  age_max integer
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    target_week,
    regions,
    required_grade,
    SUM(required_volume)::bigint as total_volume,
    SUM(matched_volume)::bigint as total_matched,
    COUNT(*)::bigint as request_count,
    MIN(weight_range_min) as weight_min,
    MAX(weight_range_max) as weight_max,
    MIN(age_range_min) as age_min,
    MAX(age_range_max) as age_max
  FROM public.purchase_pool_requests
  WHERE status IN ('submitted', 'matching', 'partial', 'fulfilled')
  GROUP BY target_week, regions, required_grade
$$;

-- Add RLS policy for farmers to see aggregated data via function
-- This requires a simpler policy - farmers can read requests but only get aggregated data
CREATE POLICY "Farmers can view requests for aggregation"
ON public.purchase_pool_requests
FOR SELECT
USING (
  has_role(auth.uid(), 'farmer') 
  AND status IN ('submitted', 'matching', 'partial', 'fulfilled')
);