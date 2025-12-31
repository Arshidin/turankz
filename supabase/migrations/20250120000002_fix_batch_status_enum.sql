-- ============================================================================
-- CRITICAL FIX: Update batch_status enum to match application FSM
-- ============================================================================
-- Issue: Database enum is missing 'draft', 'matched', 'closed' and has obsolete 'delivered'
-- Fix: Create new enum with correct values and migrate existing data
-- ============================================================================

-- Step 1: Create new enum type with correct values
CREATE TYPE public.batch_status_new AS ENUM (
  'draft',
  'forecast',
  'soft_committed',
  'confirmed',
  'matched',
  'closed'
);

-- Step 2: Add temporary column with new enum
ALTER TABLE public.batches 
ADD COLUMN status_new public.batch_status_new;

-- Step 3: Migrate existing data
-- Map old values to new values
UPDATE public.batches SET status_new = 
  CASE 
    WHEN status::text = 'forecast' THEN 'forecast'::public.batch_status_new
    WHEN status::text = 'soft_committed' THEN 'soft_committed'::public.batch_status_new
    WHEN status::text = 'confirmed' THEN 'confirmed'::public.batch_status_new
    WHEN status::text = 'delivered' THEN 'closed'::public.batch_status_new  -- Map delivered to closed
    ELSE 'draft'::public.batch_status_new  -- Default for any unexpected values
  END;

-- Step 4: Make new column NOT NULL (after migration)
ALTER TABLE public.batches 
ALTER COLUMN status_new SET NOT NULL;

-- Step 5: Drop old column and rename new one
ALTER TABLE public.batches 
DROP COLUMN status;

ALTER TABLE public.batches 
RENAME COLUMN status_new TO status;

-- Step 6: Drop old enum type (only if no other tables use it)
-- First check if any other tables reference the old enum
-- If batches is the only table, we can drop it
DROP TYPE IF EXISTS public.batch_status;

-- Step 7: Rename new enum to original name
ALTER TYPE public.batch_status_new RENAME TO batch_status;

-- Step 8: Update default value
ALTER TABLE public.batches 
ALTER COLUMN status SET DEFAULT 'draft'::public.batch_status;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After this migration, verify that:
-- 1. All batches have valid status values
-- 2. Default status for new batches is 'draft'
-- 3. Application can read all batch statuses correctly

