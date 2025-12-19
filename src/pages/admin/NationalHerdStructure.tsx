import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Beef, MapPin, Users, BarChart3, TrendingUp, AlertTriangle, Info, Settings, ShieldCheck, History, Eye } from 'lucide-react';
import { 
  useAggregatedHerdStructure, 
  useAllHerdSnapshotsForAdmin,
  useUpdateSnapshotConfidence,
  LIVESTOCK_CATEGORIES,
  CONFIDENCE_LEVELS,
  type LivestockCategory,
  type DataConfidenceLevel
} from '@/hooks/useHerdStructure';
import { useIndicativeForecast, useForecastCoefficients, useUpdateForecastCoefficient } from '@/hooks/useForecast';
import { ConfidenceBadge, ConfidenceLegend } from '@/components/data-integrity/ConfidenceBadge';
import { ALL_REGIONS } from '@/lib/defaults';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCurrentFarmer } from '@/hooks/useCurrentFarmer';

export default function NationalHerdStructure() {
  const { t } = useTranslation();
  const { role, registrationStatus } = useAuthContext();
  const { data: currentFarmer } = useCurrentFarmer();
  const isAdmin = role === 'admin';
  const isFarmer = role === 'farmer';
  const isObserver = isFarmer && currentFarmer?.grading === 'observer';
  const isActivatedFarmer = isFarmer && registrationStatus === 'active';
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const [selectedYear, setSelectedYear] = useState<number | undefined>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(undefined);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  
  // Only admin can view aggregated data
  const { data: aggregatedData, isLoading } = useAggregatedHerdStructure(selectedYear, selectedQuarter);
  // Only admin can view all snapshots for verification
  const { data: allSnapshots, isLoading: snapshotsLoading } = useAllHerdSnapshotsForAdmin();
  // Forecast data - read-only for all roles (admin can view aggregated, others see indicative only)
  const { data: forecastData, isLoading: forecastLoading } = useIndicativeForecast(selectedYear, selectedQuarter);
  // Only admin can view/edit coefficients
  const { data: coefficients } = useForecastCoefficients();
  const updateCoefficient = useUpdateForecastCoefficient();
  const updateConfidence = useUpdateSnapshotConfidence();
  
  const [editingCalvingRate, setEditingCalvingRate] = useState<string>('');
  const calvingRateCoeff = coefficients?.find(c => c.coefficient_type === 'calving_rate' && c.coefficient_key === 'default');

  // Filter aggregated data
  const filteredData = aggregatedData?.filter(row => {
    if (regionFilter !== 'all' && row.region !== regionFilter) return false;
    if (categoryFilter !== 'all' && row.category !== categoryFilter) return false;
    return true;
  }) || [];

  // Filter snapshots for verification
  const filteredSnapshots = allSnapshots?.filter(row => {
    if (regionFilter !== 'all' && row.farmer_region !== regionFilter) return false;
    if (categoryFilter !== 'all' && row.category !== categoryFilter) return false;
    if (confidenceFilter !== 'all' && row.data_confidence_level !== confidenceFilter) return false;
    return true;
  }) || [];

  // Calculate totals
  const totalHeads = filteredData.reduce((sum, row) => sum + row.total_count, 0);
  const totalFarmers = new Set(filteredData.flatMap(row => row.farmer_count)).size;
  const uniqueRegions = new Set(filteredData.map(row => row.region)).size;

  // Confidence breakdown
  const confidenceBreakdown = allSnapshots?.reduce((acc, row) => {
    acc[row.data_confidence_level] = (acc[row.data_confidence_level] || 0) + 1;
    return acc;
  }, {} as Record<DataConfidenceLevel, number>) || {};

  // Forecast totals
  const totalBreedingCows = forecastData?.reduce((sum, r) => sum + r.breeding_cows_count, 0) || 0;
  const totalEstimatedCalves = forecastData?.reduce((sum, r) => sum + r.estimated_calves, 0) || 0;
  const totalForecastFarmers = forecastData?.reduce((sum, r) => sum + r.farmer_count, 0) || 0;

  // Group by region
  const byRegion = filteredData.reduce((acc, row) => {
    if (!acc[row.region]) {
      acc[row.region] = { total: 0, farmers: 0, categories: {} as Record<LivestockCategory, number>, confidence: row.avg_confidence };
    }
    acc[row.region].total += row.total_count;
    acc[row.region].farmers = Math.max(acc[row.region].farmers, row.farmer_count);
    acc[row.region].categories[row.category] = (acc[row.region].categories[row.category] || 0) + row.total_count;
    return acc;
  }, {} as Record<string, { total: number; farmers: number; categories: Record<LivestockCategory, number>; confidence: DataConfidenceLevel }>);

  // Group by category
  const byCategory = filteredData.reduce((acc, row) => {
    if (!acc[row.category]) {
      acc[row.category] = { total: 0, farmers: 0 };
    }
    acc[row.category].total += row.total_count;
    acc[row.category].farmers += row.farmer_count;
    return acc;
  }, {} as Record<LivestockCategory, { total: number; farmers: number }>);

  const handleUpdateCalvingRate = () => {
    if (!calvingRateCoeff || !editingCalvingRate) return;
    const value = parseFloat(editingCalvingRate);
    if (isNaN(value) || value < 0 || value > 1) {
      toast.error('Calving rate must be between 0 and 1');
      return;
    }
    updateCoefficient.mutate(
      { id: calvingRateCoeff.id, coefficient_value: value },
      {
        onSuccess: () => {
          toast.success('Calving rate updated');
          setEditingCalvingRate('');
        },
        onError: () => toast.error('Failed to update'),
      }
    );
  };

  const handleUpdateConfidence = (id: string, newLevel: DataConfidenceLevel) => {
    updateConfidence.mutate(
      { id, confidence_level: newLevel },
      {
        onSuccess: () => toast.success(`Marked as ${CONFIDENCE_LEVELS[newLevel].label}`),
        onError: () => toast.error('Failed to update confidence level'),
      }
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('herdStructure.nationalTitle', 'National Herd Structure')}
          description={t('herdStructure.nationalDescription', 'Aggregated structural capacity data — indicative, voluntary reporting')}
        />

        {/* Read-only mode banner for non-admin */}
        {!isAdmin && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-muted bg-muted/50">
            <Eye className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {t('herdStructure.readOnlyMode', 'Read-Only View')}
              </p>
              <p className="text-muted-foreground mt-0.5">
                {t('herdStructure.readOnlyDescription', 'You are viewing the National Herd Structure in read-only mode. Aggregated data and management tools are available to administrators only.')}
              </p>
            </div>
          </div>
        )}

        <Tabs defaultValue="forecast" className="space-y-4">
          <TabsList>
            {/* Structure tab - Admin only (contains aggregated data) */}
            {isAdmin && (
              <TabsTrigger value="structure">Herd Structure</TabsTrigger>
            )}
            {/* Verification tab - Admin only */}
            {isAdmin && (
              <TabsTrigger value="verification">Data Verification</TabsTrigger>
            )}
            {/* Forecast tab - All roles can view (read-only) */}
            <TabsTrigger value="forecast">Indicative Forecast</TabsTrigger>
            {/* Coefficients tab - Admin only */}
            {isAdmin && (
              <TabsTrigger value="coefficients">Coefficients</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="structure" className="space-y-4">
            {/* Structural Data Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {t('herdStructure.disclaimer.title', 'Structural Data — Indicative Only')}
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                  {t('herdStructure.disclaimer.text', 'Herd structure is voluntary, indicative capacity data. It does not represent market availability or supply commitments. Only confirmed batches participate in matching.')}
                </p>
              </div>
            </div>

            {/* Confidence Legend */}
            <ConfidenceLegend />

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

                {/* By Region with Confidence */}
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
                                <ConfidenceBadge level={data.confidence} />
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
              </>
            )}
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            {/* Admin Note */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Data Verification
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-0.5">
                  Review and update confidence levels for farmer-submitted data. You can mark data as Reviewed or Verified but cannot edit the underlying farmer data.
                </p>
              </div>
            </div>

            {/* Confidence Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['self_declared', 'reviewed', 'verified'] as DataConfidenceLevel[]).map((level) => (
                <Card key={level}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <ConfidenceBadge level={level} size="md" />
                      <div className="text-2xl font-bold">{confidenceBreakdown[level] || 0}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">snapshots</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Region</Label>
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
                    <Label className="text-xs">Confidence</Label>
                    <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All levels</SelectItem>
                        {Object.entries(CONFIDENCE_LEVELS).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {snapshotsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : filteredSnapshots.length === 0 ? (
              <EmptyState icon={History} message="No snapshots to verify" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Individual Snapshots</CardTitle>
                  <CardDescription>
                    {filteredSnapshots.length} snapshots · Click actions to update confidence level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Farmer</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Breed</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSnapshots.slice(0, 50).map((snapshot) => (
                          <TableRow key={snapshot.id}>
                            <TableCell className="font-medium">{snapshot.farmer_name}</TableCell>
                            <TableCell>{snapshot.farmer_region}</TableCell>
                            <TableCell>
                              {snapshot.reporting_quarter ? `Q${snapshot.reporting_quarter} ` : ''}{snapshot.reporting_year}
                            </TableCell>
                            <TableCell>{LIVESTOCK_CATEGORIES[snapshot.category]?.label}</TableCell>
                            <TableCell>{snapshot.breed}</TableCell>
                            <TableCell className="text-right font-medium">
                              {snapshot.count.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <ConfidenceBadge level={snapshot.data_confidence_level} />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {snapshot.data_confidence_level !== 'reviewed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => handleUpdateConfidence(snapshot.id, 'reviewed')}
                                    disabled={updateConfidence.isPending}
                                  >
                                    Mark Reviewed
                                  </Button>
                                )}
                                {snapshot.data_confidence_level !== 'verified' && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-7 text-xs"
                                    onClick={() => handleUpdateConfidence(snapshot.id, 'verified')}
                                    disabled={updateConfidence.isPending}
                                  >
                                    Verify
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredSnapshots.length > 50 && (
                      <div className="text-center py-3 text-sm text-muted-foreground">
                        Showing 50 of {filteredSnapshots.length} snapshots
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            {/* Indicative Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Indicative / Non-binding Forecast
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-0.5">
                  These forecasts are derived from aggregated herd structure × reference calving rates. They are indicative only, do not represent farmer commitments, and are not linked to pricing or pool matching.
                </p>
              </div>
            </div>

            {/* Non-admin: Show limited view with reference calving rate only */}
            {!isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Reference Calving Rate
                  </CardTitle>
                  <CardDescription>
                    System-wide reference coefficient used for indicative forecasting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm text-muted-foreground mb-1">Reference Calving Rate</div>
                    <div className="text-2xl font-bold">{((calvingRateCoeff?.coefficient_value || 0.85) * 100).toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      This rate is used for indicative forecast calculations. Aggregated regional data is available to administrators only.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin: Show full aggregated forecast data */}
            {isAdmin && (
              <>
                {forecastLoading ? (
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
                ) : !forecastData?.length ? (
                  <EmptyState
                    icon={TrendingUp}
                    message="No forecast data"
                    helperText="No breeding cow data available for the selected period."
                  />
                ) : (
                  <>
                    {/* National Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-sm text-muted-foreground mb-1">Breeding Cows</div>
                          <div className="text-2xl font-bold">{totalBreedingCows.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">national total</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-sm text-muted-foreground mb-1">Reference Rate</div>
                          <div className="text-2xl font-bold">{((calvingRateCoeff?.coefficient_value || 0.85) * 100).toFixed(0)}%</div>
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
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-sm text-muted-foreground mb-1">Farmers</div>
                          <div className="text-2xl font-bold">{totalForecastFarmers.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">contributing</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* By Region */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          Regional Indicative Forecast
                        </CardTitle>
                        <CardDescription>Aggregated, non-binding projections by region</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {forecastData
                            .sort((a, b) => b.estimated_calves - a.estimated_calves)
                            .map((row, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline">{row.region}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {row.breeding_cows_count.toLocaleString()} cows · {row.farmer_count} farmers
                                  </span>
                                  {row.data_confidence && (
                                    <ConfidenceBadge level={row.data_confidence} />
                                  )}
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
              </>
            )}
          </TabsContent>

          <TabsContent value="coefficients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Reference Coefficients
                </CardTitle>
                <CardDescription>
                  Admin-managed coefficients used for indicative forecast calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calvingRateCoeff && (
                  <div className="p-4 rounded-lg border space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Calving Rate</div>
                        <div className="text-sm text-muted-foreground">
                          {calvingRateCoeff.description}
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        {(calvingRateCoeff.coefficient_value * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        placeholder="New value (0-1)"
                        value={editingCalvingRate}
                        onChange={(e) => setEditingCalvingRate(e.target.value)}
                        className="w-32"
                      />
                      <Button
                        size="sm"
                        onClick={handleUpdateCalvingRate}
                        disabled={!editingCalvingRate || updateCoefficient.isPending}
                      >
                        Update
                      </Button>
                    </div>
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
