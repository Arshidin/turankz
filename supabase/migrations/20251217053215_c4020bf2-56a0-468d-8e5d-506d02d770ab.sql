-- Create enum for request status
CREATE TYPE public.pool_request_status AS ENUM ('pending', 'partial', 'fulfilled', 'cancelled');

-- Create purchase_pool_requests table
CREATE TABLE public.purchase_pool_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  mpk_id TEXT NOT NULL,
  mpk_name TEXT NOT NULL,
  target_week TEXT NOT NULL,
  required_volume INTEGER NOT NULL,
  required_grade TEXT NOT NULL,
  regions TEXT[] NOT NULL DEFAULT '{}',
  matched_volume INTEGER NOT NULL DEFAULT 0,
  status pool_request_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchase_pool_requests ENABLE ROW LEVEL SECURITY;

-- Admin can view all requests
CREATE POLICY "Admins can view all requests"
ON public.purchase_pool_requests
FOR SELECT
TO authenticated
USING (true);

-- Admin can create requests
CREATE POLICY "Admins can create requests"
ON public.purchase_pool_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admin can update requests
CREATE POLICY "Admins can update requests"
ON public.purchase_pool_requests
FOR UPDATE
TO authenticated
USING (true);

-- Create pool_matches table to track batch-request matches
CREATE TABLE public.pool_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.purchase_pool_requests(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  heads_matched INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, batch_id)
);

-- Enable RLS on pool_matches
ALTER TABLE public.pool_matches ENABLE ROW LEVEL SECURITY;

-- Admin can manage matches
CREATE POLICY "Admins can view matches"
ON public.pool_matches FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can create matches"
ON public.pool_matches FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update matches"
ON public.pool_matches FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can delete matches"
ON public.pool_matches FOR DELETE TO authenticated USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_purchase_pool_requests_updated_at
BEFORE UPDATE ON public.purchase_pool_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.purchase_pool_requests (request_number, mpk_id, mpk_name, target_week, required_volume, required_grade, regions, matched_volume, status)
VALUES
  ('REQ-091', 'MPK-04', 'Almaty Meats', 'W52', 80, 'A', ARRAY['Almaty', 'Akmola'], 45, 'partial'),
  ('REQ-090', 'MPK-02', 'Karaganda Processing', 'W52', 120, 'A/B', ARRAY['Any'], 0, 'pending'),
  ('REQ-089', 'MPK-01', 'Astana Beef Co', 'W51', 60, 'B', ARRAY['Karaganda'], 60, 'fulfilled'),
  ('REQ-088', 'MPK-03', 'East KZ Meats', 'W52', 45, 'A', ARRAY['East Kazakhstan'], 20, 'partial');

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_pool_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pool_matches;