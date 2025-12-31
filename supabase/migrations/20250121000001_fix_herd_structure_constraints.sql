-- ============================================================================
-- Fix National Herd Structure - Critical Constraints and Validations
-- ============================================================================
-- Issue: Missing validations for region, duplicates, and data integrity
-- Fix: Add constraints and improve data quality
-- ============================================================================

-- 1. Ensure farmers.region is NOT NULL (if not already)
-- First, update any NULL regions to a default value
UPDATE public.farmers 
SET region = 'Unknown' 
WHERE region IS NULL OR region = '';

-- Add NOT NULL constraint if column allows it
DO $$ 
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'farmers_region_not_null' 
    AND table_name = 'farmers'
  ) THEN
    ALTER TABLE public.farmers 
      ALTER COLUMN region SET NOT NULL;
  END IF;
END $$;

-- 2. Add unique constraint to prevent duplicate snapshots
-- A farmer cannot have multiple snapshots for the same period, category, and breed
DO $$ 
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_snapshot_per_period' 
    AND table_name = 'herd_structure_snapshots'
  ) THEN
    ALTER TABLE public.herd_structure_snapshots
      ADD CONSTRAINT unique_snapshot_per_period 
      UNIQUE (farmer_id, reporting_year, reporting_quarter, category, breed);
  END IF;
END $$;

-- 3. Add check constraint to prevent future periods
-- Snapshots can only be created for current or past periods
ALTER TABLE public.herd_structure_snapshots
  DROP CONSTRAINT IF EXISTS no_future_periods;

ALTER TABLE public.herd_structure_snapshots
  ADD CONSTRAINT no_future_periods CHECK (
    reporting_year <= EXTRACT(YEAR FROM CURRENT_DATE)
    AND (
      reporting_quarter IS NULL 
      OR reporting_year < EXTRACT(YEAR FROM CURRENT_DATE)
      OR (
        reporting_year = EXTRACT(YEAR FROM CURRENT_DATE)
        AND reporting_quarter <= EXTRACT(QUARTER FROM CURRENT_DATE)
      )
    )
  );

-- 4. Add index for efficient duplicate checking
CREATE INDEX IF NOT EXISTS idx_herd_snapshots_duplicate_check 
ON public.herd_structure_snapshots(farmer_id, reporting_year, reporting_quarter, category, breed);

-- 5. Update aggregation function to handle NULL regions gracefully
CREATE OR REPLACE FUNCTION public.get_aggregated_herd_structure(
  p_year INTEGER DEFAULT NULL,
  p_quarter INTEGER DEFAULT NULL
)
RETURNS TABLE (
  region TEXT,
  breed TEXT,
  category livestock_category,
  total_count BIGINT,
  farmer_count BIGINT,
  avg_confidence data_confidence_level
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(f.region, 'Unknown') as region,
    hs.breed,
    hs.category,
    SUM(hs.count)::BIGINT as total_count,
    COUNT(DISTINCT hs.farmer_id)::BIGINT as farmer_count,
    MODE() WITHIN GROUP (ORDER BY hs.data_confidence_level) as avg_confidence
  FROM public.herd_structure_snapshots hs
  JOIN public.farmers f ON f.id = hs.farmer_id
  WHERE 
    (p_year IS NULL OR hs.reporting_year = p_year)
    AND (p_quarter IS NULL OR hs.reporting_quarter = p_quarter OR hs.reporting_quarter IS NULL)
    -- Exclude future periods (defense in depth)
    AND hs.reporting_year <= EXTRACT(YEAR FROM CURRENT_DATE)
  GROUP BY COALESCE(f.region, 'Unknown'), hs.breed, hs.category
  ORDER BY COALESCE(f.region, 'Unknown'), hs.breed, hs.category
$$;

-- Add RLS policy for farmers to delete their own snapshots (within 24 hours)
DROP POLICY IF EXISTS "Farmers can delete own snapshots" ON public.herd_structure_snapshots;

CREATE POLICY "Farmers can delete own snapshots"
ON public.herd_structure_snapshots
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.farmers
    WHERE farmers.id = herd_structure_snapshots.farmer_id
    AND farmers.user_id = auth.uid()
  )
  -- Additional check: can only delete within 24 hours (enforced in application layer)
  -- Database constraint would require a trigger, which is more complex
);

COMMENT ON CONSTRAINT unique_snapshot_per_period ON public.herd_structure_snapshots IS 
'Prevents duplicate snapshots: one snapshot per farmer per period per category per breed';

COMMENT ON CONSTRAINT no_future_periods ON public.herd_structure_snapshots IS 
'Prevents creating snapshots for future periods - only current and past periods allowed';

COMMENT ON POLICY "Farmers can delete own snapshots" ON public.herd_structure_snapshots IS 
'Farmers can delete their own snapshots. Application layer enforces 24-hour deletion window.';

