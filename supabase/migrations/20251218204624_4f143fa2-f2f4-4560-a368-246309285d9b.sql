-- Create execution status ENUM
CREATE TYPE public.execution_status AS ENUM (
  'matched',      -- Initial state after matching
  'scheduled',    -- Delivery scheduled
  'delivered',    -- MPK confirmed delivery
  'confirmed',    -- Admin confirmed compliance
  'settled',      -- Settlement calculated
  'closed'        -- Fully closed
);

-- Create offtake executions table
CREATE TABLE public.offtake_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Source references
  match_id UUID NOT NULL REFERENCES public.pool_matches(id),
  batch_id UUID NOT NULL REFERENCES public.batches(id),
  request_id UUID NOT NULL REFERENCES public.purchase_pool_requests(id),
  
  -- Volume and period
  matched_volume INTEGER NOT NULL,
  delivery_period public.delivery_period NOT NULL DEFAULT 'short_term',
  
  -- Pricing reference (not actual price - indicative only)
  pricing_formula_reference TEXT DEFAULT 'market_reference_index',
  reference_price_at_match INTEGER,
  
  -- Execution status
  status public.execution_status NOT NULL DEFAULT 'matched',
  
  -- Delivery scheduling
  expected_delivery_start DATE,
  expected_delivery_end DATE,
  delivery_location TEXT,
  scheduling_notes TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  scheduled_by TEXT,
  
  -- MPK delivery confirmation
  actual_delivery_date DATE,
  delivered_volume INTEGER,
  delivery_condition TEXT,
  mpk_delivery_notes TEXT,
  mpk_confirmed_at TIMESTAMP WITH TIME ZONE,
  mpk_confirmed_by TEXT,
  
  -- Admin compliance confirmation
  admin_confirmed_at TIMESTAMP WITH TIME ZONE,
  admin_confirmed_by TEXT,
  admin_compliance_notes TEXT,
  
  -- Settlement (indicative)
  settlement_reference_price INTEGER,
  settlement_premiums_applied INTEGER,
  settlement_indicative_total INTEGER,
  settlement_calculated_at TIMESTAMP WITH TIME ZONE,
  settlement_notes TEXT,
  
  -- Closure
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by TEXT,
  closure_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create execution activity log
CREATE TABLE public.execution_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.offtake_executions(id),
  action_type TEXT NOT NULL,
  previous_status public.execution_status,
  new_status public.execution_status,
  performed_by TEXT NOT NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offtake_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offtake_executions

-- Admins can do everything
CREATE POLICY "Admins can view all executions"
  ON public.offtake_executions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create executions"
  ON public.offtake_executions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update executions"
  ON public.offtake_executions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Farmers can view executions for their batches (read-only)
CREATE POLICY "Farmers can view own batch executions"
  ON public.offtake_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.batches
      WHERE batches.id = offtake_executions.batch_id
      AND batches.user_id = auth.uid()
    )
  );

-- MPKs can view and update executions for their requests
CREATE POLICY "MPKs can view own request executions"
  ON public.offtake_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_pool_requests ppr
      JOIN public.mpks ON mpks.mpk_id = ppr.mpk_id
      WHERE ppr.id = offtake_executions.request_id
      AND mpks.user_id = auth.uid()
    )
  );

CREATE POLICY "MPKs can update own request executions for delivery confirmation"
  ON public.offtake_executions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_pool_requests ppr
      JOIN public.mpks ON mpks.mpk_id = ppr.mpk_id
      WHERE ppr.id = offtake_executions.request_id
      AND mpks.user_id = auth.uid()
    )
    AND status IN ('scheduled', 'delivered')
  );

-- RLS Policies for execution_activity_log
CREATE POLICY "Admins can view execution logs"
  ON public.execution_activity_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create execution logs"
  ON public.execution_activity_log FOR INSERT
  WITH CHECK (true);

-- Farmers can view logs for their executions
CREATE POLICY "Farmers can view own execution logs"
  ON public.execution_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.offtake_executions oe
      JOIN public.batches b ON b.id = oe.batch_id
      WHERE oe.id = execution_activity_log.execution_id
      AND b.user_id = auth.uid()
    )
  );

-- MPKs can view logs for their executions
CREATE POLICY "MPKs can view own execution logs"
  ON public.execution_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.offtake_executions oe
      JOIN public.purchase_pool_requests ppr ON ppr.id = oe.request_id
      JOIN public.mpks ON mpks.mpk_id = ppr.mpk_id
      WHERE oe.id = execution_activity_log.execution_id
      AND mpks.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_offtake_executions_updated_at
  BEFORE UPDATE ON public.offtake_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_offtake_executions_status ON public.offtake_executions(status);
CREATE INDEX idx_offtake_executions_batch_id ON public.offtake_executions(batch_id);
CREATE INDEX idx_offtake_executions_request_id ON public.offtake_executions(request_id);
CREATE INDEX idx_execution_activity_log_execution_id ON public.execution_activity_log(execution_id);