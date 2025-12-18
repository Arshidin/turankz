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

// Map database status to display status
const mapStatus = (status: BatchStatus): BatchStatus => {
  return status;
};

const statusDescriptions = {
  confirmed: 'Confirmed batches are verified and committed by farmers for delivery.',
  'soft-committed': 'Soft committed batches have farmer intent but await final confirmation.',
  forecast: 'Forecast batches are planned but not yet committed by farmers.',
};

// Mock data fallback when database is empty
const mockData = {
  summary: { confirmed: 487, softCommitted: 512, forecast: 257 },
  regions: [
    { region: 'Almaty Oblast', confirmed: 142, softCommitted: 134, forecast: 69, total: 345 },
    { region: 'Akmola Oblast', confirmed: 98, softCommitted: 127, forecast: 64, total: 289 },
    { region: 'East Kazakhstan', confirmed: 112, softCommitted: 102, forecast: 53, total: 267 },
    { region: 'Karaganda Oblast', confirmed: 78, softCommitted: 85, forecast: 35, total: 198 },
    { region: 'Kostanay Oblast', confirmed: 57, softCommitted: 64, forecast: 36, total: 157 },
  ],
  batches: [
    { id: '1', batch_number: 'BTH-2847', region: 'Almaty', heads: 45, grade: 'A', status: 'confirmed' as BatchStatus, target_week: '2025-W52', breed: 'Angus', gender: 'Male', age_min: 14, age_max: 16, weight_min: 320, weight_max: 360 },
    { id: '2', batch_number: 'BTH-2851', region: 'Akmola', heads: 38, grade: 'A', status: 'soft_committed' as BatchStatus, target_week: '2025-W52', breed: 'Hereford', gender: 'Male', age_min: 12, age_max: 14, weight_min: 300, weight_max: 340 },
    { id: '3', batch_number: 'BTH-2856', region: 'Karaganda', heads: 52, grade: 'B', status: 'forecast' as BatchStatus, target_week: '2026-W01', breed: 'Mixed/Crossbred', gender: 'Mixed', age_min: 15, age_max: 18, weight_min: 280, weight_max: 320 },
    { id: '4', batch_number: 'BTH-2859', region: 'East KZ', heads: 30, grade: 'A', status: 'forecast' as BatchStatus, target_week: '2026-W01', breed: 'Kazakh Whiteheaded', gender: 'Male', age_min: 13, age_max: 15, weight_min: 310, weight_max: 350 },
    { id: '5', batch_number: 'BTH-2863', region: 'Almaty', heads: 28, grade: 'B', status: 'forecast' as BatchStatus, target_week: '2026-W02', breed: 'Simmental', gender: 'Male', age_min: 16, age_max: 18, weight_min: 340, weight_max: 380 },
  ] as Partial<Batch>[],
};

// Filter mock batches by criteria
function filterMockBatches(batches: Partial<Batch>[], filters: CriteriaFilterState) {
  if (!hasActiveFilters(filters)) return batches;
  
  return batches.filter(batch => {
    if (filters.breeds.length > 0 && batch.breed && !filters.breeds.includes(batch.breed)) return false;
    if (filters.genders.length > 0 && batch.gender && !filters.genders.includes(batch.gender)) return false;
    if (filters.ageMin !== null && batch.age_max && batch.age_max < filters.ageMin) return false;
    if (filters.ageMax !== null && batch.age_min && batch.age_min > filters.ageMax) return false;
    if (filters.weightMin !== null && batch.weight_max && batch.weight_max < filters.weightMin) return false;
    if (filters.weightMax !== null && batch.weight_min && batch.weight_min > filters.weightMax) return false;
    return true;
  });
}

export default function MarketOverview() {
  const [criteriaFilters, setCriteriaFilters] = useState<CriteriaFilterState>(defaultCriteriaFilters);
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const isFiltered = hasActiveFilters(criteriaFilters);
  
  // Fetch premium settings for display
  const { data: standardPremiums } = useStandardPremiums();
  
  // Fetch real data
  const { batches: realBatches, summary: realSummary, regions: realRegions, isLoading, hasData } = useFilteredMarketData(criteriaFilters);
  
  // Use real data if available, otherwise use filtered mock data
  const filteredMockBatches = filterMockBatches(mockData.batches, criteriaFilters);
  const displayBatches = hasData ? realBatches : filteredMockBatches;
  const displaySummary = hasData ? realSummary : {
    confirmed: isFiltered ? Math.round(mockData.summary.confirmed * (filteredMockBatches.length / mockData.batches.length)) : mockData.summary.confirmed,
    softCommitted: isFiltered ? Math.round(mockData.summary.softCommitted * (filteredMockBatches.length / mockData.batches.length)) : mockData.summary.softCommitted,
    forecast: isFiltered ? Math.round(mockData.summary.forecast * (filteredMockBatches.length / mockData.batches.length)) : mockData.summary.forecast,
  };
  const displayRegions = hasData ? realRegions : mockData.regions;
  
  // Apply grade filter to displayed batches
  const gradedBatches = gradeFilter === 'all' 
    ? displayBatches 
    : displayBatches.filter(b => b.grade?.toLowerCase() === gradeFilter);

  return (
    <MainLayout>
      <PageHeader 
        title="Market Overview" 
        description="Review available supply by readiness status and express interest in batches" 
      />

      {/* Decision Timing Context */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Matching Window</p>
                <p className="text-lg font-semibold text-foreground">Dec 20, 2025</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground md:text-right">
              Submit interest before this date to be considered in the next pool.
            </p>
          </div>
        </CardContent>
      </Card>

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
                    <p className="text-sm text-muted-foreground">Confirmed Available</p>
                    <p className="text-2xl font-semibold text-foreground">{displaySummary.confirmed}</p>
                    <p className="text-xs text-status-confirmed">Ready for commitment</p>
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
                    <p className="text-sm text-muted-foreground">Soft Committed</p>
                    <p className="text-2xl font-semibold text-foreground">{displaySummary.softCommitted}</p>
                    <p className="text-xs text-status-soft-committed">Pending farmer confirmation</p>
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
                    <p className="text-sm text-muted-foreground">Forecast</p>
                    <p className="text-2xl font-semibold text-foreground">{displaySummary.forecast}</p>
                    <p className="text-xs text-status-forecast">Planned availability</p>
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
                  <p className="text-sm font-medium text-foreground">Standard Premium Eligible Supply</p>
                  <p className="text-xs text-muted-foreground">
                    Available supply may qualify for standard premiums of up to +{standardPremiums?.[standardPremiums.length - 1]?.premium_value ?? 100} ₸/kg based on batch quality and standardization.
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
