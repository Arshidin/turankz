-- Forecast reference coefficients table
CREATE TABLE public.forecast_reference_coefficients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coefficient_type TEXT NOT NULL,
  coefficient_key TEXT NOT NULL,
  coefficient_value NUMERIC NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(coefficient_type, coefficient_key)
);

ALTER TABLE public.forecast_reference_coefficients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view coefficients" ON public.forecast_reference_coefficients FOR SELECT USING (true);
CREATE POLICY "Admins can manage coefficients" ON public.forecast_reference_coefficients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Insert default calving rate
INSERT INTO public.forecast_reference_coefficients (coefficient_type, coefficient_key, coefficient_value, description)
VALUES ('calving_rate', 'default', 0.85, 'Default calving rate for breeding cows');

-- Aggregated forecast function
CREATE OR REPLACE FUNCTION public.get_indicative_forecast_by_region(p_year INTEGER DEFAULT NULL, p_quarter INTEGER DEFAULT NULL)
RETURNS TABLE (
  region TEXT,
  breeding_cows_count BIGINT,
  calving_rate NUMERIC,
  estimated_calves NUMERIC,
  farmer_count BIGINT,
  data_confidence TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.region::TEXT,
    SUM(CASE WHEN h.category = 'breeding_cows' THEN h.count ELSE 0 END)::BIGINT as breeding_cows_count,
    COALESCE((SELECT coefficient_value FROM forecast_reference_coefficients WHERE coefficient_type = 'calving_rate' AND coefficient_key = 'default' AND is_active = true), 0.85) as calving_rate,
    (SUM(CASE WHEN h.category = 'breeding_cows' THEN h.count ELSE 0 END) * 
     COALESCE((SELECT coefficient_value FROM forecast_reference_coefficients WHERE coefficient_type = 'calving_rate' AND coefficient_key = 'default' AND is_active = true), 0.85))::NUMERIC as estimated_calves,
    COUNT(DISTINCT h.farmer_id)::BIGINT as farmer_count,
    MODE() WITHIN GROUP (ORDER BY h.data_confidence_level::TEXT) as data_confidence
  FROM herd_structure_snapshots h
  JOIN farmers f ON h.farmer_id = f.id
  WHERE (p_year IS NULL OR h.reporting_year = p_year)
    AND (p_quarter IS NULL OR h.reporting_quarter = p_quarter)
  GROUP BY f.region;
END;
$$;

-- Farmer's own forecast function
CREATE OR REPLACE FUNCTION public.get_farmer_indicative_forecast(p_farmer_id UUID)
RETURNS TABLE (
  category TEXT,
  current_count BIGINT,
  calving_rate NUMERIC,
  estimated_offspring NUMERIC,
  reporting_year INTEGER,
  reporting_quarter INTEGER
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.category::TEXT,
    SUM(h.count)::BIGINT as current_count,
    CASE WHEN h.category = 'breeding_cows' THEN
      COALESCE((SELECT coefficient_value FROM forecast_reference_coefficients WHERE coefficient_type = 'calving_rate' AND coefficient_key = 'default' AND is_active = true), 0.85)
    ELSE 0 END as calving_rate,
    CASE WHEN h.category = 'breeding_cows' THEN
      (SUM(h.count) * COALESCE((SELECT coefficient_value FROM forecast_reference_coefficients WHERE coefficient_type = 'calving_rate' AND coefficient_key = 'default' AND is_active = true), 0.85))::NUMERIC
    ELSE 0 END as estimated_offspring,
    h.reporting_year,
    h.reporting_quarter
  FROM herd_structure_snapshots h
  WHERE h.farmer_id = p_farmer_id
  GROUP BY h.category, h.reporting_year, h.reporting_quarter;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_indicative_forecast_by_region TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_farmer_indicative_forecast TO authenticated;