-- Create enum for farmer grading levels
CREATE TYPE public.farmer_grading AS ENUM ('observer', 'declared_supplier', 'standard_supplier');

-- Create enum for reliability status
CREATE TYPE public.farmer_reliability AS ENUM ('high', 'medium', 'low');

-- Create farmers table for admin management
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  farmer_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  grading farmer_grading NOT NULL DEFAULT 'observer',
  reliability farmer_reliability NOT NULL DEFAULT 'medium',
  is_restricted BOOLEAN NOT NULL DEFAULT false,
  restriction_reason TEXT,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_confirmations INTEGER NOT NULL DEFAULT 0,
  total_declines INTEGER NOT NULL DEFAULT 0,
  missed_updates INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

-- Admin can view all farmers
CREATE POLICY "Admins can view all farmers"
ON public.farmers FOR SELECT TO authenticated USING (true);

-- Admin can update farmers
CREATE POLICY "Admins can update farmers"
ON public.farmers FOR UPDATE TO authenticated USING (true);

-- Admin can create farmers
CREATE POLICY "Admins can create farmers"
ON public.farmers FOR INSERT TO authenticated WITH CHECK (true);

-- Create farmer activity log for audit
CREATE TABLE public.farmer_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  note TEXT,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity log
ALTER TABLE public.farmer_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity logs"
ON public.farmer_activity_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can create activity logs"
ON public.farmer_activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_farmers_updated_at
BEFORE UPDATE ON public.farmers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample farmers
INSERT INTO public.farmers (farmer_id, name, region, grading, reliability, last_activity_at, total_confirmations, total_declines, missed_updates)
VALUES
  ('F-001', 'Steppe Gold Farm', 'Akmola', 'standard_supplier', 'high', now() - interval '1 day', 28, 2, 0),
  ('F-002', 'Karaganda Cattle Co', 'Karaganda', 'declared_supplier', 'medium', now() - interval '3 days', 15, 5, 2),
  ('F-003', 'Almaty Agro', 'Almaty', 'standard_supplier', 'high', now() - interval '2 days', 32, 1, 0),
  ('F-004', 'East Plains Ranch', 'East Kazakhstan', 'observer', 'medium', now() - interval '7 days', 4, 3, 4),
  ('F-005', 'Northern Pastures', 'North Kazakhstan', 'declared_supplier', 'low', now() - interval '14 days', 8, 12, 6),
  ('F-006', 'Central Steppes', 'Karaganda', 'observer', 'medium', now() - interval '5 days', 2, 1, 1),
  ('F-007', 'Silk Road Cattle', 'Almaty', 'standard_supplier', 'high', now() - interval '1 day', 45, 3, 0);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.farmers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.farmer_activity_log;