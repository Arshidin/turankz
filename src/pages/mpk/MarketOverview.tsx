import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle2, Clock, Eye, Heart, Info } from 'lucide-react';
import { CriteriaFilter, defaultCriteriaFilters, hasActiveFilters, type CriteriaFilterState } from '@/components/livestock';

const marketData = {
  summary: {
    confirmed: 487,
    softCommitted: 512,
    forecast: 257,
  },
  nextMatchingWindow: 'Dec 20, 2025',
  regions: [
    { name: 'Almaty Oblast', confirmed: 142, softCommitted: 134, forecast: 69 },
    { name: 'Akmola Oblast', confirmed: 98, softCommitted: 127, forecast: 64 },
    { name: 'East Kazakhstan', confirmed: 112, softCommitted: 102, forecast: 53 },
    { name: 'Karaganda Oblast', confirmed: 78, softCommitted: 85, forecast: 35 },
    { name: 'Kostanay Oblast', confirmed: 57, softCommitted: 64, forecast: 36 },
  ],
  upcomingBatches: [
    { batchId: 'BTH-2847', region: 'Almaty', heads: 45, grade: 'A', status: 'confirmed' as const, date: 'Dec 28', breed: 'Angus', gender: 'Male', ageRange: '14-16', weightRange: '320-360' },
    { batchId: 'BTH-2851', region: 'Akmola', heads: 38, grade: 'A', status: 'soft-committed' as const, date: 'Dec 30', breed: 'Hereford', gender: 'Male', ageRange: '12-14', weightRange: '300-340' },
    { batchId: 'BTH-2856', region: 'Karaganda', heads: 52, grade: 'B', status: 'forecast' as const, date: 'Jan 2', breed: 'Mixed/Crossbred', gender: 'Mixed', ageRange: '15-18', weightRange: '280-320' },
    { batchId: 'BTH-2859', region: 'East KZ', heads: 30, grade: 'A', status: 'forecast' as const, date: 'Jan 5', breed: 'Kazakh Whiteheaded', gender: 'Male', ageRange: '13-15', weightRange: '310-350' },
    { batchId: 'BTH-2863', region: 'Almaty', heads: 28, grade: 'B', status: 'forecast' as const, date: 'Jan 8', breed: 'Simmental', gender: 'Male', ageRange: '16-18', weightRange: '340-380' },
  ]
};

const statusDescriptions = {
  confirmed: 'Confirmed batches are verified and committed by farmers for delivery.',
  'soft-committed': 'Soft committed batches have farmer intent but await final confirmation.',
  forecast: 'Forecast batches are planned but not yet committed by farmers.',
};

// Helper to check if batch matches filter criteria
function batchMatchesFilter(batch: typeof marketData.upcomingBatches[0], filters: CriteriaFilterState): boolean {
  // Breed filter
  if (filters.breeds.length > 0 && !filters.breeds.includes(batch.breed)) {
    return false;
  }
  
  // Gender filter
  if (filters.genders.length > 0 && !filters.genders.includes(batch.gender)) {
    return false;
  }
  
  // Age filter
  const [ageMin, ageMax] = batch.ageRange.split('-').map(Number);
  if (filters.ageMin !== null && ageMax < filters.ageMin) {
    return false;
  }
  if (filters.ageMax !== null && ageMin > filters.ageMax) {
    return false;
  }
  
  // Weight filter
  const [weightMin, weightMax] = batch.weightRange.split('-').map(Number);
  if (filters.weightMin !== null && weightMax < filters.weightMin) {
    return false;
  }
  if (filters.weightMax !== null && weightMin > filters.weightMax) {
    return false;
  }
  
  return true;
}

export default function MarketOverview() {
  const [criteriaFilters, setCriteriaFilters] = useState<CriteriaFilterState>(defaultCriteriaFilters);
  const isFiltered = hasActiveFilters(criteriaFilters);
  
  // Filter batches based on criteria
  const filteredBatches = isFiltered
    ? marketData.upcomingBatches.filter(batch => batchMatchesFilter(batch, criteriaFilters))
    : marketData.upcomingBatches;
  
  // Calculate filtered summary (in real app, this would come from backend)
  const filteredSummary = isFiltered
    ? {
        confirmed: Math.round(marketData.summary.confirmed * (filteredBatches.length / marketData.upcomingBatches.length)),
        softCommitted: Math.round(marketData.summary.softCommitted * (filteredBatches.length / marketData.upcomingBatches.length)),
        forecast: Math.round(marketData.summary.forecast * (filteredBatches.length / marketData.upcomingBatches.length)),
      }
    : marketData.summary;

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
                <p className="text-lg font-semibold text-foreground">{marketData.nextMatchingWindow}</p>
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
      </div>

      {/* Availability by Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-status-confirmed/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed Available</p>
                <p className="text-2xl font-semibold text-foreground">{filteredSummary.confirmed}</p>
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
                <p className="text-2xl font-semibold text-foreground">{filteredSummary.softCommitted}</p>
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
                <p className="text-2xl font-semibold text-foreground">{filteredSummary.forecast}</p>
                <p className="text-xs text-status-forecast">Planned availability</p>
              </div>
              <div className="w-10 h-10 bg-status-forecast/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-status-forecast" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply by Region */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Supply by Region</CardTitle>
            <Select defaultValue="all">
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
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border mb-3">
              <div className="text-xs font-medium text-muted-foreground">Region</div>
              <div className="text-xs font-medium text-status-confirmed text-center">Confirmed</div>
              <div className="text-xs font-medium text-status-soft-committed text-center">Soft Comm.</div>
              <div className="text-xs font-medium text-status-forecast text-center">Forecast</div>
            </div>
            <div className="space-y-2">
              {marketData.regions.map((region) => (
                <div key={region.name} className="grid grid-cols-4 gap-2 py-2 border-b border-border/50 last:border-0 items-center">
                  <div className="text-sm font-medium text-foreground">{region.name}</div>
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
                {marketData.regions.reduce((sum, r) => sum + r.confirmed, 0)}
              </div>
              <div className="text-sm text-center font-semibold text-foreground">
                {marketData.regions.reduce((sum, r) => sum + r.softCommitted, 0)}
              </div>
              <div className="text-sm text-center font-semibold text-muted-foreground">
                {marketData.regions.reduce((sum, r) => sum + r.forecast, 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Batches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Upcoming Batches</CardTitle>
              {isFiltered && (
                <span className="text-xs text-muted-foreground">{filteredBatches.length} matching</span>
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

            <div className="space-y-3">
              {filteredBatches.length > 0 ? (
                filteredBatches.map((batch, idx) => (
                  <div key={idx} className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                          <span className="text-sm font-medium text-foreground">{batch.grade}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{batch.batchId}</p>
                          <p className="text-xs text-muted-foreground">{batch.region} • {batch.heads} heads</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={batch.status} />
                        <p className="text-xs text-muted-foreground mt-1">{batch.date}</p>
                      </div>
                    </div>
                    {/* Show criteria match info */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{batch.breed}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{batch.gender}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{batch.ageRange} mo</span>
                      <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{batch.weightRange} kg</span>
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
