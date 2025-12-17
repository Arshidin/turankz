-- Add livestock acceptance criteria fields to batches table
ALTER TABLE public.batches 
ADD COLUMN breed text,
ADD COLUMN gender text,
ADD COLUMN age_min integer,
ADD COLUMN age_max integer,
ADD COLUMN weight_min integer,
ADD COLUMN weight_max integer;

-- Add acceptance criteria fields to purchase_pool_requests table
ALTER TABLE public.purchase_pool_requests
ADD COLUMN accepted_breeds text[] DEFAULT '{}',
ADD COLUMN accepted_genders text[] DEFAULT '{}',
ADD COLUMN age_range_min integer,
ADD COLUMN age_range_max integer,
ADD COLUMN weight_range_min integer,
ADD COLUMN weight_range_max integer;

-- Add acceptance criteria defaults to mpks table for profile-level defaults
ALTER TABLE public.mpks
ADD COLUMN default_accepted_breeds text[] DEFAULT '{}',
ADD COLUMN default_accepted_genders text[] DEFAULT '{}',
ADD COLUMN default_age_range_min integer,
ADD COLUMN default_age_range_max integer,
ADD COLUMN default_weight_range_min integer,
ADD COLUMN default_weight_range_max integer;