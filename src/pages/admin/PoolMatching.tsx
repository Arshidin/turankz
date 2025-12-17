import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Send,
  Settings2,
  CheckCheck,
  RotateCcw,
  ArrowRight
} from 'lucide-react';

type RequestStatus = 'pending' | 'partial' | 'fulfilled';
type PoolHealth = 'on-track' | 'at-risk' | 'not-viable';

interface PurchaseRequest {
  id: string;
  mpk: string;
  targetWeek: string;
  requiredVolume: number;
  requiredGrade: string;
  regions: string[];
  matchedVolume: number;
  status: RequestStatus;
}

interface SupplyBlock {
  id: string;
  batchRef: string;
  region: string;
  readiness: 'confirmed' | 'soft_committed' | 'forecast';
  grade: string;
  heads: number;
  selected: boolean;
}

const purchaseRequests: PurchaseRequest[] = [
  { id: 'REQ-091', mpk: 'MPK-04', targetWeek: 'W52', requiredVolume: 80, requiredGrade: 'A', regions: ['Almaty', 'Akmola'], matchedVolume: 45, status: 'partial' },
  { id: 'REQ-090', mpk: 'MPK-02', targetWeek: 'W52', requiredVolume: 120, requiredGrade: 'A/B', regions: ['Any'], matchedVolume: 0, status: 'pending' },
  { id: 'REQ-089', mpk: 'MPK-01', targetWeek: 'W51', requiredVolume: 60, requiredGrade: 'B', regions: ['Karaganda'], matchedVolume: 60, status: 'fulfilled' },
  { id: 'REQ-088', mpk: 'MPK-03', targetWeek: 'W52', requiredVolume: 45, requiredGrade: 'A', regions: ['East Kazakhstan'], matchedVolume: 20, status: 'partial' },
];

const supplyBlocks: SupplyBlock[] = [
  { id: '1', batchRef: 'BLK-2851', region: 'Almaty', readiness: 'confirmed', grade: 'A', heads: 25, selected: false },
  { id: '2', batchRef: 'BLK-2852', region: 'Akmola', readiness: 'confirmed', grade: 'A', heads: 18, selected: false },
  { id: '3', batchRef: 'BLK-2853', region: 'Almaty', readiness: 'soft_committed', grade: 'A', heads: 32, selected: false },
  { id: '4', batchRef: 'BLK-2854', region: 'Karaganda', readiness: 'soft_committed', grade: 'B', heads: 28, selected: false },
  { id: '5', batchRef: 'BLK-2855', region: 'Akmola', readiness: 'forecast', grade: 'A', heads: 40, selected: false },
  { id: '6', batchRef: 'BLK-2856', region: 'East Kazakhstan', readiness: 'confirmed', grade: 'A', heads: 15, selected: false },
  { id: '7', batchRef: 'BLK-2857', region: 'Almaty', readiness: 'forecast', grade: 'B', heads: 22, selected: false },
];

const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case 'fulfilled':
      return <Badge className="bg-status-confirmed-bg text-status-confirmed border-0">Fulfilled</Badge>;
    case 'partial':
      return <Badge className="bg-status-soft-bg text-status-soft border-0">Partial</Badge>;
    case 'pending':
      return <Badge className="bg-status-forecast-bg text-status-forecast border-0">Pending</Badge>;
  }
};

const getReadinessBadge = (readiness: string) => {
  switch (readiness) {
    case 'confirmed':
      return <Badge variant="outline" className="text-status-confirmed border-status-confirmed text-xs">Confirmed</Badge>;
    case 'soft_committed':
      return <Badge variant="outline" className="text-status-soft border-status-soft text-xs">Soft</Badge>;
    case 'forecast':
      return <Badge variant="outline" className="text-status-forecast border-status-forecast text-xs">Forecast</Badge>;
  }
};

const getPoolHealthIndicator = (health: PoolHealth) => {
  switch (health) {
    case 'on-track':
      return (
        <div className="flex items-center gap-2 text-status-confirmed">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">On Track</span>
        </div>
      );
    case 'at-risk':
      return (
        <div className="flex items-center gap-2 text-status-soft">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">At Risk</span>
        </div>
      );
    case 'not-viable':
      return (
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">Not Viable</span>
        </div>
      );
  }
};

export default function PoolMatching() {
  const [activeRequestId, setActiveRequestId] = useState<string | null>('REQ-091');
  const [supply, setSupply] = useState<SupplyBlock[]>(supplyBlocks);

  const activeRequest = purchaseRequests.find(r => r.id === activeRequestId);

  // Filter supply based on active request
  const filteredSupply = activeRequest 
    ? supply.filter(s => {
        const gradeMatch = activeRequest.requiredGrade === 'A/B' 
          ? ['A', 'B'].includes(s.grade)
          : s.grade === activeRequest.requiredGrade;
        const regionMatch = activeRequest.regions.includes('Any') || activeRequest.regions.includes(s.region);
        return gradeMatch && regionMatch;
      })
    : [];

  const selectedSupply = filteredSupply.filter(s => s.selected);
  const selectedHeads = selectedSupply.reduce((sum, s) => sum + s.heads, 0);
  const totalMatchedVolume = activeRequest ? activeRequest.matchedVolume + selectedHeads : 0;
  const remainingVolume = activeRequest ? Math.max(0, activeRequest.requiredVolume - totalMatchedVolume) : 0;
  const fillPercentage = activeRequest ? Math.min(100, (totalMatchedVolume / activeRequest.requiredVolume) * 100) : 0;

  // Calculate readiness mix
  const readinessMix = {
    confirmed: selectedSupply.filter(s => s.readiness === 'confirmed').reduce((sum, s) => sum + s.heads, 0),
    soft: selectedSupply.filter(s => s.readiness === 'soft_committed').reduce((sum, s) => sum + s.heads, 0),
    forecast: selectedSupply.filter(s => s.readiness === 'forecast').reduce((sum, s) => sum + s.heads, 0),
  };

  // Determine pool health
  const getPoolHealth = (): PoolHealth => {
    if (fillPercentage >= 90 && readinessMix.forecast / selectedHeads < 0.3) return 'on-track';
    if (fillPercentage >= 50) return 'at-risk';
    return 'not-viable';
  };

  const toggleSupplySelection = (id: string) => {
    setSupply(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const selectAllFiltered = () => {
    const filteredIds = new Set(filteredSupply.map(s => s.id));
    setSupply(prev => prev.map(s => filteredIds.has(s.id) ? { ...s, selected: true } : s));
  };

  const clearSelection = () => {
    setSupply(prev => prev.map(s => ({ ...s, selected: false })));
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Pool Matching" 
        description="Coordinate supply and demand to form matched pools" 
      />

      {/* Timing Context Banner */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Next Matching Window: Dec 18–19</p>
                <p className="text-xs text-muted-foreground">Matching decisions should be finalized before the start of the target week.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-foreground">W52</p>
              <p className="text-xs text-muted-foreground">Current Target Week</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel: Active Purchase Requests */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Purchase Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {purchaseRequests.map(request => {
                const fillRate = Math.round((request.matchedVolume / request.requiredVolume) * 100);
                const isActive = request.id === activeRequestId;
                
                return (
                  <div
                    key={request.id}
                    onClick={() => { setActiveRequestId(request.id); clearSelection(); }}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{request.id}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p><span className="text-foreground">{request.mpk}</span> · {request.targetWeek}</p>
                      <p>{request.requiredVolume} heads · Grade {request.requiredGrade}</p>
                      <p className="text-xs">{request.regions.join(', ')}</p>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Fill Rate</span>
                        <span className={fillRate >= 80 ? 'text-status-confirmed' : fillRate >= 50 ? 'text-status-soft' : 'text-status-forecast'}>
                          {fillRate}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            fillRate >= 80 ? 'bg-status-confirmed' : fillRate >= 50 ? 'bg-status-soft' : 'bg-status-forecast'
                          }`}
                          style={{ width: `${fillRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Center Panel: Available Supply Pool */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Available Supply Pool</CardTitle>
                {activeRequest && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAllFiltered} className="text-xs h-7">
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs h-7">
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              {activeRequest && (
                <p className="text-xs text-muted-foreground mt-1">
                  Filtered for {activeRequest.id}: Grade {activeRequest.requiredGrade} · {activeRequest.regions.join(', ')}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {!activeRequest ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Target className="w-10 h-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Select a purchase request to view matching supply</p>
                </div>
              ) : filteredSupply.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="w-10 h-10 text-status-forecast/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No matching supply available for this request</p>
                  <p className="text-xs text-muted-foreground mt-1">Consider adjusting region or grade requirements</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSupply.map(block => (
                    <div 
                      key={block.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        block.selected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={block.selected}
                          onCheckedChange={() => toggleSupplySelection(block.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{block.batchRef}</span>
                            {getReadinessBadge(block.readiness)}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{block.region}</span>
                            <span>·</span>
                            <span>Grade {block.grade}</span>
                            <span>·</span>
                            <span className="font-medium text-foreground">{block.heads} heads</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Matching Summary */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Matching Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {!activeRequest ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ArrowRight className="w-10 h-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Select a request to begin matching</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pool Health Status */}
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    {selectedHeads > 0 ? getPoolHealthIndicator(getPoolHealth()) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="w-5 h-5" />
                        <span className="font-medium">No Selection</span>
                      </div>
                    )}
                  </div>

                  {/* Volume Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Target Volume</span>
                      <span className="text-sm font-medium text-foreground">{activeRequest.requiredVolume} heads</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Previously Matched</span>
                      <span className="text-sm text-foreground">{activeRequest.matchedVolume} heads</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">New Selection</span>
                      <span className="text-sm font-medium text-primary">{selectedHeads > 0 ? `+${selectedHeads}` : '0'} heads</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">Total Matched</span>
                      <span className="text-lg font-semibold text-foreground">{totalMatchedVolume} heads</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Remaining to Fill</span>
                      <span className={`text-sm font-medium ${remainingVolume === 0 ? 'text-status-confirmed' : 'text-status-forecast'}`}>
                        {remainingVolume} heads
                      </span>
                    </div>
                  </div>

                  {/* Fill Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Fill Progress</span>
                      <span className="font-medium text-foreground">{Math.round(fillPercentage)}%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          fillPercentage >= 90 ? 'bg-status-confirmed' : fillPercentage >= 50 ? 'bg-status-soft' : 'bg-status-forecast'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Readiness Mix */}
                  {selectedHeads > 0 && (
                    <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Readiness Mix (New Selection)</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-semibold text-status-confirmed">{readinessMix.confirmed}</p>
                          <p className="text-xs text-muted-foreground">Confirmed</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-status-soft">{readinessMix.soft}</p>
                          <p className="text-xs text-muted-foreground">Soft</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-status-forecast">{readinessMix.forecast}</p>
                          <p className="text-xs text-muted-foreground">Forecast</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      disabled={selectedHeads === 0}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Propose Match
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Settings2 className="w-4 h-4 mr-1" />
                        Adjust Request
                      </Button>
                      {activeRequest.status === 'partial' && (
                        <Button variant="outline" size="sm">
                          <CheckCheck className="w-4 h-4 mr-1" />
                          Mark Fulfilled
                        </Button>
                      )}
                      {activeRequest.status === 'fulfilled' && (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
