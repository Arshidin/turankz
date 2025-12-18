-- Add RLS policy for admins to view all batches
CREATE POLICY "Admins can view all batches" 
ON public.batches 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to update batches (for status transitions)
CREATE POLICY "Admins can update batches" 
ON public.batches 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));