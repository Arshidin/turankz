-- Drop and recreate pool_request_status enum with new values
-- First, remove the default
ALTER TABLE public.purchase_pool_requests 
  ALTER COLUMN status DROP DEFAULT;

-- Convert column to text temporarily
ALTER TABLE public.purchase_pool_requests 
  ALTER COLUMN status TYPE text USING status::text;

-- Update 'pending' to 'submitted' 
UPDATE public.purchase_pool_requests 
SET status = 'submitted' 
WHERE status = 'pending';

-- Drop old enum
DROP TYPE public.pool_request_status;

-- Create new enum with all statuses
CREATE TYPE public.pool_request_status AS ENUM (
  'draft',
  'submitted', 
  'matching',
  'partial',
  'fulfilled',
  'closed',
  'cancelled'
);

-- Convert back to enum type
ALTER TABLE public.purchase_pool_requests 
  ALTER COLUMN status TYPE public.pool_request_status 
  USING status::public.pool_request_status;

-- Set new default
ALTER TABLE public.purchase_pool_requests 
  ALTER COLUMN status SET DEFAULT 'draft'::pool_request_status;