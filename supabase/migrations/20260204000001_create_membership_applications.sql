-- Migration: Create membership_applications table
-- Description: Table for storing membership applications from potential farmers

-- Create the membership_applications table
CREATE TABLE IF NOT EXISTS membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT UNIQUE NOT NULL,  -- TRN-2024-0001

  -- Personal data
  full_name TEXT NOT NULL,
  iin TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,

  -- Farm data
  farm_name TEXT,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  settlement TEXT NOT NULL,

  -- Livestock information
  livestock_types TEXT[] NOT NULL,  -- ['cattle', 'sheep', 'horses']
  herd_size_cattle INTEGER DEFAULT 0,
  herd_size_sheep INTEGER DEFAULT 0,
  herd_size_horses INTEGER DEFAULT 0,
  experience_years TEXT NOT NULL,

  -- Additional
  how_did_you_hear TEXT,
  comments TEXT,

  -- Metadata
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, reviewing, approved, rejected
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Link to created farmer (after approval)
  farmer_id UUID REFERENCES farmers(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_membership_applications_status
  ON membership_applications(status);

CREATE INDEX IF NOT EXISTS idx_membership_applications_iin
  ON membership_applications(iin);

CREATE INDEX IF NOT EXISTS idx_membership_applications_created_at
  ON membership_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_membership_applications_region
  ON membership_applications(region);

-- Enable RLS
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can insert (public form submission)
CREATE POLICY "Anyone can submit membership application"
  ON membership_applications
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read applications
CREATE POLICY "Admins can read membership applications"
  ON membership_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update applications
CREATE POLICY "Admins can update membership applications"
  ON membership_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to generate application number
CREATE OR REPLACE FUNCTION generate_membership_application_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  new_number TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(application_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM membership_applications
  WHERE application_number LIKE 'TRN-' || year_part || '-%';

  -- Generate the new application number
  new_number := 'TRN-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  NEW.application_number := new_number;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate application number
DROP TRIGGER IF EXISTS set_membership_application_number ON membership_applications;
CREATE TRIGGER set_membership_application_number
  BEFORE INSERT ON membership_applications
  FOR EACH ROW
  EXECUTE FUNCTION generate_membership_application_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_membership_application_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_membership_application_timestamp ON membership_applications;
CREATE TRIGGER update_membership_application_timestamp
  BEFORE UPDATE ON membership_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_membership_application_timestamp();

-- Add comment for documentation
COMMENT ON TABLE membership_applications IS 'Stores membership applications from potential farmers wanting to join the TURAN association';
COMMENT ON COLUMN membership_applications.application_number IS 'Auto-generated application number in format TRN-YYYY-XXXX';
COMMENT ON COLUMN membership_applications.status IS 'Application status: pending, reviewing, approved, rejected';
COMMENT ON COLUMN membership_applications.livestock_types IS 'Array of livestock types: cattle, sheep, horses';
