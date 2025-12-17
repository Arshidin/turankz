import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Trash2, Plus, TrendingUp, TrendingDown, AlertCircle, Clock, ArrowRight, Database } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CriteriaFilter, defaultCriteriaFilters, hasActiveFilters, type CriteriaFilterState } from '@/components/livestock';
import { useMarketBatches, batchMatchesCriteria, aggregateByRegion, calculateMarketSummary } from '@/hooks/useMarketData';

interface WatchlistItem {
  id: string;
  region: string;
  targetMonth: string;
  targetWeek: string;
  totalHeads: number;
  confirmed: number;
  softCommitted: number;
  forecast: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  changesSinceLastVisit: {
    volumeChange: number;
    newSoftCommitted: number;
  };
  isApproachingWindow: boolean;
  addedOn: string;
  // Criteria data for filtering
  breeds: string[];
  genders: string[];
  avgAgeMin: number;
  avgAgeMax: number;
  avgWeightMin: number;
  avgWeightMax: number;
}

const watchlistItems: WatchlistItem[] = [
  {
    id: '1',
    region: 'Almaty',
    targetMonth: 'January 2025',
    targetWeek: 'Week 1',
    totalHeads: 145,
    confirmed: 45,
    softCommitted: 62,
    forecast: 38,
    gradeA: 89,
    gradeB: 41,
    gradeC: 15,
    changesSinceLastVisit: { volumeChange: 12, newSoftCommitted: 3 },
    isApproachingWindow: true,
    addedOn: 'Dec 15',
    breeds: ['Angus', 'Hereford', 'Kazakh Whiteheaded'],
    genders: ['Male', 'Mixed'],
    avgAgeMin: 12,
    avgAgeMax: 18,
    avgWeightMin: 300,
    avgWeightMax: 380,
  },
  {
    id: '2',
    region: 'Akmola',
    targetMonth: 'January 2025',
    targetWeek: 'Week 2',
    totalHeads: 98,
    confirmed: 28,
    softCommitted: 45,
    forecast: 25,
    gradeA: 52,
    gradeB: 31,
    gradeC: 15,
    changesSinceLastVisit: { volumeChange: -8, newSoftCommitted: 0 },
    isApproachingWindow: false,
    addedOn: 'Dec 14',
    breeds: ['Simmental', 'Mixed/Crossbred'],
    genders: ['Male'],
    avgAgeMin: 14,
    avgAgeMax: 20,
    avgWeightMin: 320,
    avgWeightMax: 400,
  },
  {
    id: '3',
    region: 'Karaganda',
    targetMonth: 'January 2025',
    targetWeek: 'Week 1',
    totalHeads: 72,
    confirmed: 15,
    softCommitted: 32,
    forecast: 25,
    gradeA: 38,
    gradeB: 24,
    gradeC: 10,
    changesSinceLastVisit: { volumeChange: 5, newSoftCommitted: 2 },
    isApproachingWindow: true,
    addedOn: 'Dec 12',
    breeds: ['Hereford', 'Angus'],
    genders: ['Male'],
    avgAgeMin: 13,
    avgAgeMax: 17,
    avgWeightMin: 310,
    avgWeightMax: 370,
  },
  {
    id: '4',
    region: 'East KZ',
    targetMonth: 'February 2025',
    targetWeek: 'Week 1',
    totalHeads: 56,
    confirmed: 0,
    softCommitted: 18,
    forecast: 38,
    gradeA: 28,
    gradeB: 20,
    gradeC: 8,
    changesSinceLastVisit: { volumeChange: 0, newSoftCommitted: 0 },
    isApproachingWindow: false,
    addedOn: 'Dec 10',
    breeds: ['Kazakh Whiteheaded', 'Auliekol'],
    genders: ['Male', 'Female'],
    avgAgeMin: 15,
    avgAgeMax: 22,
    avgWeightMin: 280,
    avgWeightMax: 350,
  },
];

// Helper to check if watchlist item matches filter criteria
function itemMatchesFilter(item: WatchlistItem, filters: CriteriaFilterState): boolean {
  // Breed filter - at least one breed should match
  if (filters.breeds.length > 0 && !filters.breeds.some(b => item.breeds.includes(b))) {
    return false;
  }
  
  // Gender filter
  if (filters.genders.length > 0 && !filters.genders.some(g => item.genders.includes(g))) {
    return false;
  }
  
  // Age filter - check for overlap
  if (filters.ageMin !== null && item.avgAgeMax < filters.ageMin) {
    return false;
  }
  if (filters.ageMax !== null && item.avgAgeMin > filters.ageMax) {
    return false;
  }
  
  // Weight filter - check for overlap
  if (filters.weightMin !== null && item.avgWeightMax < filters.weightMin) {
    return false;
  }
  if (filters.weightMax !== null && item.avgWeightMin > filters.weightMax) {
    return false;
  }
  
  return true;
}

function ReadinessBar({ confirmed, softCommitted, forecast, total }: { confirmed: number; softCommitted: number; forecast: number; total: number }) {
  const confirmedPct = (confirmed / total) * 100;
  const softPct = (softCommitted / total) * 100;
  const forecastPct = (forecast / total) * 100;

  return (
    <div className="w-full">
      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
        <div className="bg-emerald-500" style={{ width: `${confirmedPct}%` }} />
        <div className="bg-amber-500" style={{ width: `${softPct}%` }} />
        <div className="bg-slate-400" style={{ width: `${forecastPct}%` }} />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {confirmed} confirmed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {softCommitted} soft
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          {forecast} forecast
        </span>
      </div>
    </div>
  );
}

function ChangeIndicator({ change }: { change: number }) {
  if (change === 0) return null;
  
  const isPositive = change > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}{change}
    </span>
  );
}

function WatchlistCard({ item }: { item: WatchlistItem }) {
  const hasChanges = item.changesSinceLastVisit.volumeChange !== 0 || item.changesSinceLastVisit.newSoftCommitted > 0;

  return (
    <Card className={`${item.isApproachingWindow ? 'ring-1 ring-amber-400 bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{item.region}</h3>
            <Badge variant="outline" className="text-xs">{item.targetWeek}</Badge>
            {item.isApproachingWindow && (
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Clock className="w-3 h-3 mr-1" />
                Approaching Window
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">{item.totalHeads}</span>
              <span className="text-sm text-muted-foreground">heads</span>
              <ChangeIndicator change={item.changesSinceLastVisit.volumeChange} />
            </div>
            {item.changesSinceLastVisit.newSoftCommitted > 0 && (
              <p className="text-xs text-emerald-600 mt-0.5">
                +{item.changesSinceLastVisit.newSoftCommitted} new soft committed
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-sm">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-xs">
                A: {item.gradeA}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-xs">
                B: {item.gradeB}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-xs">
                C: {item.gradeC}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Added {item.addedOn}</p>
          </div>
        </div>

        {/* Criteria summary */}
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{item.breeds.slice(0, 2).join(', ')}{item.breeds.length > 2 ? ` +${item.breeds.length - 2}` : ''}</span>
          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{item.genders.join('/')}</span>
          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{item.avgAgeMin}–{item.avgAgeMax} mo</span>
          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{item.avgWeightMin}–{item.avgWeightMax} kg</span>
        </div>

        <ReadinessBar 
          confirmed={item.confirmed}
          softCommitted={item.softCommitted}
          forecast={item.forecast}
          total={item.totalHeads}
        />

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1">
            Express Interest
          </Button>
          <Button size="sm" className="flex-1">
            <Plus className="w-3 h-3 mr-1" />
            Create Pool Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Watchlist() {
  const [criteriaFilters, setCriteriaFilters] = useState<CriteriaFilterState>(defaultCriteriaFilters);
  const isFiltered = hasActiveFilters(criteriaFilters);
  
  // Fetch real batch data
  const { data: realBatches, isLoading: batchesLoading } = useMarketBatches();
  const hasRealData = (realBatches?.length || 0) > 0;
  
  // Filter watchlist items based on criteria (using mock data for watchlist structure)
  // In production, this would be a saved watchlist in the database
  const filteredItems = isFiltered
    ? watchlistItems.filter(item => itemMatchesFilter(item, criteriaFilters))
    : watchlistItems;
  
  // If we have real batch data, calculate real statistics for regions that match watchlist items
  const enhancedItems = useMemo(() => {
    if (!hasRealData || !realBatches) return filteredItems;
    
    // Filter real batches by criteria
    const filteredRealBatches = realBatches.filter(batch => batchMatchesCriteria(batch, criteriaFilters));
    const regionData = aggregateByRegion(filteredRealBatches);
    
    return filteredItems.map(item => {
      const realRegion = regionData.find(r => r.region.toLowerCase().includes(item.region.toLowerCase()));
      if (realRegion) {
        return {
          ...item,
          totalHeads: realRegion.total,
          confirmed: realRegion.confirmed,
          softCommitted: realRegion.softCommitted,
          forecast: realRegion.forecast,
        };
      }
      return item;
    });
  }, [filteredItems, realBatches, hasRealData, criteriaFilters]);
  
  const groupedByMonth = enhancedItems.reduce((acc, item) => {
    if (!acc[item.targetMonth]) {
      acc[item.targetMonth] = [];
    }
    acc[item.targetMonth].push(item);
    return acc;
  }, {} as Record<string, WatchlistItem[]>);

  const totalWatched = enhancedItems.length;
  const totalHeads = enhancedItems.reduce((sum, item) => sum + item.totalHeads, 0);
  const approachingWindow = enhancedItems.filter(item => item.isApproachingWindow).length;
  const itemsWithChanges = enhancedItems.filter(
    item => item.changesSinceLastVisit.volumeChange !== 0 || item.changesSinceLastVisit.newSoftCommitted > 0
  ).length;

  return (
    <MainLayout>
      <PageHeader 
        title="Watchlist" 
        description="Monitor regions and batches for potential inclusion in Purchase Pools" 
      />

      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <span className="font-medium">Next Matching Window:</span>{' '}
            <span className="text-foreground">December 28, 2024</span>
            <span className="text-muted-foreground ml-2">• 11 days remaining</span>
          </div>
          <span className="text-xs text-muted-foreground">Review watchlist items before this date</span>
        </AlertDescription>
      </Alert>

      {/* Criteria Filter */}
      <div className="mb-6">
        <CriteriaFilter filters={criteriaFilters} onFiltersChange={setCriteriaFilters} />
        {isFiltered && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing {enhancedItems.length} of {watchlistItems.length} watched items matching your criteria.
          </p>
        )}
        {hasRealData && (
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <Database className="w-3 h-3" />
            Supply data updated from live farmer declarations.
          </p>
        )}
        {!hasRealData && (
          <p className="text-xs text-amber-600 mt-2">
            Displaying sample data. Real supply data will appear when farmers declare batches.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{totalWatched}</p>
                <p className="text-sm text-muted-foreground">Watched Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-2xl font-semibold text-foreground">{totalHeads}</p>
              <p className="text-sm text-muted-foreground">Total Heads Monitored</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-2xl font-semibold text-amber-600">{approachingWindow}</p>
                <p className="text-sm text-muted-foreground">Approaching Window</p>
              </div>
              {approachingWindow > 0 && <AlertCircle className="w-5 h-5 text-amber-500" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-2xl font-semibold text-emerald-600">{itemsWithChanges}</p>
              <p className="text-sm text-muted-foreground">Items with Changes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {Object.entries(groupedByMonth).map(([month, items]) => (
        <div key={month} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-foreground">{month}</h2>
            <Badge variant="secondary">{items.length} items</Badge>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {items.reduce((sum, item) => sum + item.totalHeads, 0)} heads total
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((item) => (
              <WatchlistCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}

      {enhancedItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bookmark className="w-10 h-10 text-muted-foreground/60" />
            </div>
            {isFiltered ? (
              <>
                <p className="font-medium text-foreground mb-1">No items match your criteria.</p>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Try adjusting your filter criteria to see more watchlist items.
                </p>
                <Button variant="outline" onClick={() => setCriteriaFilters(defaultCriteriaFilters)}>
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p className="font-medium text-foreground mb-1">Your watchlist is empty.</p>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Monitor supply by region and month to track availability before requesting.
                </p>
                <Button>
                  Add Regions to Watch
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
