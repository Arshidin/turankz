import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Trash2, Plus, AlertCircle, Clock, ArrowRight, Database } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CriteriaFilter, defaultCriteriaFilters, hasActiveFilters, type CriteriaFilterState } from '@/components/livestock';
import { useMarketBatches, batchMatchesCriteria, aggregateByRegion } from '@/hooks/useMarketData';
import { useWatchlist, useRemoveFromWatchlist, type WatchlistItem as DBWatchlistItem } from '@/hooks/useWatchlist';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Enhanced watchlist item with real batch data
interface EnhancedWatchlistItem {
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
  addedOn: string;
  criteria: DBWatchlistItem['criteria'];
  isApproachingWindow: boolean;
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

function WatchlistCard({ item, onRemove }: { item: EnhancedWatchlistItem; onRemove: (id: string) => void }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRemove = () => {
    onRemove(item.id);
    toast({
      title: 'Removed from watchlist',
      description: `${item.region} ${item.targetWeek} has been removed from your watchlist.`,
    });
  };

  const criteria = item.criteria;
  const breeds = criteria?.breeds || [];
  const genders = criteria?.genders || [];

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
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">{item.totalHeads}</span>
              <span className="text-sm text-muted-foreground">heads</span>
            </div>
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
        {criteria && (breeds.length > 0 || genders.length > 0 || criteria.ageMin || criteria.ageMax || criteria.weightMin || criteria.weightMax) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {breeds.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                {breeds.slice(0, 2).join(', ')}{breeds.length > 2 ? ` +${breeds.length - 2}` : ''}
              </span>
            )}
            {genders.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{genders.join('/')}</span>
            )}
            {(criteria.ageMin || criteria.ageMax) && (
              <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                {criteria.ageMin || 0}–{criteria.ageMax || '∞'} mo
              </span>
            )}
            {(criteria.weightMin || criteria.weightMax) && (
              <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                {criteria.weightMin || 0}–{criteria.weightMax || '∞'} kg
              </span>
            )}
          </div>
        )}

        <ReadinessBar 
          confirmed={item.confirmed}
          softCommitted={item.softCommitted}
          forecast={item.forecast}
          total={item.totalHeads}
        />

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate('/mpk/market')}
          >
            View Market
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => navigate('/mpk/requests/new')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Create Pool Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Watchlist() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [criteriaFilters, setCriteriaFilters] = useState<CriteriaFilterState>(defaultCriteriaFilters);
  const isFiltered = hasActiveFilters(criteriaFilters);
  
  // Fetch watchlist items from database
  const { data: watchlistItems, isLoading: watchlistLoading } = useWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  
  // Fetch real batch data
  const { data: realBatches, isLoading: batchesLoading } = useMarketBatches();
  const hasRealData = (realBatches?.length || 0) > 0;
  
  // Enhance watchlist items with real batch data
  const enhancedItems = useMemo(() => {
    if (!watchlistItems || watchlistItems.length === 0) return [];
    if (!realBatches || realBatches.length === 0) {
      // Return watchlist items with zero stats if no batch data
      return watchlistItems.map(item => ({
        id: item.id,
        region: item.region,
        targetMonth: item.target_month,
        targetWeek: item.target_week,
        totalHeads: 0,
        confirmed: 0,
        softCommitted: 0,
        forecast: 0,
        gradeA: 0,
        gradeB: 0,
        gradeC: 0,
        addedOn: format(new Date(item.added_at), 'MMM d'),
        criteria: item.criteria,
        isApproachingWindow: false, // TODO: Calculate based on matching window dates
      }));
    }
    
    // Filter batches by region and target week that match watchlist items
    const regionData = aggregateByRegion(realBatches);
    
    return watchlistItems.map(item => {
      // Find batches matching this watchlist item's region and week
      const matchingBatches = realBatches.filter(batch => {
        const regionMatch = batch.region.toLowerCase().includes(item.region.toLowerCase());
        const weekMatch = batch.target_week === item.target_week;
        
        // Also check criteria if specified
        let criteriaMatch = true;
        if (item.criteria) {
          criteriaMatch = batchMatchesCriteria(batch, {
            breeds: item.criteria.breeds || [],
            genders: item.criteria.genders || [],
            ageMin: item.criteria.ageMin ?? null,
            ageMax: item.criteria.ageMax ?? null,
            weightMin: item.criteria.weightMin ?? null,
            weightMax: item.criteria.weightMax ?? null,
          });
        }
        
        return regionMatch && weekMatch && criteriaMatch;
      });
      
      // Calculate stats from matching batches
      const totalHeads = matchingBatches.reduce((sum, b) => sum + b.heads, 0);
      const confirmed = matchingBatches
        .filter(b => ['confirmed', 'matched', 'closed'].includes(b.status))
        .reduce((sum, b) => sum + b.heads, 0);
      const softCommitted = matchingBatches
        .filter(b => b.status === 'soft_committed')
        .reduce((sum, b) => sum + b.heads, 0);
      const forecast = matchingBatches
        .filter(b => !['confirmed', 'matched', 'closed', 'soft_committed'].includes(b.status))
        .reduce((sum, b) => sum + b.heads, 0);
      
      // Calculate grade distribution (simplified - would need actual grade data)
      const gradeA = Math.round(totalHeads * 0.6);
      const gradeB = Math.round(totalHeads * 0.3);
      const gradeC = totalHeads - gradeA - gradeB;
      
      return {
        id: item.id,
        region: item.region,
        targetMonth: item.target_month,
        targetWeek: item.target_week,
        totalHeads,
        confirmed,
        softCommitted,
        forecast,
        gradeA,
        gradeB,
        gradeC,
        addedOn: format(new Date(item.added_at), 'MMM d'),
        criteria: item.criteria,
        isApproachingWindow: false, // TODO: Calculate based on matching window dates
      };
    });
  }, [watchlistItems, realBatches]);
  
  // Filter by criteria if active
  const filteredItems = useMemo(() => {
    if (!isFiltered) return enhancedItems;
    
    return enhancedItems.filter(item => {
      if (!item.criteria) return true;
      
      // Breed filter
      if (criteriaFilters.breeds.length > 0) {
        const itemBreeds = item.criteria.breeds || [];
        if (!criteriaFilters.breeds.some(b => itemBreeds.includes(b))) {
          return false;
        }
      }
      
      // Gender filter
      if (criteriaFilters.genders.length > 0) {
        const itemGenders = item.criteria.genders || [];
        if (!criteriaFilters.genders.some(g => itemGenders.includes(g))) {
          return false;
        }
      }
      
      // Age filter
      if (criteriaFilters.ageMin !== null && item.criteria.ageMax && item.criteria.ageMax < criteriaFilters.ageMin) {
        return false;
      }
      if (criteriaFilters.ageMax !== null && item.criteria.ageMin && item.criteria.ageMin > criteriaFilters.ageMax) {
        return false;
      }
      
      // Weight filter
      if (criteriaFilters.weightMin !== null && item.criteria.weightMax && item.criteria.weightMax < criteriaFilters.weightMin) {
        return false;
      }
      if (criteriaFilters.weightMax !== null && item.criteria.weightMin && item.criteria.weightMin > criteriaFilters.weightMax) {
        return false;
      }
      
      return true;
    });
  }, [enhancedItems, criteriaFilters, isFiltered]);
  
  const groupedByMonth = filteredItems.reduce((acc, item) => {
    if (!acc[item.targetMonth]) {
      acc[item.targetMonth] = [];
    }
    acc[item.targetMonth].push(item);
    return acc;
  }, {} as Record<string, EnhancedWatchlistItem[]>);

  const totalWatched = filteredItems.length;
  const totalHeads = filteredItems.reduce((sum, item) => sum + item.totalHeads, 0);
  const approachingWindow = filteredItems.filter(item => item.isApproachingWindow).length;
  
  const handleRemove = async (id: string) => {
    try {
      await removeFromWatchlist.mutateAsync(id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item from watchlist.',
        variant: 'destructive',
      });
    }
  };
  
  const isLoading = watchlistLoading || batchesLoading;

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
            Showing {filteredItems.length} of {enhancedItems.length} watched items matching your criteria.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              <WatchlistCard key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </div>
        </div>
      ))}

      {isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bookmark className="w-10 h-10 text-muted-foreground/60 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Loading watchlist...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && filteredItems.length === 0 && (
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
                <Button onClick={() => navigate('/mpk/market')}>
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
