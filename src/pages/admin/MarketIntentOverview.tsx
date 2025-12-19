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
import { TrendingUp, MapPin, Layers, Clock, AlertTriangle, BarChart3, Users } from 'lucide-react';
import { 
  useAggregatedMarketIntent, 
  HORIZON_OPTIONS, 
  CONFIDENCE_OPTIONS,
  type MarketIntentHorizon,
  type IntentConfidenceLevel 
} from '@/hooks/useMarketIntent';
import { ALL_REGIONS } from '@/lib/defaults';

export default function MarketIntentOverview() {
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
      acc[row.region] = { total: 0, intents: 0, breeds: {} as Record<string, number>, horizons: {} as Record<MarketIntentHorizon, number> };
    }
    acc[row.region].total += row.total_estimated_heads;
    acc[row.region].intents += row.intent_count;
    acc[row.region].breeds[row.breed] = (acc[row.region].breeds[row.breed] || 0) + row.total_estimated_heads;
    acc[row.region].horizons[row.horizon] = (acc[row.region].horizons[row.horizon] || 0) + row.total_estimated_heads;
    return acc;
  }, {} as Record<string, { total: number; intents: number; breeds: Record<string, number>; horizons: Record<MarketIntentHorizon, number> }>);

  // Group by breed
  const byBreed = filteredData.reduce((acc, row) => {
    if (!acc[row.breed]) {
      acc[row.breed] = { total: 0, intents: 0 };
    }
    acc[row.breed].total += row.total_estimated_heads;
    acc[row.breed].intents += row.intent_count;
    return acc;
  }, {} as Record<string, { total: number; intents: number }>);

  // Group by horizon
  const byHorizon = filteredData.reduce((acc, row) => {
    if (!acc[row.horizon]) {
      acc[row.horizon] = { total: 0, intents: 0 };
    }
    acc[row.horizon].total += row.total_estimated_heads;
    acc[row.horizon].intents += row.intent_count;
    return acc;
  }, {} as Record<MarketIntentHorizon, { total: number; intents: number }>);

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
                        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                          {(['3m', '6m', '12m'] as MarketIntentHorizon[]).map(h => (
                            <div key={h} className="flex justify-between p-2 rounded bg-muted/50">
                              <span className="text-muted-foreground">{HORIZON_OPTIONS[h].label}</span>
                              <span className="font-medium">{(data.horizons[h] || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Breeds: </span>
                          {Object.entries(data.breeds)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 3)
                            .map(([breed, count]) => `${breed} (${count})`)
                            .join(', ')}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* By Breed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  {t('marketIntentOverview.byBreed', 'By Breed')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(byBreed)
                    .sort(([, a], [, b]) => b.total - a.total)
                    .map(([breed, data]) => (
                      <div key={breed} className="p-3 rounded-lg border bg-card">
                        <div className="text-sm font-medium truncate">{breed}</div>
                        <div className="text-xl font-bold">{data.total.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{data.intents} intents</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  {t('marketIntentOverview.detailedBreakdown', 'Detailed Breakdown')}
                </CardTitle>
                <CardDescription>
                  Aggregated by region, breed, and horizon (last 90 days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Region</th>
                        <th className="text-left py-2 px-3 font-medium">Breed</th>
                        <th className="text-left py-2 px-3 font-medium">Horizon</th>
                        <th className="text-right py-2 px-3 font-medium">Est. Heads</th>
                        <th className="text-right py-2 px-3 font-medium">Intents</th>
                        <th className="text-center py-2 px-3 font-medium">Avg. Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-2 px-3">{row.region}</td>
                          <td className="py-2 px-3">{row.breed}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-xs">
                              {HORIZON_OPTIONS[row.horizon]?.label || row.horizon}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {row.total_estimated_heads.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right text-muted-foreground">
                            {row.intent_count}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <ConfidenceBadge level={row.avg_confidence} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredData.length > 50 && (
                    <div className="text-center py-3 text-sm text-muted-foreground">
                      Showing 50 of {filteredData.length} rows
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}

function ConfidenceBadge({ level }: { level: IntentConfidenceLevel }) {
  const { label, color } = CONFIDENCE_OPTIONS[level];
  return (
    <Badge variant="outline" className={`text-[10px] ${color}`}>
      {label}
    </Badge>
  );
}
