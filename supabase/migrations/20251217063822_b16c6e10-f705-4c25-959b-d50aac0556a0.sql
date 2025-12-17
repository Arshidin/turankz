-- Create notification type enum
CREATE TYPE public.notification_type AS ENUM (
  'pool_invitation',
  'batch_action_required',
  'batch_status_changed',
  'grading_updated',
  'request_status_changed',
  'watchlist_supply_added',
  'matching_window_approaching',
  'request_at_risk',
  'farmer_declined',
  'request_stalled',
  'reliability_dropped'
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_role TEXT NOT NULL CHECK (user_role IN ('farmer', 'mpk', 'admin')),
  target_id TEXT, -- optional: farmer_id, mpk_id, or user_id
  notification_type notification_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  link_to TEXT, -- URL path to navigate to
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity log event type enum
CREATE TYPE public.activity_event_type AS ENUM (
  'farmer_onboarded',
  'farmer_grading_changed',
  'farmer_restricted',
  'farmer_unrestricted',
  'mpk_onboarded',
  'mpk_status_changed',
  'mpk_restricted',
  'mpk_unrestricted',
  'pool_request_created',
  'pool_request_updated',
  'pool_request_cancelled',
  'pool_match_proposed',
  'pool_match_confirmed',
  'batch_confirmed',
  'batch_declined',
  'invitation_sent',
  'invitation_accepted',
  'invitation_declined'
);

-- Create activity log table (Admin-only)
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type activity_event_type NOT NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('farmer', 'mpk', 'admin', 'system')),
  actor_name TEXT,
  target_type TEXT CHECK (target_type IN ('farmer', 'mpk', 'batch', 'pool_request', 'pool_match')),
  target_id TEXT,
  target_name TEXT,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Notifications policies (role-based access)
CREATE POLICY "Users can view their role notifications"
ON public.notifications
FOR SELECT
USING (true);

CREATE POLICY "Users can update their notifications"
ON public.notifications
FOR UPDATE
USING (true);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Activity log policies (Admin-only read, system write)
CREATE POLICY "Admins can view activity log"
ON public.activity_log
FOR SELECT
USING (true);

CREATE POLICY "System can create activity log entries"
ON public.activity_log
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_notifications_role ON public.notifications(user_role);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_activity_log_event ON public.activity_log(event_type);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_actor ON public.activity_log(actor_role);