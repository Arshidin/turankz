-- Create pool request activity log table for audit trail
CREATE TABLE public.pool_request_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.purchase_pool_requests(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  performed_by TEXT NOT NULL,
  is_admin_override BOOLEAN NOT NULL DEFAULT false,
  override_reason TEXT,
  note TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pool_request_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view pool request activity logs
CREATE POLICY "Admins can view pool request activity logs"
ON public.pool_request_activity_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- System can create activity log entries
CREATE POLICY "System can create pool request activity logs"
ON public.pool_request_activity_log
FOR INSERT
WITH CHECK (true);

-- Add admin override columns to purchase_pool_requests
ALTER TABLE public.purchase_pool_requests 
ADD COLUMN IF NOT EXISTS admin_modified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_modified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_modified_by TEXT,
ADD COLUMN IF NOT EXISTS admin_modification_reason TEXT;

-- Create index for faster lookups
CREATE INDEX idx_pool_request_activity_log_request_id 
ON public.pool_request_activity_log(request_id);

CREATE INDEX idx_pool_request_activity_log_created_at 
ON public.pool_request_activity_log(created_at DESC);