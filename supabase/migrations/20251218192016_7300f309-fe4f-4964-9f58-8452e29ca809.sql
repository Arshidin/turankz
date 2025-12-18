-- Add RLS policies for Farmers to view their own batch matchings (anonymized)
CREATE POLICY "Farmers can view own batch matchings"
ON public.pool_matches
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM batches
    WHERE batches.id = pool_matches.batch_id
    AND batches.user_id = auth.uid()
  )
);

-- Add RLS policies for MPKs to view matchings for their pool requests (anonymized)
CREATE POLICY "MPKs can view own request matchings"
ON public.pool_matches
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM purchase_pool_requests ppr
    JOIN mpks ON mpks.mpk_id = ppr.mpk_id
    WHERE ppr.id = pool_matches.request_id
    AND mpks.user_id = auth.uid()
  )
);