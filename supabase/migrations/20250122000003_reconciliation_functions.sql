-- ============================================================================
-- RECONCILIATION FUNCTIONS FOR DATA CONSISTENCY
-- ============================================================================
-- This migration creates functions to detect and report data inconsistencies
-- that can occur due to partial state failures or manual data modifications.
-- These functions can be called by background jobs or admin tools.
-- ============================================================================

-- ============================================================================
-- FUNCTION: Detect Inconsistencies in Matching-Execution Relationship
-- ============================================================================
-- Finds matchings that are finalized but missing execution records
-- ============================================================================

CREATE OR REPLACE FUNCTION public.detect_missing_executions()
RETURNS TABLE(
  match_id UUID,
  batch_id UUID,
  request_id UUID,
  heads_matched INTEGER,
  finalized_at TIMESTAMP WITH TIME ZONE,
  issue_type TEXT,
  severity TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id as match_id,
    pm.batch_id,
    pm.request_id,
    pm.heads_matched,
    pm.finalized_at,
    'missing_execution'::TEXT as issue_type,
    'critical'::TEXT as severity
  FROM public.pool_matches pm
  LEFT JOIN public.offtake_executions oe ON oe.match_id = pm.id
  WHERE pm.status = 'finalized'
    AND oe.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Detect Inconsistencies in Request Matched Volume
-- ============================================================================
-- Finds requests where matched_volume doesn't match sum of matchings
-- ============================================================================

CREATE OR REPLACE FUNCTION public.detect_matched_volume_mismatches()
RETURNS TABLE(
  request_id UUID,
  request_number TEXT,
  stored_matched_volume INTEGER,
  calculated_matched_volume INTEGER,
  difference INTEGER,
  issue_type TEXT,
  severity TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ppr.id as request_id,
    ppr.request_number,
    ppr.matched_volume as stored_matched_volume,
    COALESCE(SUM(pm.heads_matched), 0)::INTEGER as calculated_matched_volume,
    (ppr.matched_volume - COALESCE(SUM(pm.heads_matched), 0))::INTEGER as difference,
    'matched_volume_mismatch'::TEXT as issue_type,
    CASE 
      WHEN ABS(ppr.matched_volume - COALESCE(SUM(pm.heads_matched), 0)) > 10 THEN 'critical'::TEXT
      ELSE 'warning'::TEXT
    END as severity
  FROM public.purchase_pool_requests ppr
  LEFT JOIN public.pool_matches pm ON pm.request_id = ppr.id AND pm.status != 'cancelled'
  WHERE ppr.status IN ('matching', 'partial', 'fulfilled')
  GROUP BY ppr.id, ppr.request_number, ppr.matched_volume
  HAVING ppr.matched_volume != COALESCE(SUM(pm.heads_matched), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Detect Inconsistencies in Request Status vs Matched Volume
-- ============================================================================
-- Finds requests where status doesn't match matched_volume
-- ============================================================================

CREATE OR REPLACE FUNCTION public.detect_request_status_mismatches()
RETURNS TABLE(
  request_id UUID,
  request_number TEXT,
  current_status TEXT,
  expected_status TEXT,
  matched_volume INTEGER,
  required_volume INTEGER,
  issue_type TEXT,
  severity TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ppr.id as request_id,
    ppr.request_number,
    ppr.status::TEXT as current_status,
    CASE 
      WHEN ppr.matched_volume >= ppr.required_volume THEN 'fulfilled'::TEXT
      WHEN ppr.matched_volume > 0 THEN 'partial'::TEXT
      WHEN ppr.status = 'submitted' THEN 'matching'::TEXT
      ELSE ppr.status::TEXT
    END as expected_status,
    ppr.matched_volume,
    ppr.required_volume,
    'status_mismatch'::TEXT as issue_type,
    'warning'::TEXT as severity
  FROM public.purchase_pool_requests ppr
  WHERE ppr.status IN ('matching', 'partial', 'fulfilled')
    AND (
      -- Status should be 'fulfilled' if matched_volume >= required_volume
      (ppr.matched_volume >= ppr.required_volume AND ppr.status != 'fulfilled')
      OR
      -- Status should be 'partial' if matched_volume > 0 but < required_volume
      (ppr.matched_volume > 0 AND ppr.matched_volume < ppr.required_volume AND ppr.status NOT IN ('partial', 'fulfilled'))
      OR
      -- Status should be 'matching' if matched_volume = 0 and status is 'submitted'
      (ppr.matched_volume = 0 AND ppr.status = 'submitted')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Detect Executions with Invalid Match Status
-- ============================================================================
-- Finds executions where the matching is cancelled but execution exists
-- ============================================================================

CREATE OR REPLACE FUNCTION public.detect_invalid_execution_matches()
RETURNS TABLE(
  execution_id UUID,
  match_id UUID,
  execution_status TEXT,
  match_status TEXT,
  issue_type TEXT,
  severity TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oe.id as execution_id,
    oe.match_id,
    oe.status::TEXT as execution_status,
    pm.status::TEXT as match_status,
    'invalid_match_status'::TEXT as issue_type,
    'critical'::TEXT as severity
  FROM public.offtake_executions oe
  JOIN public.pool_matches pm ON pm.id = oe.match_id
  WHERE pm.status = 'cancelled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Comprehensive Reconciliation Report
-- ============================================================================
-- Runs all reconciliation checks and returns a unified report
-- ============================================================================

CREATE OR REPLACE FUNCTION public.run_reconciliation_report()
RETURNS TABLE(
  issue_type TEXT,
  severity TEXT,
  count BIGINT,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  -- Missing executions
  SELECT 
    'missing_executions'::TEXT,
    'critical'::TEXT,
    COUNT(*)::BIGINT,
    jsonb_agg(jsonb_build_object(
      'match_id', match_id,
      'batch_id', batch_id,
      'request_id', request_id,
      'finalized_at', finalized_at
    ))
  FROM public.detect_missing_executions()
  
  UNION ALL
  
  -- Matched volume mismatches
  SELECT 
    'matched_volume_mismatches'::TEXT,
    MAX(severity)::TEXT,
    COUNT(*)::BIGINT,
    jsonb_agg(jsonb_build_object(
      'request_id', request_id,
      'request_number', request_number,
      'stored_volume', stored_matched_volume,
      'calculated_volume', calculated_matched_volume,
      'difference', difference
    ))
  FROM public.detect_matched_volume_mismatches()
  
  UNION ALL
  
  -- Request status mismatches
  SELECT 
    'request_status_mismatches'::TEXT,
    MAX(severity)::TEXT,
    COUNT(*)::BIGINT,
    jsonb_agg(jsonb_build_object(
      'request_id', request_id,
      'request_number', request_number,
      'current_status', current_status,
      'expected_status', expected_status,
      'matched_volume', matched_volume,
      'required_volume', required_volume
    ))
  FROM public.detect_request_status_mismatches()
  
  UNION ALL
  
  -- Invalid execution matches
  SELECT 
    'invalid_execution_matches'::TEXT,
    MAX(severity)::TEXT,
    COUNT(*)::BIGINT,
    jsonb_agg(jsonb_build_object(
      'execution_id', execution_id,
      'match_id', match_id,
      'execution_status', execution_status,
      'match_status', match_status
    ))
  FROM public.detect_invalid_execution_matches();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Auto-Fix Missing Executions
-- ============================================================================
-- Automatically creates missing execution records for finalized matchings
-- Should be run after reconciliation detects issues
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_fix_missing_executions()
RETURNS TABLE(
  fixed_count INTEGER,
  errors JSONB
) AS $$
DECLARE
  v_match RECORD;
  v_execution_id UUID;
  v_fixed_count INTEGER := 0;
  v_errors JSONB := '[]'::JSONB;
  v_error JSONB;
BEGIN
  FOR v_match IN 
    SELECT * FROM public.detect_missing_executions()
  LOOP
    BEGIN
      -- Get delivery period from request or batch
      INSERT INTO public.offtake_executions (
        match_id,
        batch_id,
        request_id,
        matched_volume,
        delivery_period,
        reference_price_at_match,
        status
      )
      SELECT 
        v_match.match_id,
        v_match.batch_id,
        v_match.request_id,
        v_match.heads_matched,
        COALESCE(
          ppr.target_delivery_period::TEXT,
          b.delivery_period::TEXT,
          'short_term'
        )::public.delivery_period,
        pm.base_price_per_kg,
        'matched'
      FROM public.pool_matches pm
      JOIN public.purchase_pool_requests ppr ON ppr.id = pm.request_id
      JOIN public.batches b ON b.id = pm.batch_id
      WHERE pm.id = v_match.match_id
      RETURNING id INTO v_execution_id;

      v_fixed_count := v_fixed_count + 1;

      -- Log the fix
      INSERT INTO public.activity_log (
        event_type,
        actor_role,
        actor_name,
        description,
        target_type,
        target_id,
        metadata
      ) VALUES (
        'batch_confirmed',
        'admin',
        'Reconciliation Job',
        format('Auto-created execution record for match %s (reconciliation fix)', v_match.match_id),
        'execution',
        v_execution_id,
        jsonb_build_object(
          'trigger', 'reconciliation_auto_fix',
          'match_id', v_match.match_id
        )
      );

    EXCEPTION
      WHEN OTHERS THEN
        v_error := jsonb_build_object(
          'match_id', v_match.match_id,
          'error', SQLERRM
        );
        v_errors := v_errors || v_error;
    END;
  END LOOP;

  RETURN QUERY SELECT v_fixed_count, v_errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Auto-Fix Matched Volume Mismatches
-- ============================================================================
-- Automatically corrects matched_volume based on actual matchings
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_fix_matched_volume_mismatches()
RETURNS TABLE(
  fixed_count INTEGER,
  errors JSONB
) AS $$
DECLARE
  v_request RECORD;
  v_correct_volume INTEGER;
  v_fixed_count INTEGER := 0;
  v_errors JSONB := '[]'::JSONB;
  v_error JSONB;
BEGIN
  FOR v_request IN 
    SELECT * FROM public.detect_matched_volume_mismatches()
  LOOP
    BEGIN
      -- Calculate correct volume
      SELECT COALESCE(SUM(pm.heads_matched), 0)::INTEGER INTO v_correct_volume
      FROM public.pool_matches pm
      WHERE pm.request_id = v_request.request_id
        AND pm.status != 'cancelled';

      -- Update matched_volume
      UPDATE public.purchase_pool_requests
      SET matched_volume = v_correct_volume
      WHERE id = v_request.request_id;

      v_fixed_count := v_fixed_count + 1;

      -- Log the fix
      INSERT INTO public.activity_log (
        event_type,
        actor_role,
        actor_name,
        description,
        target_type,
        target_id,
        metadata
      ) VALUES (
        'pool_request_updated',
        'admin',
        'Reconciliation Job',
        format('Auto-corrected matched_volume for request %s: %s → %s (reconciliation fix)', 
          v_request.request_number, v_request.stored_matched_volume, v_correct_volume),
        'pool_request',
        v_request.request_id,
        jsonb_build_object(
          'trigger', 'reconciliation_auto_fix',
          'old_volume', v_request.stored_matched_volume,
          'new_volume', v_correct_volume
        )
      );

    EXCEPTION
      WHEN OTHERS THEN
        v_error := jsonb_build_object(
          'request_id', v_request.request_id,
          'error', SQLERRM
        );
        v_errors := v_errors || v_error;
    END;
  END LOOP;

  RETURN QUERY SELECT v_fixed_count, v_errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.detect_missing_executions() IS 
'Detects finalized matchings that are missing execution records. Critical issue.';

COMMENT ON FUNCTION public.detect_matched_volume_mismatches() IS 
'Detects requests where stored matched_volume doesn''t match sum of actual matchings.';

COMMENT ON FUNCTION public.detect_request_status_mismatches() IS 
'Detects requests where status doesn''t match matched_volume (should be partial/fulfilled).';

COMMENT ON FUNCTION public.detect_invalid_execution_matches() IS 
'Detects executions linked to cancelled matchings. Critical issue.';

COMMENT ON FUNCTION public.run_reconciliation_report() IS 
'Comprehensive reconciliation report. Runs all checks and returns unified results.';

COMMENT ON FUNCTION public.auto_fix_missing_executions() IS 
'Auto-creates missing execution records for finalized matchings. Use with caution.';

COMMENT ON FUNCTION public.auto_fix_matched_volume_mismatches() IS 
'Auto-corrects matched_volume based on actual matchings. Use with caution.';

