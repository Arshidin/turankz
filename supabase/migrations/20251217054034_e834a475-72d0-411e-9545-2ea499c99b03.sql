-- Create enum for MPK status
CREATE TYPE public.mpk_status AS ENUM ('active', 'restricted', 'inactive');

-- Create MPKs table for admin management
CREATE TABLE public.mpks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mpk_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  intake_regions TEXT[] NOT NULL DEFAULT '{}',
  status mpk_status NOT NULL DEFAULT 'active',
  is_request_restricted BOOLEAN NOT NULL DEFAULT false,
  restriction_reason TEXT,
  max_active_requests INTEGER DEFAULT 5,
  typical_volume_min INTEGER,
  typical_volume_max INTEGER,
  common_target_weeks TEXT[],
  total_requests INTEGER NOT NULL DEFAULT 0,
  fulfilled_requests INTEGER NOT NULL DEFAULT 0,
  partial_requests INTEGER NOT NULL DEFAULT 0,
  cancelled_requests INTEGER NOT NULL DEFAULT 0,
  request_changes_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mpks ENABLE ROW LEVEL SECURITY;

-- Admin can view all MPKs
CREATE POLICY "Admins can view all mpks"
ON public.mpks FOR SELECT TO authenticated USING (true);

-- Admin can update MPKs
CREATE POLICY "Admins can update mpks"
ON public.mpks FOR UPDATE TO authenticated USING (true);

-- Admin can create MPKs
CREATE POLICY "Admins can create mpks"
ON public.mpks FOR INSERT TO authenticated WITH CHECK (true);

-- Create MPK activity log for audit
CREATE TABLE public.mpk_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mpk_id UUID NOT NULL REFERENCES public.mpks(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  note TEXT,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity log
ALTER TABLE public.mpk_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view mpk activity logs"
ON public.mpk_activity_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can create mpk activity logs"
ON public.mpk_activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_mpks_updated_at
BEFORE UPDATE ON public.mpks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample MPKs
INSERT INTO public.mpks (mpk_id, name, intake_regions, status, typical_volume_min, typical_volume_max, common_target_weeks, total_requests, fulfilled_requests, partial_requests, cancelled_requests, request_changes_count, last_activity_at)
VALUES
  ('MPK-01', 'Astana Beef Co', ARRAY['Akmola', 'North Kazakhstan'], 'active', 50, 120, ARRAY['W51', 'W52', 'W01'], 24, 18, 4, 2, 3, now() - interval '1 day'),
  ('MPK-02', 'Karaganda Processing', ARRAY['Karaganda', 'East Kazakhstan'], 'active', 80, 150, ARRAY['W52', 'W01'], 31, 22, 6, 3, 8, now() - interval '2 days'),
  ('MPK-03', 'East KZ Meats', ARRAY['East Kazakhstan'], 'active', 30, 60, ARRAY['W51', 'W52'], 15, 10, 3, 2, 2, now() - interval '3 days'),
  ('MPK-04', 'Almaty Meats', ARRAY['Almaty', 'Zhambyl'], 'active', 60, 100, ARRAY['W52', 'W01', 'W02'], 28, 20, 5, 3, 5, now() - interval '1 day'),
  ('MPK-05', 'Western Processors', ARRAY['Aktobe', 'Mangystau'], 'restricted', 40, 80, ARRAY['W01', 'W02'], 12, 5, 2, 5, 12, now() - interval '14 days'),
  ('MPK-06', 'Southern Meats Ltd', ARRAY['Turkestan', 'Kyzylorda'], 'inactive', 25, 50, ARRAY['W52'], 8, 3, 1, 4, 6, now() - interval '30 days');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.mpks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mpk_activity_log;