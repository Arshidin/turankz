-- Create mpk_watchlist table for MPK to track regions/months of interest
CREATE TABLE public.mpk_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mpk_id UUID NOT NULL REFERENCES public.mpks(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  target_week TEXT NOT NULL,
  target_month TEXT,
  min_volume INTEGER,
  notes TEXT,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mpk_watchlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "MPKs can view their own watchlist" 
ON public.mpk_watchlist 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.id = mpk_watchlist.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

CREATE POLICY "MPKs can insert their own watchlist items" 
ON public.mpk_watchlist 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.id = mpk_watchlist.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

CREATE POLICY "MPKs can update their own watchlist items" 
ON public.mpk_watchlist 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.id = mpk_watchlist.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

CREATE POLICY "MPKs can delete their own watchlist items" 
ON public.mpk_watchlist 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.id = mpk_watchlist.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all watchlist items" 
ON public.mpk_watchlist 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_mpk_watchlist_updated_at
BEFORE UPDATE ON public.mpk_watchlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();