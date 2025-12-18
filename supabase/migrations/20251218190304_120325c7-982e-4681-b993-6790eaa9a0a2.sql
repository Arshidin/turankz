-- Create matching status enum
CREATE TYPE public.matching_status AS ENUM ('active', 'finalized', 'cancelled');

-- Enhance pool_matches table with additional fields for formal matching entity
ALTER TABLE public.pool_matches 
ADD COLUMN IF NOT EXISTS matching_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS matching_window_id UUID REFERENCES public.matching_windows(id);

-- Drop the old status column and recreate with enum type
ALTER TABLE public.pool_matches DROP COLUMN IF EXISTS status;
ALTER TABLE public.pool_matches ADD COLUMN status matching_status NOT NULL DEFAULT 'active';

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_pool_matches_status ON public.pool_matches(status);
CREATE INDEX IF NOT EXISTS idx_pool_matches_matching_date ON public.pool_matches(matching_date);
CREATE INDEX IF NOT EXISTS idx_pool_matches_matching_window ON public.pool_matches(matching_window_id);

-- Create matching activity log for audit trail
CREATE TABLE public.matching_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.pool_matches(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  performed_by TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on matching activity log
ALTER TABLE public.matching_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view/create matching activity logs
CREATE POLICY "Admins can view matching activity logs"
ON public.matching_activity_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create matching activity logs"
ON public.matching_activity_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));