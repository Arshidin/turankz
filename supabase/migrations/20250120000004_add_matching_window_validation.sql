-- ============================================================================
-- CRITICAL FIX: Add database-level validation for matching window constraints
-- ============================================================================
-- Issue: Matching creation is only validated in application layer
-- Fix: Add database trigger to enforce matching window rules
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_matching_window()
RETURNS TRIGGER AS $$
DECLARE
  window_record RECORD;
  window_status public.matching_window_status;
  lock_date DATE;
  current_date_val DATE;
BEGIN
  -- If no matching_window_id, skip validation (allow null for backward compatibility)
  IF NEW.matching_window_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get matching window details
  SELECT status, lock_date INTO window_record
  FROM public.matching_windows
  WHERE id = NEW.matching_window_id;

  -- If window not found, allow (might be deleted, but we don't block)
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  window_status := window_record.status;
  lock_date := window_record.lock_date;
  current_date_val := CURRENT_DATE;

  -- Validation rule 1: Window must be in 'locked' or 'closed' status
  IF window_status NOT IN ('locked', 'closed') THEN
    RAISE EXCEPTION 'Matching can only be created when matching window is locked or closed. Current window status: %',
      window_status;
  END IF;

  -- Validation rule 2: Current date must be >= lock_date
  IF current_date_val < lock_date THEN
    RAISE EXCEPTION 'Matching can only be created after matching window lock date. Lock date: %, Current date: %',
      lock_date, current_date_val;
  END IF;

  -- All validations passed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS matching_window_validation ON public.pool_matches;
CREATE TRIGGER matching_window_validation
BEFORE INSERT ON public.pool_matches
FOR EACH ROW
EXECUTE FUNCTION public.validate_matching_window();

-- ============================================================================
-- NOTE: We don't validate on UPDATE because:
-- 1. Once a matching is created, it should be able to be updated regardless of window status
-- 2. Only creation is time-constrained
-- ============================================================================

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After this migration, verify that:
-- 1. Matchings cannot be created when window is 'upcoming' or 'active'
-- 2. Matchings cannot be created before lock_date
-- 3. Matchings can be created when window is 'locked' or 'closed' and date >= lock_date
-- 4. Existing matchings can still be updated regardless of window status

