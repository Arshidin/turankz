-- Migration: Simplify batch_status enum from 7 to 4 statuses
-- Mapping:
--   draft → draft
--   forecast → available  
--   soft_committed → available
--   confirmed → committed
--   matched → completed
--   closed → completed
--   delivered → completed

-- Step 1: Create new enum type
CREATE TYPE public.batch_status_new AS ENUM ('draft', 'available', 'committed', 'completed');

-- Step 2: Add temporary column with new enum type
ALTER TABLE public.batches ADD COLUMN status_new public.batch_status_new;

-- Step 3: Migrate data from old status to new status
UPDATE public.batches SET status_new = 
  CASE 
    WHEN status = 'draft' THEN 'draft'::public.batch_status_new
    WHEN status = 'forecast' THEN 'available'::public.batch_status_new
    WHEN status = 'soft_committed' THEN 'available'::public.batch_status_new
    WHEN status = 'confirmed' THEN 'committed'::public.batch_status_new
    WHEN status = 'matched' THEN 'completed'::public.batch_status_new
    WHEN status = 'closed' THEN 'completed'::public.batch_status_new
    WHEN status = 'delivered' THEN 'completed'::public.batch_status_new
  END;

-- Step 4: Drop the old column
ALTER TABLE public.batches DROP COLUMN status;

-- Step 5: Rename new column to status
ALTER TABLE public.batches RENAME COLUMN status_new TO status;

-- Step 6: Set default value and NOT NULL constraint
ALTER TABLE public.batches ALTER COLUMN status SET DEFAULT 'draft'::public.batch_status_new;
ALTER TABLE public.batches ALTER COLUMN status SET NOT NULL;

-- Step 7: Drop old enum type
DROP TYPE public.batch_status;

-- Step 8: Rename new enum to original name
ALTER TYPE public.batch_status_new RENAME TO batch_status;

-- Step 9: Update Constants enum reference for TypeScript types
COMMENT ON TYPE public.batch_status IS 'Simplified batch status: draft, available, committed, completed';