-- Add RLS policy for MPKs to view their own requests
CREATE POLICY "MPKs can view own requests"
ON public.purchase_pool_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.mpk_id = purchase_pool_requests.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

-- Add RLS policy for MPKs to create their own requests
CREATE POLICY "MPKs can create own requests"
ON public.purchase_pool_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.mpk_id = purchase_pool_requests.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

-- Add RLS policy for MPKs to update their own draft requests
CREATE POLICY "MPKs can update own draft requests"
ON public.purchase_pool_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.mpk_id = purchase_pool_requests.mpk_id 
    AND mpks.user_id = auth.uid()
  )
  AND status = 'draft'
);

-- Create a view for aggregated demand that farmers can see (anonymized)
CREATE OR REPLACE VIEW public.aggregated_demand AS
SELECT 
  target_week,
  regions,
  required_grade,
  SUM(required_volume) as total_volume,
  SUM(matched_volume) as total_matched,
  COUNT(*) as request_count,
  MIN(weight_range_min) as weight_min,
  MAX(weight_range_max) as weight_max,
  MIN(age_range_min) as age_min,
  MAX(age_range_max) as age_max
FROM public.purchase_pool_requests
WHERE status IN ('submitted', 'matching', 'partial', 'fulfilled')
GROUP BY target_week, regions, required_grade;

-- Grant access to the aggregated view
GRANT SELECT ON public.aggregated_demand TO authenticated;