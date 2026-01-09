-- ============================================================================
-- BATCH STATUS FSM SIMPLIFICATION MIGRATION
-- ============================================================================
-- Purpose: Simplify batch status from 6 states to 4 states
--
-- BEFORE (6 statuses):
--   draft → forecast → soft_committed → confirmed → matched → closed
--
-- AFTER (4 statuses):
--   draft → available → committed → completed
--
-- Migration mapping:
--   draft          → draft     (unchanged)
--   forecast       → available (merged)
--   soft_committed → available (merged)
--   confirmed      → committed (renamed)
--   matched        → completed (merged)
--   closed         → completed (merged)
-- ============================================================================

-- Step 1: Create new simplified enum type
CREATE TYPE public.batch_status_v2 AS ENUM (
  'draft',
  'available',
  'committed',
  'completed'
);

-- Step 2: Add temporary column with new enum
ALTER TABLE public.batches
ADD COLUMN status_v2 public.batch_status_v2;

-- Step 3: Migrate existing data to new statuses
UPDATE public.batches SET status_v2 =
  CASE
    WHEN status::text = 'draft' THEN 'draft'::public.batch_status_v2
    WHEN status::text = 'forecast' THEN 'available'::public.batch_status_v2
    WHEN status::text = 'soft_committed' THEN 'available'::public.batch_status_v2
    WHEN status::text = 'confirmed' THEN 'committed'::public.batch_status_v2
    WHEN status::text = 'matched' THEN 'completed'::public.batch_status_v2
    WHEN status::text = 'closed' THEN 'completed'::public.batch_status_v2
    ELSE 'draft'::public.batch_status_v2  -- Default fallback
  END;

-- Step 4: Make new column NOT NULL
ALTER TABLE public.batches
ALTER COLUMN status_v2 SET NOT NULL;

-- Step 5: Drop old column and rename new one
ALTER TABLE public.batches
DROP COLUMN status;

ALTER TABLE public.batches
RENAME COLUMN status_v2 TO status;

-- Step 6: Drop old enum type
DROP TYPE IF EXISTS public.batch_status;

-- Step 7: Rename new enum to original name
ALTER TYPE public.batch_status_v2 RENAME TO batch_status;

-- Step 8: Set default value for new batches
ALTER TABLE public.batches
ALTER COLUMN status SET DEFAULT 'draft'::public.batch_status;

-- ============================================================================
-- UPDATE FSM VALIDATION TRIGGER
-- ============================================================================
-- Update the trigger function to enforce new FSM rules

CREATE OR REPLACE FUNCTION public.validate_batch_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow any status on INSERT (should always be 'draft' from application)
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- On UPDATE, validate the status transition
  IF OLD.status = NEW.status THEN
    -- No status change, allow
    RETURN NEW;
  END IF;

  -- Define allowed transitions (simplified FSM)
  -- draft → available
  -- available → committed
  -- committed → completed

  IF OLD.status = 'draft' AND NEW.status = 'available' THEN
    RETURN NEW;
  ELSIF OLD.status = 'available' AND NEW.status = 'committed' THEN
    RETURN NEW;
  ELSIF OLD.status = 'committed' AND NEW.status = 'completed' THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Invalid batch status transition from % to %', OLD.status, NEW.status;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger if it exists
DROP TRIGGER IF EXISTS enforce_batch_status_transition ON public.batches;

CREATE TRIGGER enforce_batch_status_transition
  BEFORE UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_batch_status_transition();

-- ============================================================================
-- UPDATE INDEXES
-- ============================================================================
-- Recreate index on status column for better query performance
DROP INDEX IF EXISTS idx_batches_status;
CREATE INDEX idx_batches_status ON public.batches(status);

-- ============================================================================
-- LOG MIGRATION
-- ============================================================================
-- Insert a record into activity log to track this migration
DO $$
BEGIN
  -- Check if activity_log table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'batch_activity_log') THEN
    INSERT INTO public.batch_activity_log (
      batch_id,
      action,
      old_value,
      new_value,
      changed_by,
      notes
    )
    SELECT
      id,
      'fsm_migration',
      NULL,
      status::text,
      NULL,
      'Migrated to simplified FSM v2 (6→4 statuses)'
    FROM public.batches
    WHERE status IS NOT NULL;
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist, skip logging
    NULL;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (for manual verification after migration)
-- ============================================================================
-- Run these queries to verify the migration:
--
-- 1. Check all batches have valid new statuses:
--    SELECT status, COUNT(*) FROM batches GROUP BY status;
--
-- 2. Verify enum values:
--    SELECT enumlabel FROM pg_enum
--    WHERE enumtypid = 'batch_status'::regtype ORDER BY enumsortorder;
--
-- 3. Check for any NULL statuses:
--    SELECT COUNT(*) FROM batches WHERE status IS NULL;
-- ============================================================================
