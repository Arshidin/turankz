import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { History, Grid3X3, Award, ShieldCheck } from 'lucide-react';

interface PriceGridChangeLog {
  id: string;
  version_id: string | null;
  action_type: string;
  previous_value: string | null;
  new_value: string | null;
  changed_by: string;
  change_reason: string | null;
  created_at: string;
}

interface PremiumChangeLog {
  id: string;
  premium_setting_id: string | null;
  previous_value: number | null;
  new_value: number | null;
  changed_by: string | null;
  change_reason: string | null;
  created_at: string;
}

function usePriceGridChangeLog() {
  return useQuery({
    queryKey: ['price-grid-change-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_grid_change_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as PriceGridChangeLog[];
    },
  });
}

function usePremiumChangeLog() {
  return useQuery({
    queryKey: ['premium-change-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premium_change_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as PremiumChangeLog[];
    },
  });
}

function usePremiumSettings() {
  return useQuery({
    queryKey: ['premium-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premium_settings')
        .select('id, level_name, premium_type');

      if (error) throw error;
      return data;
    },
  });
}

function usePriceGridVersions() {
  return useQuery({
    queryKey: ['price-grid', 'versions-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_grid_versions')
        .select('id, version_name');

      if (error) throw error;
      return data;
    },
  });
}

const ACTION_TYPE_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  version_created: { label: 'Version Created', variant: 'default' },
  version_activated: { label: 'Version Activated', variant: 'default' },
  version_duplicated: { label: 'Version Duplicated', variant: 'secondary' },
  cell_updated: { label: 'Cell Updated', variant: 'secondary' },
  cell_deleted: { label: 'Cell Deleted', variant: 'outline' },
};

export function PricingGovernanceAudit() {
  const { data: priceGridLogs, isLoading: loadingPriceGrid } = usePriceGridChangeLog();
  const { data: premiumLogs, isLoading: loadingPremiums } = usePremiumChangeLog();
  const { data: premiumSettings } = usePremiumSettings();
  const { data: priceGridVersions } = usePriceGridVersions();

  const getPremiumName = (id: string | null) => {
    if (!id) return 'Unknown';
    return premiumSettings?.find(p => p.id === id)?.level_name || 'Unknown';
  };

  const getPremiumType = (id: string | null) => {
    if (!id) return '';
    return premiumSettings?.find(p => p.id === id)?.premium_type || '';
  };

  const getVersionName = (id: string | null) => {
    if (!id) return 'Unknown';
    return priceGridVersions?.find(v => v.id === id)?.version_name || 'Unknown';
  };

  // Combined and sorted logs for the "All" tab
  const allLogs = [
    ...(priceGridLogs?.map(log => ({ ...log, source: 'price_grid' as const })) || []),
    ...(premiumLogs?.map(log => ({ 
      ...log, 
      source: 'premium' as const,
      action_type: log.new_value !== null && log.previous_value !== null ? 'value_changed' : 'status_changed',
      new_value: log.new_value?.toString() || null,
      previous_value: log.previous_value?.toString() || null,
      version_id: log.premium_setting_id,
    })) || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Pricing Governance Audit
        </CardTitle>
        <CardDescription>
          Complete audit trail of all pricing and premium changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <History className="h-4 w-4" />
              All Changes
            </TabsTrigger>
            <TabsTrigger value="price-grid" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Price Grid
            </TabsTrigger>
            <TabsTrigger value="premiums" className="gap-2">
              <Award className="h-4 w-4" />
              Premiums
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {(loadingPriceGrid || loadingPremiums) ? (
              <Skeleton className="h-48" />
            ) : allLogs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No changes recorded yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allLogs.slice(0, 50).map((log, idx) => (
                    <TableRow key={`${log.source}-${log.id}-${idx}`}>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.source === 'price_grid' ? 'default' : 'secondary'} className="text-xs">
                          {log.source === 'price_grid' ? 'Price Grid' : 'Premium'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.source === 'price_grid' ? (
                          <Badge variant={ACTION_TYPE_LABELS[log.action_type]?.variant || 'outline'} className="text-xs">
                            {ACTION_TYPE_LABELS[log.action_type]?.label || log.action_type}
                          </Badge>
                        ) : (
                          <span className="text-sm">{getPremiumName(log.version_id)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.source === 'price_grid' ? (
                          <span className="font-medium">{log.new_value || '-'}</span>
                        ) : (
                          <span>
                            <span className="text-muted-foreground">{log.previous_value}</span>
                            {' → '}
                            <span className="font-medium">{log.new_value} ₸/kg</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{log.changed_by || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.change_reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="price-grid">
            {loadingPriceGrid ? (
              <Skeleton className="h-48" />
            ) : !priceGridLogs?.length ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No price grid changes recorded yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceGridLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getVersionName(log.version_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ACTION_TYPE_LABELS[log.action_type]?.variant || 'outline'} className="text-xs">
                          {ACTION_TYPE_LABELS[log.action_type]?.label || log.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {log.new_value || '-'}
                      </TableCell>
                      <TableCell className="text-sm">{log.changed_by}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.change_reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="premiums">
            {loadingPremiums ? (
              <Skeleton className="h-48" />
            ) : !premiumLogs?.length ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No premium changes recorded yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Premium Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>New Value</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {premiumLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {getPremiumType(log.premium_setting_id).replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getPremiumName(log.premium_setting_id)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.previous_value} ₸/kg
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {log.new_value} ₸/kg
                      </TableCell>
                      <TableCell className="text-sm">{log.changed_by || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.change_reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
