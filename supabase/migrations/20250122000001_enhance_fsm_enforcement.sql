-- ============================================================================
-- ENHANCED FSM ENFORCEMENT
-- ============================================================================
-- This migration enhances existing FSM triggers and adds:
-- 1. Execution status transition validation
-- 2. Matching status transition validation
-- 3. Improved error messages
-- 4. Role-based validation (where applicable at DB level)
-- ============================================================================

-- ============================================================================
-- EXECUTION STATUS TRANSITION VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_execution_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If status hasn't changed, allow
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define valid transitions based on FSM rules
  -- matched → scheduled (admin only, but we validate transition here)
  IF OLD.status = 'matched' AND NEW.status = 'scheduled' THEN
    RETURN NEW;
  -- scheduled → delivered (MPK/admin)
  ELSIF OLD.status = 'scheduled' AND NEW.status = 'delivered' THEN
    RETURN NEW;
  -- scheduled → matched (admin revert)
  ELSIF OLD.status = 'scheduled' AND NEW.status = 'matched' THEN
    RETURN NEW;
  -- delivered → confirmed (admin)
  ELSIF OLD.status = 'delivered' AND NEW.status = 'confirmed' THEN
    RETURN NEW;
  -- delivered → scheduled (admin revert)
  ELSIF OLD.status = 'delivered' AND NEW.status = 'scheduled' THEN
    RETURN NEW;
  -- confirmed → settled (admin)
  ELSIF OLD.status = 'confirmed' AND NEW.status = 'settled' THEN
    RETURN NEW;
  -- confirmed → delivered (admin revert)
  ELSIF OLD.status = 'confirmed' AND NEW.status = 'delivered' THEN
    RETURN NEW;
  -- settled → closed (admin)
  ELSIF OLD.status = 'settled' AND NEW.status = 'closed' THEN
    RETURN NEW;
  -- settled → confirmed (admin revert)
  ELSIF OLD.status = 'settled' AND NEW.status = 'confirmed' THEN
    RETURN NEW;
  ELSE
    -- Invalid transition
    RAISE EXCEPTION 'Invalid execution status transition: % → %. Valid transitions: matched→scheduled, scheduled→delivered/matched, delivered→confirmed/scheduled, confirmed→settled/delivered, settled→closed/confirmed',
      OLD.status, NEW.status;
  END IF;
END;
$$;

-- Create trigger (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'offtake_executions'
  ) THEN
    DROP TRIGGER IF EXISTS execution_status_validation ON public.offtake_executions;
    CREATE TRIGGER execution_status_validation
    BEFORE UPDATE ON public.offtake_executions
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.validate_execution_status_transition();
  END IF;
END $$;

-- ============================================================================
-- MATCHING STATUS TRANSITION VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_matching_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If status hasn't changed, allow
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define valid transitions based on FSM rules
  -- active → finalized
  IF OLD.status = 'active' AND NEW.status = 'finalized' THEN
    RETURN NEW;
  -- active → cancelled
  ELSIF OLD.status = 'active' AND NEW.status = 'cancelled' THEN
    RETURN NEW;
  ELSE
    -- Invalid transition (finalized and cancelled are terminal states)
    RAISE EXCEPTION 'Invalid matching status transition: % → %. Valid transitions: active→finalized, active→cancelled. Statuses finalized and cancelled are terminal.',
      OLD.status, NEW.status;
  END IF;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS matching_status_validation ON public.pool_matches;
CREATE TRIGGER matching_status_validation
BEFORE UPDATE ON public.pool_matches
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.validate_matching_status_transition();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.validate_execution_status_transition() IS 
'Enforces execution status FSM transitions at database level. Prevents invalid status changes.';

COMMENT ON FUNCTION public.validate_matching_status_transition() IS 
'Enforces matching status FSM transitions at database level. Prevents invalid status changes.';

COMMENT ON TRIGGER execution_status_validation ON public.offtake_executions IS 
'Validates execution status transitions before update. Rejects invalid FSM transitions.';

COMMENT ON TRIGGER matching_status_validation ON public.pool_matches IS 
'Validates matching status transitions before update. Rejects invalid FSM transitions.';

