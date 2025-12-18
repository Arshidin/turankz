-- Add admin_unlock fields to batches table
ALTER TABLE public.batches 
ADD COLUMN admin_unlocked BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN admin_unlock_reason TEXT,
ADD COLUMN admin_unlocked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN admin_unlocked_by TEXT;

-- Create admin_overrides audit table for tracking all admin override actions
CREATE TABLE public.admin_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  override_type TEXT NOT NULL, -- 'batch_unlock', 'window_extend', 'window_adjust'
  target_type TEXT NOT NULL, -- 'batch', 'matching_window'
  target_id UUID NOT NULL,
  target_name TEXT,
  previous_value TEXT,
  new_value TEXT,
  reason TEXT NOT NULL, -- Mandatory reason for override
  performed_by TEXT NOT NULL,
  metadata JSONB
);

-- Enable RLS on admin_overrides
ALTER TABLE public.admin_overrides ENABLE ROW LEVEL SECURITY;

-- Only admins can create override entries
CREATE POLICY "Admins can insert overrides"
ON public.admin_overrides
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can view overrides
CREATE POLICY "Admins can view overrides"
ON public.admin_overrides
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_admin_overrides_target ON public.admin_overrides(target_type, target_id);
CREATE INDEX idx_admin_overrides_created ON public.admin_overrides(created_at DESC);