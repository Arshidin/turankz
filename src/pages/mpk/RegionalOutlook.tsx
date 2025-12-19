import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { TrendingUp, MapPin, Info, Clock, AlertTriangle, Layers } from 'lucide-react';
import { 
  useAggregatedMarketIntent, 
  HORIZON_OPTIONS, 
  CONFIDENCE_OPTIONS,
  type MarketIntentHorizon,
  type IntentConfidenceLevel 
} from '@/hooks/useMarketIntent';
import { ALL_REGIONS } from '@/lib/defaults';

export default function RegionalOutlook() {
  const { t } = useTranslation();
  const [selectedHorizon, setSelectedHorizon] = useState<MarketIntentHorizon | undefined>(undefined);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  
  const { data: aggregatedData, isLoading } = useAggregatedMarketIntent(selectedHorizon);

  // Filter by region
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
      acc[row.region] = { total: 0, intents: 0, horizons: {} as Record<MarketIntentHorizon, number> };
    }
    acc[row.region].total += row.total_estimated_heads;
    acc[row.region].intents += row.intent_count;
    acc[row.region].horizons[row.horizon] = (acc[row.region].horizons[row.horizon] || 0) + row.total_estimated_heads;
    return acc;
  }, {} as Record<string, { total: number; intents: number; horizons: Record<MarketIntentHorizon, number> }>);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('regionalOutlook.title', 'Regional Supply Outlook')}
          description={t('regionalOutlook.description', 'Aggregated market availability signals from farmers')}
        />

        {/* Non-Binding Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {t('regionalOutlook.disclaimer.title', 'Indicative Data Only')}
            </p>
            <p className="text-amber-700 dark:text-amber-300 mt-0.5">
              {t('regionalOutlook.disclaimer.text', 'Market intents are voluntary, non-binding signals. They do not represent confirmed availability. Only confirmed batches participate in pool matching.')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('regionalOutlook.horizon', 'Time Horizon')}</Label>
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
            message={t('regionalOutlook.noData', 'No market intent data')}
            helperText={t('regionalOutlook.noDataDescription', 'No farmers have submitted market availability intents for the selected criteria.')}
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

            {/* By Region */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {t('regionalOutlook.byRegion', 'Regional Breakdown')}
                </CardTitle>
                <CardDescription>
                  Aggregated by region — no individual farmer data shown
                </CardDescription>
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
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {HORIZON_OPTIONS[h].label}
                              </span>
                              <span className="font-medium">
                                {(data.horizons[h] || 0).toLocaleString()}
                              </span>
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
      </div>
    </MainLayout>
  );
}
