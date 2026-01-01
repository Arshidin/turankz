-- ============================================================================
-- TRANSACTION SUPPORT FOR MULTI-STEP OPERATIONS
-- ============================================================================
-- This migration creates database functions for atomic multi-step operations
-- that require transaction-like behavior in Supabase (which doesn't support
-- traditional transactions across multiple tables).
-- ============================================================================

-- ============================================================================
-- FUNCTION: Finalize Matching with Execution Creation (Atomic)
-- ============================================================================
-- This function atomically:
-- 1. Updates matching status to 'finalized'
-- 2. Locks premiums
-- 3. Creates execution record
-- 4. Updates activity log
-- 
-- If any step fails, the entire operation is rolled back
-- ============================================================================

CREATE OR REPLACE FUNCTION public.finalize_matching_with_execution(
  p_match_id UUID,
  p_base_price_per_kg NUMERIC,
  p_standard_premium NUMERIC DEFAULT 0,
  p_predictability_premium NUMERIC DEFAULT 0,
  p_volume_consistency_premium NUMERIC DEFAULT 0,
  p_reliability_premium NUMERIC DEFAULT 0,
  p_total_premium NUMERIC DEFAULT 0,
  p_total_price_per_kg NUMERIC,
  p_premium_breakdown JSONB DEFAULT NULL,
  p_note TEXT DEFAULT NULL,
  p_performed_by TEXT DEFAULT 'System'
)
RETURNS TABLE(
  success BOOLEAN,
  matching_id UUID,
  execution_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_matching RECORD;
  v_execution_id UUID;
  v_delivery_period TEXT;
  v_error TEXT;
BEGIN
  -- Start transaction-like block
  BEGIN
    -- Step 1: Get matching details and validate
    SELECT 
      pm.*,
      ppr.target_delivery_period,
      b.delivery_period as batch_delivery_period
    INTO v_matching
    FROM public.pool_matches pm
    JOIN public.purchase_pool_requests ppr ON ppr.id = pm.request_id
    JOIN public.batches b ON b.id = pm.batch_id
    WHERE pm.id = p_match_id;

    IF NOT FOUND THEN
      RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, 'Matching not found'::TEXT;
      RETURN;
    END IF;

    IF v_matching.status != 'active' THEN
      RETURN QUERY SELECT false, p_match_id, NULL::UUID, 
        format('Cannot finalize matching in status: %s. Expected: active', v_matching.status)::TEXT;
      RETURN;
    END IF;

    -- Step 2: Update matching status and lock premiums
    UPDATE public.pool_matches
    SET
      status = 'finalized',
      finalized_at = now(),
      base_price_per_kg = p_base_price_per_kg,
      standard_premium = p_standard_premium,
      predictability_premium = p_predictability_premium,
      volume_consistency_premium = p_volume_consistency_premium,
      reliability_premium = p_reliability_premium,
      total_premium = p_total_premium,
      total_price_per_kg = p_total_price_per_kg,
      premium_locked = true,
      premium_locked_at = now(),
      premium_breakdown = p_premium_breakdown,
      notes = COALESCE(p_note, notes)
    WHERE id = p_match_id;

    -- Step 3: Determine delivery period (prefer request's, fall back to batch's)
    v_delivery_period := COALESCE(
      v_matching.target_delivery_period::TEXT,
      v_matching.batch_delivery_period::TEXT,
      'short_term'
    );

    -- Step 4: Check if execution already exists
    SELECT id INTO v_execution_id
    FROM public.offtake_executions
    WHERE match_id = p_match_id
    LIMIT 1;

    -- Step 5: Create execution record if it doesn't exist
    IF v_execution_id IS NULL THEN
      INSERT INTO public.offtake_executions (
        match_id,
        batch_id,
        request_id,
        matched_volume,
        delivery_period,
        reference_price_at_match,
        status
      ) VALUES (
        p_match_id,
        v_matching.batch_id,
        v_matching.request_id,
        v_matching.heads_matched,
        v_delivery_period::public.delivery_period,
        p_base_price_per_kg,
        'matched'
      )
      RETURNING id INTO v_execution_id;
    END IF;

    -- Step 6: Log activity
    INSERT INTO public.matching_activity_log (
      match_id,
      action_type,
      previous_value,
      new_value,
      performed_by,
      note
    ) VALUES (
      p_match_id,
      'finalized',
      'active',
      'finalized',
      p_performed_by,
      COALESCE(p_note, format('Premiums locked: %s ₸/kg', p_total_premium))
    );

    -- Step 7: Log execution creation
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
      p_performed_by,
      format('Execution record created for match %s', p_match_id),
      'execution',
      v_execution_id,
      jsonb_build_object(
        'trigger', 'matching_finalized',
        'matched_volume', v_matching.heads_matched,
        'match_id', p_match_id
      )
    );

    -- Success
    RETURN QUERY SELECT true, p_match_id, v_execution_id, NULL::TEXT;

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback is automatic in PostgreSQL - all changes are reverted
      GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
      RETURN QUERY SELECT false, p_match_id, NULL::UUID, v_error;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Create Matching with Automatic Status Updates (Atomic)
-- ============================================================================
-- This function atomically:
-- 1. Creates matching record
-- 2. Updates batch status to 'matched' (if needed)
-- 3. Updates request matched_volume
-- 4. Updates request status (matching → partial/fulfilled)
-- 5. Creates activity logs
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_matching_with_updates(
  p_batch_id UUID,
  p_request_id UUID,
  p_heads_matched INTEGER,
  p_matching_window_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT 'System'
)
RETURNS TABLE(
  success BOOLEAN,
  matching_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_matching_id UUID;
  v_batch RECORD;
  v_request RECORD;
  v_new_request_status TEXT;
  v_error TEXT;
BEGIN
  BEGIN
    -- Step 1: Validate batch
    SELECT * INTO v_batch
    FROM public.batches
    WHERE id = p_batch_id;

    IF NOT FOUND THEN
      RETURN QUERY SELECT false, NULL::UUID, 'Batch not found'::TEXT;
      RETURN;
    END IF;

    IF v_batch.status NOT IN ('confirmed', 'soft_committed') THEN
      RETURN QUERY SELECT false, NULL::UUID, 
        format('Batch must be confirmed or soft_committed. Current status: %s', v_batch.status)::TEXT;
      RETURN;
    END IF;

    -- Step 2: Validate request
    SELECT * INTO v_request
    FROM public.purchase_pool_requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
      RETURN QUERY SELECT false, NULL::UUID, 'Pool request not found'::TEXT;
      RETURN;
    END IF;

    IF v_request.status NOT IN ('matching', 'submitted') THEN
      RETURN QUERY SELECT false, NULL::UUID, 
        format('Request must be in matching or submitted status. Current status: %s', v_request.status)::TEXT;
      RETURN;
    END IF;

    -- Step 3: Create matching record
    INSERT INTO public.pool_matches (
      batch_id,
      request_id,
      heads_matched,
      matching_date,
      matching_window_id,
      status,
      notes,
      created_by
    ) VALUES (
      p_batch_id,
      p_request_id,
      p_heads_matched,
      CURRENT_DATE,
      p_matching_window_id,
      'active',
      p_notes,
      p_created_by
    )
    RETURNING id INTO v_matching_id;

    -- Step 4: Update batch status to 'matched' if it's 'confirmed'
    IF v_batch.status = 'confirmed' THEN
      UPDATE public.batches
      SET status = 'matched'
      WHERE id = p_batch_id;
    END IF;

    -- Step 5: Update request matched_volume
    UPDATE public.purchase_pool_requests
    SET 
      matched_volume = matched_volume + p_heads_matched,
      updated_at = now()
    WHERE id = p_request_id
    RETURNING * INTO v_request;

    -- Step 6: Calculate new request status based on matched_volume
    IF v_request.matched_volume >= v_request.required_volume THEN
      v_new_request_status := 'fulfilled';
    ELSIF v_request.matched_volume > 0 THEN
      v_new_request_status := 'partial';
    ELSE
      v_new_request_status := v_request.status; -- Keep current status
    END IF;

    -- Step 7: Update request status if changed
    IF v_new_request_status != v_request.status THEN
      UPDATE public.purchase_pool_requests
      SET status = v_new_request_status::public.pool_request_status
      WHERE id = p_request_id;
    END IF;

    -- Step 8: Log activity
    INSERT INTO public.matching_activity_log (
      match_id,
      action_type,
      previous_value,
      new_value,
      performed_by,
      note
    ) VALUES (
      v_matching_id,
      'created',
      NULL,
      'active',
      p_created_by,
      format('Matching created: %s heads', p_heads_matched)
    );

    -- Success
    RETURN QUERY SELECT true, v_matching_id, NULL::TEXT;

  EXCEPTION
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
      RETURN QUERY SELECT false, NULL::UUID, v_error;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.finalize_matching_with_execution IS 
'Atomically finalizes a matching and creates execution record. All operations succeed or fail together.';

COMMENT ON FUNCTION public.create_matching_with_updates IS 
'Atomically creates matching and updates related batch/request statuses. All operations succeed or fail together.';

