-- Create delivery_period ENUM type
CREATE TYPE public.delivery_period AS ENUM (
  'short_term',   -- 0-3 months
  'mid_term',     -- 3-6 months
  'long_term'     -- 6-12 months
);

-- Add delivery_period to batches table (farmer's readiness signal)
ALTER TABLE public.batches 
ADD COLUMN delivery_period public.delivery_period DEFAULT 'short_term';

-- Add target_delivery_period to purchase_pool_requests (MPK's target horizon)
ALTER TABLE public.purchase_pool_requests 
ADD COLUMN target_delivery_period public.delivery_period DEFAULT 'short_term';

-- Add eligible_delivery_periods to matching_windows (which periods can be matched)
ALTER TABLE public.matching_windows 
ADD COLUMN eligible_delivery_periods public.delivery_period[] DEFAULT ARRAY['short_term']::public.delivery_period[];

-- Add expected_delivery_range to pool_matches (generated after matching)
ALTER TABLE public.pool_matches 
ADD COLUMN expected_delivery_start DATE,
ADD COLUMN expected_delivery_end DATE;