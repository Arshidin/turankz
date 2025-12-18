-- Insert new premium types: Standard Compliance, Predictability, Volume Consistency
-- First, update existing premium_type column to support new types

-- Add Predictability Premium settings
INSERT INTO public.premium_settings (premium_type, level_key, level_name, description, criteria, premium_value, is_active, sort_order)
VALUES 
  ('predictability', 'early_confirmation', 'Early Confirmation', 'Batch confirmed before matching window lock date', 
   ARRAY['Confirmed before lock_date', 'No post-confirmation edits'], 15, true, 1),
  ('predictability', 'standard_confirmation', 'Standard Confirmation', 'Batch confirmed during matching window', 
   ARRAY['Confirmed during matching window', 'Minor edits allowed'], 5, true, 2),
  ('predictability', 'late_confirmation', 'Late Confirmation', 'Batch confirmed after lock date or with edits', 
   ARRAY['Late confirmation or multiple edits'], 0, true, 3);

-- Add Volume Consistency Premium settings
INSERT INTO public.premium_settings (premium_type, level_key, level_name, description, criteria, premium_value, is_active, sort_order)
VALUES 
  ('volume_consistency', 'platinum', 'Platinum Supplier', 'Consistent high-volume delivery over 12+ months', 
   ARRAY['10+ fulfilled batches', '95%+ delivery rate', '12+ months active'], 25, false, 1),
  ('volume_consistency', 'gold', 'Gold Supplier', 'Reliable volume delivery over 6+ months', 
   ARRAY['5+ fulfilled batches', '90%+ delivery rate', '6+ months active'], 15, false, 2),
  ('volume_consistency', 'silver', 'Silver Supplier', 'Emerging consistent supplier', 
   ARRAY['3+ fulfilled batches', '85%+ delivery rate', '3+ months active'], 8, false, 3),
  ('volume_consistency', 'standard', 'Standard Supplier', 'New or inconsistent supplier', 
   ARRAY['Less than 3 fulfilled batches'], 0, true, 4);

-- Rename existing standard premium entries to be more descriptive of "Standard Compliance"
UPDATE public.premium_settings 
SET description = 'Batch fully matches all price grid criteria with high quality'
WHERE premium_type = 'standard' AND level_key = 'high_standard';

UPDATE public.premium_settings 
SET description = 'Batch meets basic price grid criteria'
WHERE premium_type = 'standard' AND level_key = 'standard';

UPDATE public.premium_settings 
SET description = 'Batch does not fully match price grid criteria'
WHERE premium_type = 'standard' AND level_key = 'non_standard';