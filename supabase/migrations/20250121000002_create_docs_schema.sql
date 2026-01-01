-- ============================================================================
-- Documentation Portal Schema
-- ============================================================================
-- Creates tables for documentation pages and navigation
-- Supports RU/EN multilingual content
-- ============================================================================

-- Create docs_pages table
CREATE TABLE IF NOT EXISTS public.docs_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_ru TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_ru TEXT NOT NULL, -- Markdown content
  content_en TEXT NOT NULL, -- Markdown content
  section TEXT NOT NULL, -- e.g. "Farmer Guide", "MPK Guide", "Admin Guide"
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT false,
  
  -- Ensure slug is URL-safe
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9/-]+$')
);

-- Create docs_navigation table
CREATE TABLE IF NOT EXISTS public.docs_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL, -- e.g. "Farmer Guide"
  parent_id UUID REFERENCES public.docs_navigation(id) ON DELETE CASCADE,
  slug TEXT NOT NULL, -- References docs_pages.slug
  label_ru TEXT NOT NULL,
  label_en TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure slug references exist
  CONSTRAINT valid_slug_ref FOREIGN KEY (slug) REFERENCES public.docs_pages(slug) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_docs_pages_section ON public.docs_pages(section);
CREATE INDEX IF NOT EXISTS idx_docs_pages_published ON public.docs_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_docs_pages_slug ON public.docs_pages(slug);
CREATE INDEX IF NOT EXISTS idx_docs_navigation_section ON public.docs_navigation(section);
CREATE INDEX IF NOT EXISTS idx_docs_navigation_parent ON public.docs_navigation(parent_id);
CREATE INDEX IF NOT EXISTS idx_docs_navigation_order ON public.docs_navigation(section, order_index);

-- Enable RLS
ALTER TABLE public.docs_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docs_navigation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for docs_pages
-- Public read access for published pages
CREATE POLICY "Public can read published docs pages"
ON public.docs_pages
FOR SELECT
USING (is_published = true);

-- Admins can read all pages (including unpublished)
CREATE POLICY "Admins can read all docs pages"
ON public.docs_pages
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can insert pages
CREATE POLICY "Admins can insert docs pages"
ON public.docs_pages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update pages
CREATE POLICY "Admins can update docs pages"
ON public.docs_pages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete pages
CREATE POLICY "Admins can delete docs pages"
ON public.docs_pages
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for docs_navigation
-- Public read access
CREATE POLICY "Public can read docs navigation"
ON public.docs_navigation
FOR SELECT
USING (true);

-- Admins can manage navigation
CREATE POLICY "Admins can manage docs navigation"
ON public.docs_navigation
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_docs_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_docs_pages_updated_at
BEFORE UPDATE ON public.docs_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_docs_pages_updated_at();

-- Insert default navigation structure
INSERT INTO public.docs_pages (slug, title_ru, title_en, content_ru, content_en, section, order_index, is_published)
VALUES 
  ('getting-started', 'Начало работы', 'Getting Started', '# Начало работы\n\nДобро пожаловать в Turan Standard Pool.', '# Getting Started\n\nWelcome to Turan Standard Pool.', 'Introduction', 0, true),
  ('farmer-guide/overview', 'Обзор для фермеров', 'Farmer Overview', '# Обзор для фермеров\n\nРуководство для фермеров.', '# Farmer Overview\n\nGuide for farmers.', 'Farmer Guide', 0, true),
  ('mpk-guide/overview', 'Обзор для МПК', 'MPK Overview', '# Обзор для МПК\n\nРуководство для мясоперерабатывающих комбинатов.', '# MPK Overview\n\nGuide for meat processing companies.', 'MPK Guide', 0, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default navigation
-- Note: Using WHERE NOT EXISTS to avoid duplicates if migration is run multiple times
INSERT INTO public.docs_navigation (section, slug, label_ru, label_en, order_index)
SELECT * FROM (VALUES 
  ('Introduction', 'getting-started', 'Начало работы', 'Getting Started', 0),
  ('Farmer Guide', 'farmer-guide/overview', 'Обзор', 'Overview', 0),
  ('MPK Guide', 'mpk-guide/overview', 'Обзор', 'Overview', 0)
) AS v(section, slug, label_ru, label_en, order_index)
WHERE NOT EXISTS (
  SELECT 1 FROM public.docs_navigation 
  WHERE docs_navigation.slug = v.slug AND docs_navigation.section = v.section
);

COMMENT ON TABLE public.docs_pages IS 'Documentation pages with multilingual content';
COMMENT ON TABLE public.docs_navigation IS 'Navigation structure for documentation portal';
COMMENT ON COLUMN public.docs_pages.slug IS 'URL-friendly identifier, e.g. "farmer/batch-lifecycle"';
COMMENT ON COLUMN public.docs_pages.section IS 'Top-level section grouping, e.g. "Farmer Guide"';

