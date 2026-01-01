import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface DocsPage {
  id: string;
  slug: string;
  title_ru: string;
  title_en: string;
  content_ru: string;
  content_en: string;
  section: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export interface DocsNavigation {
  id: string;
  section: string;
  parent_id: string | null;
  slug: string;
  label_ru: string;
  label_en: string;
  order_index: number;
  created_at: string;
}

export type DocsLanguage = 'ru' | 'en';

/**
 * Hook to fetch a single docs page by slug
 */
export function useDocsPage(slug: string, language: DocsLanguage = 'ru') {
  const { role } = useAuthContext();
  const isAdmin = role === 'admin';

  return useQuery({
    queryKey: ['docs-page', slug, language],
    queryFn: async () => {
      let query = supabase
        .from('docs_pages')
        .select('*')
        .eq('slug', slug)
        .single();

      // Non-admins can only see published pages
      if (!isAdmin) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DocsPage;
    },
    enabled: !!slug,
  });
}

/**
 * Hook to fetch all published docs pages (for public)
 */
export function useDocsPages(section?: string) {
  const { role } = useAuthContext();
  const isAdmin = role === 'admin';

  return useQuery({
    queryKey: ['docs-pages', section],
    queryFn: async () => {
      let query = supabase
        .from('docs_pages')
        .select('*')
        .order('section', { ascending: true })
        .order('order_index', { ascending: true });

      if (section) {
        query = query.eq('section', section);
      }

      // Non-admins can only see published pages
      if (!isAdmin) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DocsPage[];
    },
  });
}

/**
 * Hook to fetch navigation structure
 */
export function useDocsNavigation(language: DocsLanguage = 'ru') {
  return useQuery({
    queryKey: ['docs-navigation', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('docs_navigation')
        .select('*')
        .order('section', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as DocsNavigation[];
    },
  });
}

/**
 * Hook to create/update docs page (admin only)
 */
export function useUpsertDocsPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (page: Partial<DocsPage> & { slug: string }) => {
      const { data, error } = await supabase
        .from('docs_pages')
        .upsert(page, { onConflict: 'slug' })
        .select()
        .single();

      if (error) throw error;
      return data as DocsPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docs-pages'] });
      queryClient.invalidateQueries({ queryKey: ['docs-page'] });
    },
  });
}

/**
 * Hook to delete docs page (admin only)
 */
export function useDeleteDocsPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const { error } = await supabase
        .from('docs_pages')
        .delete()
        .eq('slug', slug);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docs-pages'] });
      queryClient.invalidateQueries({ queryKey: ['docs-page'] });
      queryClient.invalidateQueries({ queryKey: ['docs-navigation'] });
    },
  });
}

/**
 * Hook to upsert navigation item (admin only)
 */
export function useUpsertDocsNavigation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nav: Partial<DocsNavigation> & { slug: string; section: string; label_ru: string; label_en: string }) => {
      const { data, error } = await supabase
        .from('docs_navigation')
        .upsert(nav, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data as DocsNavigation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docs-navigation'] });
    },
  });
}

/**
 * Hook to delete navigation item (admin only)
 */
export function useDeleteDocsNavigation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('docs_navigation')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docs-navigation'] });
    },
  });
}

