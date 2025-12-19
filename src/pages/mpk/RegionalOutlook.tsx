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
import { TrendingUp, MapPin, Info, Clock, AlertTriangle, Layers, Beef, Shield } from 'lucide-react';
import { 
  useAggregatedMarketIntent, 
  HORIZON_OPTIONS, 
  CONFIDENCE_OPTIONS,
  type MarketIntentHorizon,
  type IntentConfidenceLevel 
} from '@/hooks/useMarketIntent';
import { useAggregatedHerdStructure, LIVESTOCK_CATEGORIES, type LivestockCategory } from '@/hooks/useHerdStructure';
import { ALL_REGIONS } from '@/lib/defaults';

export default function RegionalOutlook() {
  const { t } = useTranslation();
  const [selectedHorizon, setSelectedHorizon] = useState<MarketIntentHorizon | undefined>(undefined);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'intent' | 'herd'>('intent');
  
  const { data: aggregatedData, isLoading } = useAggregatedMarketIntent(selectedHorizon);
  const { data: herdData, isLoading: isLoadingHerd } = useAggregatedHerdStructure();

  // Filter intent data by region
  const filteredData = aggregatedData?.filter(row => {
    if (regionFilter !== 'all' && row.region !== regionFilter) return false;
    return true;
  }) || [];

  // Filter herd data by region
  const filteredHerdData = herdData?.filter(row => {
    if (regionFilter !== 'all' && row.region !== regionFilter) return false;
    return true;
  }) || [];

  // Calculate intent totals
  const totalHeads = filteredData.reduce((sum, row) => sum + row.total_estimated_heads, 0);
  const totalIntents = filteredData.reduce((sum, row) => sum + row.intent_count, 0);
  const uniqueRegions = new Set(filteredData.map(row => row.region)).size;

  // Calculate herd totals
  const totalHerdHeads = filteredHerdData.reduce((sum, row) => sum + row.total_count, 0);
  const herdUniqueRegions = new Set(filteredHerdData.map(row => row.region)).size;

  // Group intent by region
  const byRegion = filteredData.reduce((acc, row) => {
    if (!acc[row.region]) {
      acc[row.region] = { total: 0, intents: 0, horizons: {} as Record<MarketIntentHorizon, number> };
    }
    acc[row.region].total += row.total_estimated_heads;
    acc[row.region].intents += row.intent_count;
    acc[row.region].horizons[row.horizon] = (acc[row.region].horizons[row.horizon] || 0) + row.total_estimated_heads;
    return acc;
  }, {} as Record<string, { total: number; intents: number; horizons: Record<MarketIntentHorizon, number> }>);

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
          description={t('regionalOutlook.description', 'Aggregated market availability signals from farmers')}
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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'intent' | 'herd')}>
          <TabsList>
            <TabsTrigger value="intent" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Market Intent
            </TabsTrigger>
            <TabsTrigger value="herd" className="flex items-center gap-2">
              <Beef className="w-4 h-4" />
              Herd Structure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intent" className="space-y-6 mt-6">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : filteredData.length === 0 ? (
              <EmptyState icon={TrendingUp} message="No market intent data" />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card><CardContent className="p-6"><div className="text-2xl font-bold">{totalHeads.toLocaleString()}</div><div className="text-sm text-muted-foreground">Estimated Heads</div></CardContent></Card>
                  <Card><CardContent className="p-6"><div className="text-2xl font-bold">{totalIntents}</div><div className="text-sm text-muted-foreground">Total Intents</div></CardContent></Card>
                  <Card><CardContent className="p-6"><div className="text-2xl font-bold">{uniqueRegions}</div><div className="text-sm text-muted-foreground">Regions</div></CardContent></Card>
                </div>
                <Card>
                  <CardHeader><CardTitle className="text-base">Regional Breakdown</CardTitle><CardDescription>Aggregated by region — no farmer data</CardDescription></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(byRegion).sort(([, a], [, b]) => b.total - a.total).map(([region, data]) => (
                        <div key={region} className="p-4 rounded-lg border">
                          <div className="flex justify-between mb-2"><Badge variant="outline">{region}</Badge><span className="font-bold">{data.total.toLocaleString()} heads</span></div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {(['3m', '6m', '12m'] as MarketIntentHorizon[]).map(h => (
                              <div key={h} className="flex justify-between p-2 rounded bg-muted/50">
                                <span>{HORIZON_OPTIONS[h].label}</span><span className="font-medium">{(data.horizons[h] || 0).toLocaleString()}</span>
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

          <TabsContent value="herd" className="space-y-6 mt-6">
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
                  <CardHeader><CardTitle className="text-base">Regional Herd Structure</CardTitle><CardDescription>Aggregated by region — no farmer data</CardDescription></CardHeader>
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
