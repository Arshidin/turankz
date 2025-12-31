-- ============================================================================
-- CRITICAL FIX: Add database-level FSM enforcement for batch status transitions
-- ============================================================================
-- Issue: Status transitions are only validated in application layer
-- Fix: Add database triggers to enforce FSM rules at database level
-- ============================================================================

-- ============================================================================
-- BATCH STATUS TRANSITION VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_batch_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_transitions TEXT[];
  is_valid BOOLEAN := false;
BEGIN
  -- If status hasn't changed, allow (other fields updated)
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define valid transitions based on FSM rules
  -- draft → forecast
  IF OLD.status = 'draft' AND NEW.status = 'forecast' THEN
    is_valid := true;
  -- forecast → soft_committed
  ELSIF OLD.status = 'forecast' AND NEW.status = 'soft_committed' THEN
    is_valid := true;
  -- soft_committed → confirmed
  ELSIF OLD.status = 'soft_committed' AND NEW.status = 'confirmed' THEN
    is_valid := true;
  -- confirmed → matched (admin only, but we validate transition here)
  ELSIF OLD.status = 'confirmed' AND NEW.status = 'matched' THEN
    is_valid := true;
  -- matched → closed
  ELSIF OLD.status = 'matched' AND NEW.status = 'closed' THEN
    is_valid := true;
  -- confirmed → closed (admin can close directly)
  ELSIF OLD.status = 'confirmed' AND NEW.status = 'closed' THEN
    is_valid := true;
  ELSE
    -- Invalid transition
    RAISE EXCEPTION 'Invalid batch status transition: % → %. Valid transitions: draft→forecast, forecast→soft_committed, soft_committed→confirmed, confirmed→matched/closed, matched→closed',
      OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS batch_status_validation ON public.batches;
CREATE TRIGGER batch_status_validation
BEFORE UPDATE ON public.batches
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.validate_batch_status_transition();

-- ============================================================================
-- POOL REQUEST STATUS TRANSITION VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_pool_request_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- If status hasn't changed, allow
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define valid transitions based on FSM rules
  -- draft → submitted
  IF OLD.status = 'draft' AND NEW.status = 'submitted' THEN
    RETURN NEW;
  -- draft → cancelled
  ELSIF OLD.status = 'draft' AND NEW.status = 'cancelled' THEN
    RETURN NEW;
  -- submitted → matching
  ELSIF OLD.status = 'submitted' AND NEW.status = 'matching' THEN
    RETURN NEW;
  -- submitted → cancelled
  ELSIF OLD.status = 'submitted' AND NEW.status = 'cancelled' THEN
    RETURN NEW;
  -- matching → partial
  ELSIF OLD.status = 'matching' AND NEW.status = 'partial' THEN
    RETURN NEW;
  -- matching → fulfilled
  ELSIF OLD.status = 'matching' AND NEW.status = 'fulfilled' THEN
    RETURN NEW;
  -- matching → cancelled
  ELSIF OLD.status = 'matching' AND NEW.status = 'cancelled' THEN
    RETURN NEW;
  -- partial → fulfilled
  ELSIF OLD.status = 'partial' AND NEW.status = 'fulfilled' THEN
    RETURN NEW;
  -- partial → cancelled
  ELSIF OLD.status = 'partial' AND NEW.status = 'cancelled' THEN
    RETURN NEW;
  -- fulfilled → closed
  ELSIF OLD.status = 'fulfilled' AND NEW.status = 'closed' THEN
    RETURN NEW;
  ELSE
    -- Invalid transition
    RAISE EXCEPTION 'Invalid pool request status transition: % → %. Valid transitions: draft→submitted/cancelled, submitted→matching/cancelled, matching→partial/fulfilled/cancelled, partial→fulfilled/cancelled, fulfilled→closed',
      OLD.status, NEW.status;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS pool_request_status_validation ON public.purchase_pool_requests;
CREATE TRIGGER pool_request_status_validation
BEFORE UPDATE ON public.purchase_pool_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.validate_pool_request_status_transition();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After this migration, verify that:
-- 1. Invalid batch status transitions are rejected at database level
-- 2. Invalid pool request status transitions are rejected at database level
-- 3. Valid transitions still work correctly
-- 4. Application error handling works for rejected transitions

