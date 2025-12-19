-- Create enum for market intent horizon
CREATE TYPE public.market_intent_horizon AS ENUM (
  '3m',
  '6m', 
  '12m'
);

-- Create enum for intent confidence level
CREATE TYPE public.intent_confidence_level AS ENUM (
  'low',
  'medium',
  'high'
);

-- Create market_availability_intents table
CREATE TABLE public.market_availability_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  horizon market_intent_horizon NOT NULL,
  breed TEXT NOT NULL,
  estimated_heads INTEGER NOT NULL CHECK (estimated_heads > 0),
  confidence_level intent_confidence_level NOT NULL DEFAULT 'medium',
  non_binding BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_availability_intents ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own intents
CREATE POLICY "Farmers can view own intents"
ON public.market_availability_intents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.farmers
    WHERE farmers.id = market_availability_intents.farmer_id
    AND farmers.user_id = auth.uid()
  )
);

-- Farmers can create intents for their own farm
CREATE POLICY "Farmers can create own intents"
ON public.market_availability_intents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.farmers
    WHERE farmers.id = market_availability_intents.farmer_id
    AND farmers.user_id = auth.uid()
  )
);

-- Farmers can delete their own intents
CREATE POLICY "Farmers can delete own intents"
ON public.market_availability_intents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.farmers
    WHERE farmers.id = market_availability_intents.farmer_id
    AND farmers.user_id = auth.uid()
  )
);

-- Admins can view all intents
CREATE POLICY "Admins can view all intents"
ON public.market_availability_intents
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_market_intents_farmer ON public.market_availability_intents(farmer_id);
CREATE INDEX idx_market_intents_horizon ON public.market_availability_intents(horizon);
CREATE INDEX idx_market_intents_created ON public.market_availability_intents(created_at);

-- Create aggregation function for MPK regional view (no farmer details)
CREATE OR REPLACE FUNCTION public.get_aggregated_market_intent(
  p_horizon market_intent_horizon DEFAULT NULL
)
RETURNS TABLE (
  region TEXT,
  breed TEXT,
  horizon market_intent_horizon,
  total_estimated_heads BIGINT,
  intent_count BIGINT,
  avg_confidence intent_confidence_level
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    f.region,
    mai.breed,
    mai.horizon,
    SUM(mai.estimated_heads)::BIGINT as total_estimated_heads,
    COUNT(*)::BIGINT as intent_count,
    MODE() WITHIN GROUP (ORDER BY mai.confidence_level) as avg_confidence
  FROM public.market_availability_intents mai
  JOIN public.farmers f ON f.id = mai.farmer_id
  WHERE 
    (p_horizon IS NULL OR mai.horizon = p_horizon)
    AND mai.created_at > now() - INTERVAL '90 days'
  GROUP BY f.region, mai.breed, mai.horizon
  ORDER BY f.region, mai.breed, mai.horizon
$$;