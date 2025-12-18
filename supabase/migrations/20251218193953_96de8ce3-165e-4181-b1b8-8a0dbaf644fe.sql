-- Add premium tracking fields to pool_matches for locking eligibility after finalization
ALTER TABLE public.pool_matches
ADD COLUMN IF NOT EXISTS base_price_per_kg integer,
ADD COLUMN IF NOT EXISTS standard_premium integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS predictability_premium integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS volume_consistency_premium integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reliability_premium integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_premium integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price_per_kg integer,
ADD COLUMN IF NOT EXISTS premium_locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_locked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS premium_breakdown jsonb;

-- Add comment explaining the premium fields
COMMENT ON COLUMN public.pool_matches.premium_locked IS 'Premium eligibility is frozen after matching finalization';
COMMENT ON COLUMN public.pool_matches.premium_breakdown IS 'JSON breakdown of premium eligibility criteria met';