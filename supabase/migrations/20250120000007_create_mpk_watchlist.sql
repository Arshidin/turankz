-- ============================================================================
-- Create MPK Watchlist table
-- ============================================================================
-- MPKs can save regions/weeks to monitor for potential pool requests
-- Each MPK can only see and manage their own watchlist items
-- ============================================================================

CREATE TABLE public.mpk_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mpk_id UUID NOT NULL REFERENCES public.mpks(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  target_month TEXT NOT NULL, -- e.g., "January 2025"
  target_week TEXT NOT NULL, -- e.g., "Week 1"
  criteria JSONB, -- Optional: store filter criteria (breeds, genders, age, weight ranges)
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(mpk_id, region, target_month, target_week)
);

-- Enable RLS
ALTER TABLE public.mpk_watchlist ENABLE ROW LEVEL SECURITY;

-- MPKs can view only their own watchlist items
CREATE POLICY "MPKs can view own watchlist"
ON public.mpk_watchlist
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.id = mpk_watchlist.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

-- MPKs can create only their own watchlist items
CREATE POLICY "MPKs can create own watchlist items"
ON public.mpk_watchlist
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.id = mpk_watchlist.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

-- MPKs can delete only their own watchlist items
CREATE POLICY "MPKs can delete own watchlist items"
ON public.mpk_watchlist
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.id = mpk_watchlist.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

-- MPKs can update only their own watchlist items (e.g., update last_viewed_at)
CREATE POLICY "MPKs can update own watchlist items"
ON public.mpk_watchlist
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mpks 
    WHERE mpks.id = mpk_watchlist.mpk_id 
    AND mpks.user_id = auth.uid()
  )
);

-- Admins can view all watchlist items
CREATE POLICY "Admins can view all watchlist items"
ON public.mpk_watchlist
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_mpk_watchlist_mpk_id ON public.mpk_watchlist(mpk_id);
CREATE INDEX idx_mpk_watchlist_region_month ON public.mpk_watchlist(region, target_month, target_week);

-- Add comment for documentation
COMMENT ON TABLE public.mpk_watchlist IS 
'MPK watchlist items - regions and weeks that MPKs want to monitor for potential pool requests. Each MPK can only see and manage their own watchlist.';

COMMENT ON COLUMN public.mpk_watchlist.criteria IS 
'Optional JSONB field to store filter criteria (breeds, genders, age ranges, weight ranges) for this watchlist item.';

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.mpk_watchlist;

