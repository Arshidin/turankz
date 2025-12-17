import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Trash2, Plus, TrendingUp, TrendingDown, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  },
];

const groupedByMonth = watchlistItems.reduce((acc, item) => {
  if (!acc[item.targetMonth]) {
    acc[item.targetMonth] = [];
  }
  acc[item.targetMonth].push(item);
  return acc;
}, {} as Record<string, WatchlistItem[]>);

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

        <div className="grid grid-cols-2 gap-4 mb-4">
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
  const totalWatched = watchlistItems.length;
  const totalHeads = watchlistItems.reduce((sum, item) => sum + item.totalHeads, 0);
  const approachingWindow = watchlistItems.filter(item => item.isApproachingWindow).length;
  const itemsWithChanges = watchlistItems.filter(
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

      {watchlistItems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No items in watchlist</h3>
            <p className="text-muted-foreground mb-4">
              Add regions or batches from Market Overview to monitor availability
            </p>
            <Button>
              Go to Market Overview
            </Button>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
