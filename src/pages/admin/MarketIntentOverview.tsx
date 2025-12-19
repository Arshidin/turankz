import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, MapPin, Layers, Clock, AlertTriangle, BarChart3, Shield, CheckCircle2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useAggregatedMarketIntent, 
  useAllMarketIntentsForAdmin,
  useUpdateIntentVerification,
  HORIZON_OPTIONS, 
  CONFIDENCE_OPTIONS,
  type MarketIntentHorizon,
  type IntentConfidenceLevel 
} from '@/hooks/useMarketIntent';
import { ALL_REGIONS } from '@/lib/defaults';

const VERIFICATION_OPTIONS = {
  pending: { label: 'Pending', icon: Clock, color: 'text-muted-foreground' },
  reviewed: { label: 'Reviewed', icon: Eye, color: 'text-amber-600' },
  verified: { label: 'Verified', icon: CheckCircle2, color: 'text-emerald-600' },
};

export default function MarketIntentOverview() {
  const { t } = useTranslation();
  const [selectedHorizon, setSelectedHorizon] = useState<MarketIntentHorizon | undefined>(undefined);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'aggregated' | 'verification'>('aggregated');
  
  const { data: aggregatedData, isLoading } = useAggregatedMarketIntent(selectedHorizon);
  const { data: allIntents, isLoading: isLoadingIntents } = useAllMarketIntentsForAdmin();
  const updateVerification = useUpdateIntentVerification();

  // Filter aggregated data by region
  const filteredData = aggregatedData?.filter(row => {
    if (regionFilter !== 'all' && row.region !== regionFilter) return false;
    return true;
  }) || [];

  // Calculate totals
  const totalHeads = filteredData.reduce((sum, row) => sum + row.total_estimated_heads, 0);
  const totalIntents = filteredData.reduce((sum, row) => sum + row.intent_count, 0);
  const uniqueRegions = new Set(filteredData.map(row => row.region)).size;

  // Group by region
  const byRegion = filteredData.reduce((acc, row) => {
    if (!acc[row.region]) {
      acc[row.region] = { total: 0, intents: 0, breeds: {} as Record<string, number>, horizons: {} as Record<MarketIntentHorizon, number> };
    }
    acc[row.region].total += row.total_estimated_heads;
    acc[row.region].intents += row.intent_count;
    acc[row.region].breeds[row.breed] = (acc[row.region].breeds[row.breed] || 0) + row.total_estimated_heads;
    acc[row.region].horizons[row.horizon] = (acc[row.region].horizons[row.horizon] || 0) + row.total_estimated_heads;
    return acc;
  }, {} as Record<string, { total: number; intents: number; breeds: Record<string, number>; horizons: Record<MarketIntentHorizon, number> }>);

  // Group by horizon
  const byHorizon = filteredData.reduce((acc, row) => {
    if (!acc[row.horizon]) {
      acc[row.horizon] = { total: 0, intents: 0 };
    }
    acc[row.horizon].total += row.total_estimated_heads;
    acc[row.horizon].intents += row.intent_count;
    return acc;
  }, {} as Record<MarketIntentHorizon, { total: number; intents: number }>);

  const handleVerificationChange = async (id: string, status: string) => {
    try {
      await updateVerification.mutateAsync({ 
        id, 
        verification_status: status,
        verified_by: 'Admin'
      });
      toast.success(`Intent marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('marketIntentOverview.title', 'Market Intent Overview')}
          description={t('marketIntentOverview.description', 'Aggregated voluntary market availability signals from all farmers')}
        />

        {/* Non-Binding Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {t('marketIntentOverview.disclaimer.title', 'Non-Binding Intent Data')}
            </p>
            <p className="text-amber-700 dark:text-amber-300 mt-0.5">
              {t('marketIntentOverview.disclaimer.text', 'Market intents are voluntary, non-binding signals. They do not create batches, contracts, or participate in matching. Only confirmed batches are eligible for pool matching.')}
            </p>
          </div>
        </div>

        {/* Admin restriction notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Admin View Only
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-0.5">
              Admin can view full dataset and mark data as reviewed/verified. Farmer-submitted data cannot be edited.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'aggregated' | 'verification')}>
          <TabsList>
            <TabsTrigger value="aggregated" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Aggregated View
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Verification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aggregated" className="space-y-6 mt-6">
            {/* Filters */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('marketIntentOverview.horizon', 'Time Horizon')}</Label>
                    <Select 
                      value={selectedHorizon || 'all'} 
                      onValueChange={(v) => setSelectedHorizon(v === 'all' ? undefined : v as MarketIntentHorizon)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All horizons" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All horizons</SelectItem>
                        {Object.entries(HORIZON_OPTIONS).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('common.region', 'Region')}</Label>
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All regions</SelectItem>
                        {ALL_REGIONS.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-8 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredData.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                message={t('marketIntentOverview.noData', 'No market intent data')}
                helperText={t('marketIntentOverview.noDataDescription', 'No farmers have submitted market availability intents.')}
              />
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Layers className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{totalHeads.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Estimated Heads</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{totalIntents}</div>
                          <div className="text-sm text-muted-foreground">Total Intents</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <MapPin className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{uniqueRegions}</div>
                          <div className="text-sm text-muted-foreground">Regions</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* By Horizon */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {t('marketIntentOverview.byHorizon', 'By Time Horizon')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {(['3m', '6m', '12m'] as MarketIntentHorizon[]).map(h => {
                        const data = byHorizon[h];
                        return (
                          <div key={h} className="p-4 rounded-lg border bg-card">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{HORIZON_OPTIONS[h].label}</span>
                            </div>
                            <div className="text-2xl font-bold">{(data?.total || 0).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{data?.intents || 0} intents</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* By Region */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {t('marketIntentOverview.byRegion', 'By Region')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(byRegion)
                        .sort(([, a], [, b]) => b.total - a.total)
                        .map(([region, data]) => (
                          <div key={region} className="p-4 rounded-lg border bg-card">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{region}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {data.intents} intents
                                </span>
                              </div>
                              <div className="text-lg font-bold">{data.total.toLocaleString()} heads</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {(['3m', '6m', '12m'] as MarketIntentHorizon[]).map(h => (
                                <div key={h} className="flex justify-between p-2 rounded bg-muted/50">
                                  <span className="text-muted-foreground">{HORIZON_OPTIONS[h].label}</span>
                                  <span className="font-medium">{(data.horizons[h] || 0).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="verification" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Individual Intent Verification
                </CardTitle>
                <CardDescription>
                  Review and verify farmer-submitted intents. Admin can mark as reviewed or verified but cannot edit farmer data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingIntents ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !allIntents?.length ? (
                  <EmptyState
                    icon={TrendingUp}
                    message="No intents to verify"
                    helperText="No market availability intents have been submitted yet."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium">Farmer</th>
                          <th className="text-left py-2 px-3 font-medium">Region</th>
                          <th className="text-left py-2 px-3 font-medium">Breed</th>
                          <th className="text-left py-2 px-3 font-medium">Horizon</th>
                          <th className="text-right py-2 px-3 font-medium">Est. Heads</th>
                          <th className="text-center py-2 px-3 font-medium">Confidence</th>
                          <th className="text-center py-2 px-3 font-medium">Status</th>
                          <th className="text-center py-2 px-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allIntents.slice(0, 50).map((intent) => {
                          const statusConfig = VERIFICATION_OPTIONS[intent.verification_status as keyof typeof VERIFICATION_OPTIONS] || VERIFICATION_OPTIONS.pending;
                          const StatusIcon = statusConfig.icon;
                          return (
                            <tr key={intent.id} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="py-2 px-3 font-medium">{intent.farmer_name}</td>
                              <td className="py-2 px-3">{intent.farmer_region}</td>
                              <td className="py-2 px-3">{intent.breed}</td>
                              <td className="py-2 px-3">
                                <Badge variant="outline" className="text-xs">
                                  {HORIZON_OPTIONS[intent.horizon]?.label || intent.horizon}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-right font-medium">
                                {intent.estimated_heads.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <Badge variant="outline" className={`text-xs ${CONFIDENCE_OPTIONS[intent.confidence_level]?.color || ''}`}>
                                  {CONFIDENCE_OPTIONS[intent.confidence_level]?.label || intent.confidence_level}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <Badge variant="outline" className={`text-xs ${statusConfig.color}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {intent.verification_status !== 'reviewed' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleVerificationChange(intent.id, 'reviewed')}
                                      disabled={updateVerification.isPending}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {intent.verification_status !== 'verified' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleVerificationChange(intent.id, 'verified')}
                                      disabled={updateVerification.isPending}
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {allIntents.length > 50 && (
                      <div className="text-center py-3 text-sm text-muted-foreground">
                        Showing 50 of {allIntents.length} intents
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}