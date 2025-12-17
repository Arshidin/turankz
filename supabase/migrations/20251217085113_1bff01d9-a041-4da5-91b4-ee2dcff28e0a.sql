-- Create premium settings table for configurable premium values
CREATE TABLE public.premium_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  premium_type text NOT NULL, -- 'standard' or 'reliability'
  level_key text NOT NULL, -- e.g. 'non_standard', 'standard', 'high_standard' or 'observer', 'declared_supplier', 'standard_supplier'
  level_name text NOT NULL, -- Display name
  premium_value integer NOT NULL DEFAULT 0, -- ₸/kg
  description text,
  criteria text[], -- Array of criteria descriptions
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(premium_type, level_key)
);

-- Enable RLS
ALTER TABLE public.premium_settings ENABLE ROW LEVEL SECURITY;

-- All roles can view premium settings (read-only reference)
CREATE POLICY "All users can view premium settings"
ON public.premium_settings
FOR SELECT
USING (true);

-- Only admins can modify premium settings
CREATE POLICY "Admins can insert premium settings"
ON public.premium_settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update premium settings"
ON public.premium_settings
FOR UPDATE
USING (true);

-- Add standard_status column to batches table
ALTER TABLE public.batches 
ADD COLUMN standard_status text DEFAULT 'non_standard';

-- Create premium change log for versioning
CREATE TABLE public.premium_change_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  premium_setting_id uuid REFERENCES public.premium_settings(id),
  previous_value integer,
  new_value integer,
  changed_by text,
  change_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view premium change log"
ON public.premium_change_log
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert premium change log"
ON public.premium_change_log
FOR INSERT
WITH CHECK (true);

-- Insert default premium settings
INSERT INTO public.premium_settings (premium_type, level_key, level_name, premium_value, description, criteria, sort_order) VALUES
-- Standard premiums (batch-level)
('standard', 'non_standard', 'Non-Standard', 0, 'Base level without premium', ARRAY['Does not meet full MPK acceptance criteria', 'May have negative grid adjustments'], 1),
('standard', 'standard', 'Standard', 50, 'Meets standardization requirements', ARRAY['Full compliance with MPK acceptance criteria', 'No negative grid adjustments'], 2),
('standard', 'high_standard', 'High Standard', 100, 'Premium quality batch', ARRAY['Full compliance with MPK acceptance criteria', 'No negative grid adjustments', 'Homogeneous batch: age ±1 month, weight ±30 kg, same breed'], 3),
-- Reliability premiums (farmer-level)
('reliability', 'observer', 'Observer', 0, 'New or unverified supplier', ARRAY['Limited platform history', 'Building track record'], 1),
('reliability', 'declared_supplier', 'Declared Supplier', 30, 'Active supplier with good track record', ARRAY['Consistent confirmation behavior', 'Regular platform participation'], 2),
('reliability', 'standard_supplier', 'Standard Supplier', 70, 'Trusted supplier with excellent reliability', ARRAY['High confirmation rate', 'Consistent quality delivery', 'Long-term platform participation'], 3);

-- Create trigger for updated_at
CREATE TRIGGER update_premium_settings_updated_at
BEFORE UPDATE ON public.premium_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();