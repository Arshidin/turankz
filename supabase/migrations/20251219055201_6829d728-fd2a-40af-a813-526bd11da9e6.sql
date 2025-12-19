-- Create enum for livestock categories
CREATE TYPE public.livestock_category AS ENUM (
  'breeding_cows',
  'replacement_heifers',
  'bulls',
  'calves'
);

-- Create enum for data confidence levels
CREATE TYPE public.data_confidence_level AS ENUM (
  'self_declared',
  'reviewed',
  'verified'
);

-- Create enum for reporting period type
CREATE TYPE public.reporting_period_type AS ENUM (
  'annual',
  'quarterly'
);

-- Create herd_structure_snapshots table
CREATE TABLE public.herd_structure_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  reporting_period_type reporting_period_type NOT NULL,
  reporting_year INTEGER NOT NULL,
  reporting_quarter INTEGER CHECK (reporting_quarter IS NULL OR (reporting_quarter >= 1 AND reporting_quarter <= 4)),
  breed TEXT NOT NULL,
  category livestock_category NOT NULL,
  count INTEGER NOT NULL CHECK (count >= 0),
  data_confidence_level data_confidence_level NOT NULL DEFAULT 'self_declared',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure quarterly reports have quarter, annual reports don't
  CONSTRAINT valid_quarter_for_type CHECK (
    (reporting_period_type = 'annual' AND reporting_quarter IS NULL) OR
    (reporting_period_type = 'quarterly' AND reporting_quarter IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.herd_structure_snapshots ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own snapshots
CREATE POLICY "Farmers can view own snapshots"
ON public.herd_structure_snapshots
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.farmers
    WHERE farmers.id = herd_structure_snapshots.farmer_id
    AND farmers.user_id = auth.uid()
  )
);

-- Farmers can create snapshots for their own farm
CREATE POLICY "Farmers can create own snapshots"
ON public.herd_structure_snapshots
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.farmers
    WHERE farmers.id = herd_structure_snapshots.farmer_id
    AND farmers.user_id = auth.uid()
  )
);

-- Admins can view all snapshots
CREATE POLICY "Admins can view all snapshots"
ON public.herd_structure_snapshots
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update confidence level (verification)
CREATE POLICY "Admins can update snapshots"
ON public.herd_structure_snapshots
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create index for efficient querying
CREATE INDEX idx_herd_snapshots_farmer ON public.herd_structure_snapshots(farmer_id);
CREATE INDEX idx_herd_snapshots_period ON public.herd_structure_snapshots(reporting_year, reporting_quarter);
CREATE INDEX idx_herd_snapshots_category ON public.herd_structure_snapshots(category);
CREATE INDEX idx_herd_snapshots_breed ON public.herd_structure_snapshots(breed);

-- Create function for admin aggregated view
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
    f.region,
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
  GROUP BY f.region, hs.breed, hs.category
  ORDER BY f.region, hs.breed, hs.category
$$;