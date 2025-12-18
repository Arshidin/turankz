-- Create price grid versions table
CREATE TABLE public.price_grid_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT,
  activated_at TIMESTAMP WITH TIME ZONE,
  activated_by TEXT
);

-- Create price grid cells table (the actual pricing data)
CREATE TABLE public.price_grid_cells (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version_id UUID NOT NULL REFERENCES public.price_grid_versions(id) ON DELETE CASCADE,
  age_category TEXT NOT NULL, -- '<12_months', '12_18_months', '>18_months'
  sex TEXT NOT NULL, -- 'bull', 'heifer'
  weight_min INTEGER NOT NULL,
  weight_max INTEGER NOT NULL,
  breed_group TEXT, -- 'meat', 'crossbred', 'dairy' (optional)
  base_price INTEGER NOT NULL, -- Price in Tenge per kg
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(version_id, age_category, sex, weight_min, weight_max, breed_group)
);

-- Enable RLS
ALTER TABLE public.price_grid_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_grid_cells ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_grid_versions
-- Everyone can view all versions (for transparency)
CREATE POLICY "Everyone can view price grid versions"
ON public.price_grid_versions
FOR SELECT
USING (true);

-- Only admins can create versions
CREATE POLICY "Admins can create price grid versions"
ON public.price_grid_versions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update versions
CREATE POLICY "Admins can update price grid versions"
ON public.price_grid_versions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete versions
CREATE POLICY "Admins can delete price grid versions"
ON public.price_grid_versions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for price_grid_cells
-- Everyone can view all cells (for transparency)
CREATE POLICY "Everyone can view price grid cells"
ON public.price_grid_cells
FOR SELECT
USING (true);

-- Only admins can create cells
CREATE POLICY "Admins can create price grid cells"
ON public.price_grid_cells
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update cells
CREATE POLICY "Admins can update price grid cells"
ON public.price_grid_cells
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete cells
CREATE POLICY "Admins can delete price grid cells"
ON public.price_grid_cells
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to ensure only one active version at a time
CREATE OR REPLACE FUNCTION public.ensure_single_active_price_grid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If this version is being set to active, deactivate all others
  IF NEW.is_active = true AND (OLD IS NULL OR OLD.is_active = false) THEN
    UPDATE public.price_grid_versions
    SET is_active = false, updated_at = now()
    WHERE id != NEW.id AND is_active = true;
    
    -- Set activation timestamp
    NEW.activated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce single active version
CREATE TRIGGER enforce_single_active_price_grid
BEFORE INSERT OR UPDATE ON public.price_grid_versions
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_active_price_grid();

-- Create trigger for updated_at on price_grid_versions
CREATE TRIGGER update_price_grid_versions_updated_at
BEFORE UPDATE ON public.price_grid_versions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on price_grid_cells
CREATE TRIGGER update_price_grid_cells_updated_at
BEFORE UPDATE ON public.price_grid_cells
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create price grid change log for audit
CREATE TABLE public.price_grid_change_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version_id UUID REFERENCES public.price_grid_versions(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'version_created', 'version_activated', 'cell_updated', etc.
  previous_value TEXT,
  new_value TEXT,
  changed_by TEXT NOT NULL,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for change log
ALTER TABLE public.price_grid_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view price grid change log"
ON public.price_grid_change_log
FOR SELECT
USING (true);

CREATE POLICY "System can create price grid change log"
ON public.price_grid_change_log
FOR INSERT
WITH CHECK (true);