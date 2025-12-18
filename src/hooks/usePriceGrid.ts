import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';

export interface PriceGridVersion {
  id: string;
  version_name: string;
  description: string | null;
  is_active: boolean;
  effective_date: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  activated_at: string | null;
  activated_by: string | null;
}

export interface PriceGridCell {
  id: string;
  version_id: string;
  age_category: string;
  sex: string;
  weight_min: number;
  weight_max: number;
  breed_group: string | null;
  base_price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const AGE_CATEGORIES = [
  { value: '<12_months', label: '< 12 months' },
  { value: '12_18_months', label: '12–18 months' },
  { value: '>18_months', label: '> 18 months' },
] as const;

export const SEX_OPTIONS = [
  { value: 'bull', label: 'Bull' },
  { value: 'heifer', label: 'Heifer' },
] as const;

export const BREED_GROUPS = [
  { value: 'meat', label: 'Meat Breeds' },
  { value: 'crossbred', label: 'Crossbred' },
  { value: 'dairy', label: 'Dairy Breeds' },
] as const;

/**
 * Hook to fetch the active price grid version with cells
 */
export function useActivePriceGrid() {
  return useQuery({
    queryKey: ['price-grid', 'active'],
    queryFn: async () => {
      // Get active version
      const { data: version, error: versionError } = await supabase
        .from('price_grid_versions')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (versionError) throw versionError;
      if (!version) return null;

      // Get cells for this version
      const { data: cells, error: cellsError } = await supabase
        .from('price_grid_cells')
        .select('*')
        .eq('version_id', version.id)
        .order('age_category')
        .order('sex')
        .order('weight_min');

      if (cellsError) throw cellsError;

      return {
        version: version as PriceGridVersion,
        cells: cells as PriceGridCell[],
      };
    },
  });
}

/**
 * Hook to fetch all price grid versions
 */
export function usePriceGridVersions() {
  return useQuery({
    queryKey: ['price-grid', 'versions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_grid_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PriceGridVersion[];
    },
  });
}

/**
 * Hook to fetch cells for a specific version
 */
export function usePriceGridCells(versionId: string | null) {
  return useQuery({
    queryKey: ['price-grid', 'cells', versionId],
    queryFn: async () => {
      if (!versionId) return [];

      const { data, error } = await supabase
        .from('price_grid_cells')
        .select('*')
        .eq('version_id', versionId)
        .order('age_category')
        .order('sex')
        .order('weight_min');

      if (error) throw error;
      return data as PriceGridCell[];
    },
    enabled: !!versionId,
  });
}

/**
 * Hook to create a new price grid version
 */
export function useCreatePriceGridVersion() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      versionName,
      description,
      effectiveDate,
    }: {
      versionName: string;
      description?: string;
      effectiveDate: string;
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can create price grid versions');
      }

      const { data, error } = await supabase
        .from('price_grid_versions')
        .insert({
          version_name: versionName,
          description: description || null,
          effective_date: effectiveDate,
          created_by: roleName,
        })
        .select()
        .single();

      if (error) throw error;

      // Log creation
      await supabase.from('price_grid_change_log').insert({
        version_id: data.id,
        action_type: 'version_created',
        new_value: versionName,
        changed_by: `${roleName} (${role})`,
      });

      return data as PriceGridVersion;
    },
    onSuccess: () => {
      toast({
        title: 'Version Created',
        description: 'New price grid version has been created.',
      });
      queryClient.invalidateQueries({ queryKey: ['price-grid'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to activate a price grid version
 */
export function useActivatePriceGridVersion() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ versionId }: { versionId: string }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can activate price grid versions');
      }

      const { data, error } = await supabase
        .from('price_grid_versions')
        .update({
          is_active: true,
          activated_by: roleName,
        })
        .eq('id', versionId)
        .select()
        .single();

      if (error) throw error;

      // Log activation
      await supabase.from('price_grid_change_log').insert({
        version_id: versionId,
        action_type: 'version_activated',
        new_value: data.version_name,
        changed_by: `${roleName} (${role})`,
      });

      return data as PriceGridVersion;
    },
    onSuccess: (data) => {
      toast({
        title: 'Version Activated',
        description: `"${data.version_name}" is now the active price grid.`,
      });
      queryClient.invalidateQueries({ queryKey: ['price-grid'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to add/update a price grid cell
 */
export function useUpsertPriceGridCell() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      versionId,
      cell,
    }: {
      versionId: string;
      cell: Omit<PriceGridCell, 'id' | 'version_id' | 'created_at' | 'updated_at'>;
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can modify price grid cells');
      }

      const { data, error } = await supabase
        .from('price_grid_cells')
        .upsert({
          version_id: versionId,
          age_category: cell.age_category,
          sex: cell.sex,
          weight_min: cell.weight_min,
          weight_max: cell.weight_max,
          breed_group: cell.breed_group,
          base_price: cell.base_price,
          notes: cell.notes,
        }, {
          onConflict: 'version_id,age_category,sex,weight_min,weight_max,breed_group',
        })
        .select()
        .single();

      if (error) throw error;

      // Log change
      await supabase.from('price_grid_change_log').insert({
        version_id: versionId,
        action_type: 'cell_updated',
        new_value: `${cell.age_category}/${cell.sex}/${cell.weight_min}-${cell.weight_max}kg: ${cell.base_price}₸/kg`,
        changed_by: `${roleName} (${role})`,
      });

      return data as PriceGridCell;
    },
    onSuccess: () => {
      toast({
        title: 'Cell Updated',
        description: 'Price grid cell has been saved.',
      });
      queryClient.invalidateQueries({ queryKey: ['price-grid'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete a price grid cell
 */
export function useDeletePriceGridCell() {
  const { toast } = useToast();
  const { role } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cellId }: { cellId: string }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can delete price grid cells');
      }

      const { error } = await supabase
        .from('price_grid_cells')
        .delete()
        .eq('id', cellId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Cell Deleted',
        description: 'Price grid cell has been removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['price-grid'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to duplicate a price grid version
 */
export function useDuplicatePriceGridVersion() {
  const { toast } = useToast();
  const { role, roleName } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceVersionId,
      newVersionName,
      effectiveDate,
    }: {
      sourceVersionId: string;
      newVersionName: string;
      effectiveDate: string;
    }) => {
      if (role !== 'admin') {
        throw new Error('Only admins can duplicate price grid versions');
      }

      // Create new version
      const { data: newVersion, error: versionError } = await supabase
        .from('price_grid_versions')
        .insert({
          version_name: newVersionName,
          description: `Duplicated from existing version`,
          effective_date: effectiveDate,
          created_by: roleName,
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Get source cells
      const { data: sourceCells, error: cellsError } = await supabase
        .from('price_grid_cells')
        .select('*')
        .eq('version_id', sourceVersionId);

      if (cellsError) throw cellsError;

      // Copy cells to new version
      if (sourceCells && sourceCells.length > 0) {
        const newCells = sourceCells.map(cell => ({
          version_id: newVersion.id,
          age_category: cell.age_category,
          sex: cell.sex,
          weight_min: cell.weight_min,
          weight_max: cell.weight_max,
          breed_group: cell.breed_group,
          base_price: cell.base_price,
          notes: cell.notes,
        }));

        const { error: insertError } = await supabase
          .from('price_grid_cells')
          .insert(newCells);

        if (insertError) throw insertError;
      }

      // Log duplication
      await supabase.from('price_grid_change_log').insert({
        version_id: newVersion.id,
        action_type: 'version_duplicated',
        previous_value: sourceVersionId,
        new_value: newVersionName,
        changed_by: `${roleName} (${role})`,
      });

      return newVersion as PriceGridVersion;
    },
    onSuccess: () => {
      toast({
        title: 'Version Duplicated',
        description: 'New version created with copied price cells.',
      });
      queryClient.invalidateQueries({ queryKey: ['price-grid'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
