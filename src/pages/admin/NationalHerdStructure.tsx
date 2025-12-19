import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Beef, MapPin, Users, BarChart3, TrendingUp, CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import { 
  useAggregatedHerdStructure, 
  LIVESTOCK_CATEGORIES, 
  CONFIDENCE_LEVELS,
  type LivestockCategory,
  type DataConfidenceLevel 
} from '@/hooks/useHerdStructure';
import { ALL_REGIONS } from '@/lib/defaults';

export default function NationalHerdStructure() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const [selectedYear, setSelectedYear] = useState<number | undefined>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(undefined);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const { data: aggregatedData, isLoading } = useAggregatedHerdStructure(selectedYear, selectedQuarter);

  // Filter data
  const filteredData = aggregatedData?.filter(row => {
    if (regionFilter !== 'all' && row.region !== regionFilter) return false;
    if (categoryFilter !== 'all' && row.category !== categoryFilter) return false;
    return true;
  }) || [];

  // Calculate totals
  const totalHeads = filteredData.reduce((sum, row) => sum + row.total_count, 0);
  const totalFarmers = new Set(filteredData.flatMap(row => row.farmer_count)).size;
  const uniqueRegions = new Set(filteredData.map(row => row.region)).size;

  // Group by region
  const byRegion = filteredData.reduce((acc, row) => {
    if (!acc[row.region]) {
      acc[row.region] = { total: 0, farmers: 0, categories: {} as Record<LivestockCategory, number> };
    }
    acc[row.region].total += row.total_count;
    acc[row.region].farmers = Math.max(acc[row.region].farmers, row.farmer_count);
    acc[row.region].categories[row.category] = (acc[row.region].categories[row.category] || 0) + row.total_count;
    return acc;
  }, {} as Record<string, { total: number; farmers: number; categories: Record<LivestockCategory, number> }>);

  // Group by category
  const byCategory = filteredData.reduce((acc, row) => {
    if (!acc[row.category]) {
      acc[row.category] = { total: 0, farmers: 0 };
    }
    acc[row.category].total += row.total_count;
    acc[row.category].farmers += row.farmer_count;
    return acc;
  }, {} as Record<LivestockCategory, { total: number; farmers: number }>);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('herdStructure.nationalTitle', 'National Herd Structure')}
          description={t('herdStructure.nationalDescription', 'Aggregated livestock capacity data from all registered farmers')}
        />

        {/* Structural Data Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {t('herdStructure.disclaimer.title', 'Structural Data Only')}
            </p>
            <p className="text-amber-700 dark:text-amber-300 mt-0.5">
              {t('herdStructure.disclaimer.text', 'Structural livestock data does not imply market availability. Only confirmed batches are eligible for matching.')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('herdStructure.year', 'Year')}</Label>
                <Select 
                  value={selectedYear?.toString() || 'all'} 
                  onValueChange={(v) => setSelectedYear(v === 'all' ? undefined : parseInt(v))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {years.map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{t('herdStructure.quarter', 'Quarter')}</Label>
                <Select 
                  value={selectedQuarter?.toString() || 'all'} 
                  onValueChange={(v) => setSelectedQuarter(v === 'all' ? undefined : parseInt(v))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="All quarters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All quarters</SelectItem>
                    <SelectItem value="1">Q1</SelectItem>
                    <SelectItem value="2">Q2</SelectItem>
                    <SelectItem value="3">Q3</SelectItem>
                    <SelectItem value="4">Q4</SelectItem>
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

              <div className="space-y-1.5">
                <Label className="text-xs">{t('herdStructure.category', 'Category')}</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {Object.entries(LIVESTOCK_CATEGORIES).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
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
            icon={Beef}
            message={t('herdStructure.noData', 'No herd structure data')}
            helperText={t('herdStructure.noDataDescription', 'No farmers have submitted herd structure snapshots for the selected period.')}
          />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Beef className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{totalHeads.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Heads</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{totalFarmers}</div>
                      <div className="text-sm text-muted-foreground">Contributing Farmers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{uniqueRegions}</div>
                      <div className="text-sm text-muted-foreground">Regions Covered</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* By Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  {t('herdStructure.byCategory', 'By Livestock Category')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(LIVESTOCK_CATEGORIES).map(([key, { label }]) => {
                    const data = byCategory[key as LivestockCategory];
                    return (
                      <div key={key} className="p-4 rounded-lg border bg-card">
                        <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
                        <div className="text-2xl font-bold">
                          {data?.total?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {data?.farmers || 0} farmers
                        </div>
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
                  {t('herdStructure.byRegion', 'By Region')}
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
                              {data.farmers} farmers
                            </span>
                          </div>
                          <div className="text-lg font-bold">{data.total.toLocaleString()} heads</div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          {Object.entries(data.categories).map(([cat, count]) => (
                            <div key={cat} className="flex justify-between">
                              <span className="text-muted-foreground truncate">
                                {LIVESTOCK_CATEGORIES[cat as LivestockCategory]?.label || cat}
                              </span>
                              <span className="font-medium">{count.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  {t('herdStructure.detailedBreakdown', 'Detailed Breakdown')}
                </CardTitle>
                <CardDescription>
                  {t('herdStructure.detailedDescription', 'Aggregated by region, breed, and category')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Region</th>
                        <th className="text-left py-2 px-3 font-medium">Breed</th>
                        <th className="text-left py-2 px-3 font-medium">Category</th>
                        <th className="text-right py-2 px-3 font-medium">Total Count</th>
                        <th className="text-right py-2 px-3 font-medium">Farmers</th>
                        <th className="text-center py-2 px-3 font-medium">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-2 px-3">{row.region}</td>
                          <td className="py-2 px-3">{row.breed}</td>
                          <td className="py-2 px-3">
                            {LIVESTOCK_CATEGORIES[row.category]?.label || row.category}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {row.total_count.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right text-muted-foreground">
                            {row.farmer_count}
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

function ConfidenceBadge({ level }: { level: string }) {
  const config: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
    self_declared: { label: 'Self-Declared', icon: Clock, color: 'text-muted-foreground' },
    reviewed: { label: 'Reviewed', icon: AlertCircle, color: 'text-amber-600' },
    verified: { label: 'Verified', icon: CheckCircle2, color: 'text-emerald-600' },
  };
  
  const { label, icon: Icon, color } = config[level] || config.self_declared;
  
  return (
    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
      <Icon className={`w-3 h-3 mr-1 ${color}`} />
      {label}
    </Badge>
  );
}
