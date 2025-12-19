import { useState } from 'react';
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
import { useFilteredMarketData, type RegionSupply } from '@/hooks/useMarketData';
import { useStandardPremiums } from '@/hooks/usePremiums';
import { type Batch, type BatchStatus } from '@/hooks/useBatches';
import { format, parseISO } from 'date-fns';
import { CurrentMatchingWindowBanner } from '@/components/admin/CurrentMatchingWindowBanner';

// Map database status to display status
const mapStatus = (status: BatchStatus): BatchStatus => {
  return status;
};

const statusDescriptions = {
  confirmed: 'Confirmed batches are farmer-declared and eligible for matching.',
  'soft-committed': 'Soft committed batches indicate farmer intent, pending final confirmation.',
  forecast: 'Forecast batches are indicative plans, not yet committed by farmers.',
};

export default function MarketOverview() {
  const [criteriaFilters, setCriteriaFilters] = useState<CriteriaFilterState>(defaultCriteriaFilters);
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const isFiltered = hasActiveFilters(criteriaFilters);
  
  // Fetch premium settings for display
  const { data: standardPremiums } = useStandardPremiums();
  
  // Fetch real data only - no mock data fallback
  const { batches: realBatches, summary: realSummary, regions: realRegions, isLoading, hasData } = useFilteredMarketData(criteriaFilters);
  
  // Use real data only
  const displayBatches = realBatches;
  const displaySummary = realSummary;
  const displayRegions = realRegions;
  
  // Apply grade filter to displayed batches
  const gradedBatches = gradeFilter === 'all' 
    ? displayBatches 
    : displayBatches.filter(b => b.grade?.toLowerCase() === gradeFilter);

  return (
    <MainLayout>
      <PageHeader 
        title="Market Overview" 
        description="Aggregated supply visibility by readiness status — indicative data only" 
      />

      {/* Current Matching Window Banner */}
      <div className="mb-6">
        <CurrentMatchingWindowBanner />
      </div>

      {/* Criteria Filter */}
      <div className="mb-6">
        <CriteriaFilter filters={criteriaFilters} onFiltersChange={setCriteriaFilters} />
        {isFiltered && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing supply matching your acceptance criteria. Individual farmer data remains anonymous.
          </p>
        )}
        {!hasData && (
          <p className="text-xs text-amber-600 mt-2">
            Displaying sample data. Real supply data will appear when farmers declare batches.
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
            ) : displayRegions.length > 0 ? (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border mb-3">
                  <div className="text-xs font-medium text-muted-foreground">Region</div>
                  <div className="text-xs font-medium text-status-confirmed text-center">Confirmed</div>
                  <div className="text-xs font-medium text-status-soft-committed text-center">Soft Comm.</div>
                  <div className="text-xs font-medium text-status-forecast text-center">Forecast</div>
                </div>
                <div className="space-y-2">
                  {displayRegions.map((region) => (
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
                    {displayRegions.reduce((sum, r) => sum + r.confirmed, 0)}
                  </div>
                  <div className="text-sm text-center font-semibold text-foreground">
                    {displayRegions.reduce((sum, r) => sum + r.softCommitted, 0)}
                  </div>
                  <div className="text-sm text-center font-semibold text-muted-foreground">
                    {displayRegions.reduce((sum, r) => sum + r.forecast, 0)}
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
                  gradedBatches.slice(0, 5).map((batch) => (
                    <div key={batch.id || batch.batch_number} className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                            <span className="text-sm font-medium text-foreground">{batch.grade}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{batch.batch_number}</p>
                            <p className="text-xs text-muted-foreground">{batch.region} • {batch.heads} heads</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={mapStatus(batch.status as BatchStatus)} />
                          <p className="text-xs text-muted-foreground mt-1">{batch.target_week}</p>
                        </div>
                      </div>
                      {/* Show criteria info */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {batch.breed && (
                          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{batch.breed}</span>
                        )}
                        {batch.gender && (
                          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{batch.gender}</span>
                        )}
                        {(batch.age_min || batch.age_max) && (
                          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                            {batch.age_min ?? '–'}–{batch.age_max ?? '–'} mo
                          </span>
                        )}
                        {(batch.weight_min || batch.weight_max) && (
                          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                            {batch.weight_min ?? '–'}–{batch.weight_max ?? '–'} kg
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3 pt-2 border-t border-border/50">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          Add to Watchlist
                        </Button>
                        <Button variant="default" size="sm" className="flex-1 text-xs">
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
