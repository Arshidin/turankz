import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle2, Clock, Eye, Heart, Info, AlertCircle, Award } from 'lucide-react';
import { CriteriaFilter, defaultCriteriaFilters, hasActiveFilters, type CriteriaFilterState } from '@/components/livestock';
import { useFilteredMarketData, type RegionSupply, aggregateByRegion, aggregateBatchesForMpk, type AggregatedBatchGroup } from '@/hooks/useMarketData';
import { useStandardPremiums } from '@/hooks/usePremiums';
import { type Batch, type BatchStatus } from '@/hooks/useBatches';
import { format, parseISO } from 'date-fns';
import { CurrentMatchingWindowBanner } from '@/components/admin/CurrentMatchingWindowBanner';
import { useAddToWatchlist } from '@/hooks/useWatchlist';
import { useToast } from '@/hooks/use-toast';

// Map database status to display status
const mapStatus = (status: BatchStatus): BatchStatus => {
  return status;
};

const statusDescriptions = {
  confirmed: 'Confirmed batches are farmer-declared and eligible for matching.',
  'soft-committed': 'Soft committed batches indicate farmer intent, pending final confirmation.',
  forecast: 'Forecast batches are indicative plans, not yet committed by farmers.',
};

// Parse target_week to get month and week label
// Supports formats: YYYY-WXX (e.g., 2025-W01) and WXX-YYYY (e.g., W01-2025)
function parseTargetWeek(targetWeek: string): { targetMonth: string; targetWeekLabel: string } {
  let year: number;
  let week: number;
  
  if (targetWeek.includes('-W')) {
    // Format: YYYY-WXX (e.g., 2025-W01)
    const [yearStr, weekStr] = targetWeek.split('-W');
    year = parseInt(yearStr);
    week = parseInt(weekStr);
  } else if (targetWeek.startsWith('W')) {
    // Format: WXX-YYYY (e.g., W01-2025)
    const parts = targetWeek.split('-');
    week = parseInt(parts[0].replace('W', ''));
    year = parseInt(parts[1]);
  } else {
    // Fallback: try to extract any numbers
    const matches = targetWeek.match(/\d+/g);
    if (matches && matches.length >= 2) {
      if (parseInt(matches[1]) > 100) {
        week = parseInt(matches[0]);
        year = parseInt(matches[1]);
      } else {
        year = parseInt(matches[0]);
        week = parseInt(matches[1]);
      }
    } else {
      // Fallback to current month
      const now = new Date();
      year = now.getFullYear();
      week = 1;
    }
  }
  
  // Calculate date from week
  const date = new Date(year, 0, 1);
  date.setDate(date.getDate() + (week - 1) * 7);
  
  // Format month (e.g., "January 2025")
  const targetMonth = format(date, 'MMMM yyyy');
  const targetWeekLabel = `Week ${week}`;
  
  return { targetMonth, targetWeekLabel };
}

export default function MarketOverview() {
  const { toast } = useToast();
  const [criteriaFilters, setCriteriaFilters] = useState<CriteriaFilterState>(defaultCriteriaFilters);
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const isFiltered = hasActiveFilters(criteriaFilters);
  const addToWatchlist = useAddToWatchlist();
  
  // Fetch premium settings for display
  const { data: standardPremiums } = useStandardPremiums();
  
  // Fetch real data only - no mock data fallback
  const { batches: realBatches, summary: realSummary, regions: realRegions, isLoading, hasData } = useFilteredMarketData(criteriaFilters);
  
  // Use real data only
  const displayBatches = realBatches;
  const displaySummary = realSummary;
  const displayRegions = realRegions;
  
  // Aggregate batches to prevent deanonymization (group by region, target_week, grade, status)
  const aggregatedBatches = useMemo(
    () => aggregateBatchesForMpk(displayBatches),
    [displayBatches]
  );
  
  // Apply grade filter to aggregated batches
  const gradedBatches = useMemo(() => {
    if (gradeFilter === 'all') return aggregatedBatches;
    return aggregatedBatches.filter(b => b.grade?.toLowerCase() === gradeFilter);
  }, [aggregatedBatches, gradeFilter]);
  
  // Apply grade filter to regions data
  const filteredRegions = useMemo(() => {
    if (gradeFilter === 'all') return displayRegions;
    const filteredBatchesForRegions = displayBatches.filter(b => b.grade?.toLowerCase() === gradeFilter);
    return aggregateByRegion(filteredBatchesForRegions);
  }, [displayRegions, displayBatches, gradeFilter]);
  
  const handleAddToWatchlist = async (batch: Batch) => {
    try {
      const { targetMonth, targetWeekLabel } = parseTargetWeek(batch.target_week || '');
      
      await addToWatchlist.mutateAsync({
        region: batch.region,
        target_month: targetMonth,
        target_week: targetWeekLabel,
        notes: `Breed: ${batch.breed || 'Any'}, Gender: ${batch.gender || 'Any'}`,
      });
      
      toast({
        title: 'Added to watchlist',
        description: `${batch.region} ${targetWeekLabel} has been added to your watchlist.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to watchlist. It may already be in your watchlist.',
        variant: 'destructive',
      });
    }
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Market Overview" 
        description="Aggregated supply visibility by readiness status — indicative data only. Individual farmer data is anonymized." 
      />

      {/* Current Matching Window Banner */}
      <div className="mb-6">
        <CurrentMatchingWindowBanner />
      </div>

      {/* Criteria Filter */}
      <div className="mb-6">
        <CriteriaFilter filters={criteriaFilters} onFiltersChange={setCriteriaFilters} />
        {isFiltered && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Showing supply matching your acceptance criteria. Individual farmer data remains anonymous.
          </p>
        )}
        {!isFiltered && hasData && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Showing all available supply data. Use filters to narrow down by criteria.
          </p>
        )}
        {!isLoading && !hasData && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            No supply data available. Real supply data will appear when farmers declare batches with status "Soft Committed" or "Confirmed".
          </p>
        )}
        {!isLoading && hasData && isFiltered && gradedBatches.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            No batches match your current filter criteria. Try adjusting your filters.
          </p>
        )}
      </div>

      {/* Availability by Readiness */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="border-status-confirmed/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmed (Indicative)</p>
                    <p className="text-2xl font-semibold text-foreground">{displaySummary.confirmed}</p>
                    <p className="text-xs text-status-confirmed">Farmer-declared, eligible for matching</p>
                  </div>
                  <div className="w-10 h-10 bg-status-confirmed/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-status-confirmed" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-status-soft-committed/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Soft Committed (Indicative)</p>
                    <p className="text-2xl font-semibold text-foreground">{displaySummary.softCommitted}</p>
                    <p className="text-xs text-status-soft-committed">Farmer intent, pending confirmation</p>
                  </div>
                  <div className="w-10 h-10 bg-status-soft-committed/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-status-soft-committed" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-status-forecast/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Forecast (Indicative)</p>
                    <p className="text-2xl font-semibold text-foreground">{displaySummary.forecast}</p>
                    <p className="text-xs text-status-forecast">Indicative, non-binding</p>
                  </div>
                  <div className="w-10 h-10 bg-status-forecast/10 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-status-forecast" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Premium Eligibility Indicator */}
          <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Standard Premium Indicative Reference</p>
                  <p className="text-xs text-muted-foreground">
                    Aggregated supply may qualify for indicative premiums of up to +{standardPremiums?.[standardPremiums.length - 1]?.premium_value ?? 100} ₸/kg based on batch quality. Final premiums determined at settlement.
                  </p>
                </div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Reference
                </Badge>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply by Region */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Supply by Region</CardTitle>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="a">Grade A</SelectItem>
                <SelectItem value="b">Grade B</SelectItem>
                <SelectItem value="c">Grade C</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : filteredRegions.length > 0 ? (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border mb-3">
                  <div className="text-xs font-medium text-muted-foreground">Region</div>
                  <div className="text-xs font-medium text-status-confirmed text-center">Confirmed</div>
                  <div className="text-xs font-medium text-status-soft-committed text-center">Soft Comm.</div>
                  <div className="text-xs font-medium text-status-forecast text-center">Forecast</div>
                </div>
                <div className="space-y-2">
                  {filteredRegions.map((region) => (
                    <div key={region.region} className="grid grid-cols-4 gap-2 py-2 border-b border-border/50 last:border-0 items-center">
                      <div className="text-sm font-medium text-foreground">{region.region}</div>
                      <div className="text-sm text-center font-medium text-foreground">{region.confirmed}</div>
                      <div className="text-sm text-center text-foreground">{region.softCommitted}</div>
                      <div className="text-sm text-center text-muted-foreground">{region.forecast}</div>
                    </div>
                  ))}
                </div>
                {/* Totals Row */}
                <div className="grid grid-cols-4 gap-2 pt-3 mt-2 border-t border-border">
                  <div className="text-sm font-semibold text-foreground">Total</div>
                  <div className="text-sm text-center font-semibold text-foreground">
                    {filteredRegions.reduce((sum, r) => sum + r.confirmed, 0)}
                  </div>
                  <div className="text-sm text-center font-semibold text-foreground">
                    {filteredRegions.reduce((sum, r) => sum + r.softCommitted, 0)}
                  </div>
                  <div className="text-sm text-center font-semibold text-muted-foreground">
                    {filteredRegions.reduce((sum, r) => sum + r.forecast, 0)}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No supply data available for the selected criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Batches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Upcoming Batches</CardTitle>
              {isFiltered && (
                <span className="text-xs text-muted-foreground">{gradedBatches.length} matching</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Status Legend */}
            <div className="p-3 bg-secondary/30 rounded-lg mb-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><span className="font-medium text-status-confirmed">Confirmed:</span> {statusDescriptions.confirmed}</p>
                  <p><span className="font-medium text-status-soft-committed">Soft Committed:</span> {statusDescriptions['soft-committed']}</p>
                  <p><span className="font-medium text-status-forecast">Forecast:</span> {statusDescriptions.forecast}</p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {gradedBatches.length > 0 ? (
                  gradedBatches.slice(0, 5).map((group, index) => (
                    <div key={`${group.region}-${group.target_week}-${group.grade}-${group.status}-${index}`} className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                            <span className="text-sm font-medium text-foreground">{group.grade || 'N/A'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {group.region} • {group.target_week}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {group.total_heads} heads
                              {group.batch_count > 1 && ` (${group.batch_count} batches)`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={mapStatus(group.status as BatchStatus)} />
                        </div>
                      </div>
                      {/* Show aggregated criteria info */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {group.breeds.length > 0 && (
                          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                            {group.breeds.join(', ')}
                          </span>
                        )}
                        {group.genders.length > 0 && (
                          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                            {group.genders.join(', ')}
                          </span>
                        )}
                        {(group.age_min !== null || group.age_max !== null) && (
                          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                            {group.age_min ?? '–'}–{group.age_max ?? '–'} mo
                          </span>
                        )}
                        {(group.weight_min !== null || group.weight_max !== null) && (
                          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                            {group.weight_min ?? '–'}–{group.weight_max ?? '–'} kg
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3 pt-2 border-t border-border/50">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => {
                            // Create a synthetic batch object for watchlist (using aggregated data)
                            const syntheticBatch: Batch = {
                              id: `aggregated-${index}`,
                              region: group.region,
                              target_week: group.target_week,
                              grade: group.grade || undefined,
                              status: group.status,
                              heads: group.total_heads,
                              breed: group.breeds[0] || undefined,
                              gender: group.genders[0] || undefined,
                              age_min: group.age_min || undefined,
                              age_max: group.age_max || undefined,
                              weight_min: group.weight_min || undefined,
                              weight_max: group.weight_max || undefined,
                            } as Batch;
                            handleAddToWatchlist(syntheticBatch);
                          }}
                          disabled={addToWatchlist.isPending}
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          Add to Watchlist
                        </Button>
                        <Button variant="default" size="sm" className="flex-1 text-xs" disabled>
                          Express Interest
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No batches match your criteria filters.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
