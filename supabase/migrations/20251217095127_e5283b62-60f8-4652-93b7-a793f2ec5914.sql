-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'farmer', 'mpk');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Add registration_status to farmers table
ALTER TABLE public.farmers 
ADD COLUMN registration_status TEXT NOT NULL DEFAULT 'pending'
CHECK (registration_status IN ('pending', 'active', 'rejected', 'clarification_needed'));

-- Add registration_status to mpks table  
ALTER TABLE public.mpks
ADD COLUMN registration_status TEXT NOT NULL DEFAULT 'pending'
CHECK (registration_status IN ('pending', 'active', 'rejected', 'clarification_needed'));

-- Add admin_notes for review process
ALTER TABLE public.farmers ADD COLUMN admin_notes TEXT;
ALTER TABLE public.mpks ADD COLUMN admin_notes TEXT;

-- Update farmers RLS to allow self-registration
CREATE POLICY "Users can create own farmer profile"
ON public.farmers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own farmer profile"
ON public.farmers
FOR SELECT
USING (auth.uid() = user_id);

-- Update mpks to have user_id
ALTER TABLE public.mpks ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update mpks RLS to allow self-registration
CREATE POLICY "Users can create own mpk profile"
ON public.mpks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own mpk profile"
ON public.mpks
FOR SELECT
USING (auth.uid() = user_id);