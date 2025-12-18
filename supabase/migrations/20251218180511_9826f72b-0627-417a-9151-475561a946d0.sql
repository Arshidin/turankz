-- Create matching window status enum
CREATE TYPE public.matching_window_status AS ENUM ('upcoming', 'active', 'locked', 'closed');

-- Create matching_windows table
CREATE TABLE public.matching_windows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status matching_window_status NOT NULL DEFAULT 'upcoming',
  start_date DATE NOT NULL,
  lock_date DATE NOT NULL,
  close_date DATE NOT NULL,
  target_week TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT,
  
  -- Ensure lock_date is after start_date and close_date is after lock_date
  CONSTRAINT valid_date_sequence CHECK (start_date <= lock_date AND lock_date <= close_date)
);

-- Enable RLS
ALTER TABLE public.matching_windows ENABLE ROW LEVEL SECURITY;

-- Everyone can view matching windows (read-only for farmers and MPKs)
CREATE POLICY "Everyone can view matching windows"
ON public.matching_windows
FOR SELECT
USING (true);

-- Only admins can create matching windows
CREATE POLICY "Admins can create matching windows"
ON public.matching_windows
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update matching windows
CREATE POLICY "Admins can update matching windows"
ON public.matching_windows
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete matching windows
CREATE POLICY "Admins can delete matching windows"
ON public.matching_windows
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_matching_windows_updated_at
BEFORE UPDATE ON public.matching_windows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for quick lookup of active window
CREATE INDEX idx_matching_windows_status ON public.matching_windows(status);
CREATE INDEX idx_matching_windows_target_week ON public.matching_windows(target_week);