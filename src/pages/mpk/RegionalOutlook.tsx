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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, AlertTriangle, Beef, Shield, Info } from 'lucide-react';
// Market Intent removed from MPK view - admin-only feature
import { useAggregatedHerdStructure, LIVESTOCK_CATEGORIES, type LivestockCategory } from '@/hooks/useHerdStructure';
import { useIndicativeForecast, useForecastCoefficients } from '@/hooks/useForecast';
import { ALL_REGIONS } from '@/lib/defaults';

export default function RegionalOutlook() {
  const { t } = useTranslation();
  const [regionFilter, setRegionFilter] = useState<string>('all');
  
  // Market Intent removed from MPK view - admin-only feature
  const { data: herdData, isLoading: isLoadingHerd } = useAggregatedHerdStructure();
  const { data: forecastData, isLoading: forecastLoading } = useIndicativeForecast();
  const { data: coefficients } = useForecastCoefficients();

  const calvingRate = coefficients?.find(c => c.coefficient_type === 'calving_rate')?.coefficient_value || 0.85;

  // Filter herd data by region
  const filteredHerdData = herdData?.filter(row => {
    if (regionFilter !== 'all' && row.region !== regionFilter) return false;
    return true;
  }) || [];

  // Filter forecast data by region
  const filteredForecastData = forecastData?.filter(row => {
    if (regionFilter !== 'all' && row.region !== regionFilter) return false;
    return true;
  }) || [];

  // Calculate herd totals
  const totalHerdHeads = filteredHerdData.reduce((sum, row) => sum + row.total_count, 0);
  const herdUniqueRegions = new Set(filteredHerdData.map(row => row.region)).size;

  // Calculate forecast totals
  const totalBreedingCows = filteredForecastData.reduce((sum, r) => sum + r.breeding_cows_count, 0);
  const totalEstimatedCalves = filteredForecastData.reduce((sum, r) => sum + r.estimated_calves, 0);

  // Group herd by region
  const herdByRegion = filteredHerdData.reduce((acc, row) => {
    if (!acc[row.region]) {
      acc[row.region] = { total: 0, farmers: 0, categories: {} as Record<LivestockCategory, number> };
    }
    acc[row.region].total += row.total_count;
    acc[row.region].farmers = Math.max(acc[row.region].farmers, row.farmer_count);
    acc[row.region].categories[row.category] = (acc[row.region].categories[row.category] || 0) + row.total_count;
    return acc;
  }, {} as Record<string, { total: number; farmers: number; categories: Record<LivestockCategory, number> }>);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('regionalOutlook.title', 'Regional Supply Outlook')}
          description={t('regionalOutlook.description', 'Aggregated, indicative supply signals — voluntary, non-binding data')}
        />

        {/* MPK visibility notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Aggregated Data Only
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-0.5">
              You are viewing aggregated regional data only. No individual farmer names, farm-level data, or per-farmer confidence attribution is shown.
            </p>
          </div>
        </div>

        {/* Region Filter */}
        <Card>
          <CardContent className="py-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{t('common.region', 'Region')}</Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[180px]">
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
          </CardContent>
        </Card>

        <Tabs defaultValue="forecast">
          <TabsList>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Supply Outlook
            </TabsTrigger>
            <TabsTrigger value="herd" className="flex items-center gap-2">
              <Beef className="w-4 h-4" />
              Herd Structure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-4 mt-6">
            {/* Indicative Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Indicative / Non-binding Forecast
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                  These forecasts are derived from herd structure × reference calving rates. They do not imply farmer commitments and are not linked to pricing or matching.
                </p>
              </div>
            </div>

            {forecastLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : !filteredForecastData?.length ? (
              <EmptyState icon={TrendingUp} message="No forecast data available" />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground mb-1">Breeding Cows</div>
                      <div className="text-2xl font-bold">{totalBreedingCows.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">regional total</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground mb-1">Reference Rate</div>
                      <div className="text-2xl font-bold">{(calvingRate * 100).toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">calving rate</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <div className="text-sm text-muted-foreground mb-1">Estimated Calves</div>
                      <div className="text-2xl font-bold text-primary">{Math.round(totalEstimatedCalves).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">indicative</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Aggregated Indicative Outlook</CardTitle>
                    <CardDescription>Indicative future supply by region — voluntary, non-binding</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredForecastData
                        .sort((a, b) => b.estimated_calves - a.estimated_calves)
                        .map((row, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{row.region}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {row.breeding_cows_count.toLocaleString()} breeding cows
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-primary">
                                ~{Math.round(row.estimated_calves).toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">est. calves</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Market Intent tab removed - admin-only feature */}

          <TabsContent value="herd" className="space-y-4 mt-6">
            {isLoadingHerd ? (
              <Skeleton className="h-32 w-full" />
            ) : filteredHerdData.length === 0 ? (
              <EmptyState icon={Beef} message="No herd structure data" />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card><CardContent className="p-6"><div className="text-2xl font-bold">{totalHerdHeads.toLocaleString()}</div><div className="text-sm text-muted-foreground">Total Heads</div></CardContent></Card>
                  <Card><CardContent className="p-6"><div className="text-2xl font-bold">{herdUniqueRegions}</div><div className="text-sm text-muted-foreground">Regions</div></CardContent></Card>
                </div>
                <Card>
                  <CardHeader><CardTitle className="text-base">Regional Herd Structure</CardTitle><CardDescription>Aggregated structural data — indicative capacity only</CardDescription></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(herdByRegion).sort(([, a], [, b]) => b.total - a.total).map(([region, data]) => (
                        <div key={region} className="p-4 rounded-lg border">
                          <div className="flex justify-between mb-2"><Badge variant="outline">{region}</Badge><span className="font-bold">{data.total.toLocaleString()} heads</span></div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            {Object.entries(data.categories).map(([cat, count]) => (
                              <div key={cat} className="flex justify-between p-2 rounded bg-muted/50">
                                <span className="truncate">{LIVESTOCK_CATEGORIES[cat as LivestockCategory]?.label || cat}</span>
                                <span className="font-medium">{count.toLocaleString()}</span>
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
        </Tabs>
      </div>
    </MainLayout>
  );
}
