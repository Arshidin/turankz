-- Add profile fields to farmers table
ALTER TABLE public.farmers
ADD COLUMN IF NOT EXISTS contact_name text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS farm_type text DEFAULT 'Cattle Ranch';

-- Update existing sample data with contact info
UPDATE public.farmers 
SET contact_name = name,
    phone = '+7 (777) 000-0000'
WHERE contact_name IS NULL;