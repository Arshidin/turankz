-- Create enum for batch status
CREATE TYPE public.batch_status AS ENUM ('forecast', 'soft_committed', 'confirmed', 'delivered');

-- Create batches table
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  heads INTEGER NOT NULL CHECK (heads > 0),
  avg_weight DECIMAL(6,2),
  grade TEXT NOT NULL CHECK (grade IN ('A', 'B', 'C', 'A/B', 'B/C')),
  region TEXT NOT NULL,
  status batch_status NOT NULL DEFAULT 'forecast',
  target_week TEXT NOT NULL,
  notes TEXT,
  mpk_interest TEXT,
  requires_action BOOLEAN DEFAULT false,
  action_type TEXT CHECK (action_type IN ('confirm', 'review', 'update', NULL)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own batches
CREATE POLICY "Farmers can view own batches"
ON public.batches
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Farmers can insert their own batches
CREATE POLICY "Farmers can create own batches"
ON public.batches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Farmers can update their own batches
CREATE POLICY "Farmers can update own batches"
ON public.batches
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Farmers can delete their own batches
CREATE POLICY "Farmers can delete own batches"
ON public.batches
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_batches_updated_at
BEFORE UPDATE ON public.batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for batches table
ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;