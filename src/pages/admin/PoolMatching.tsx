import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  usePoolRequests, 
  useUpdatePoolRequest, 
  useAvailableBatchesForMatching,
  useCreatePoolMatch,
  PoolRequest,
  PoolRequestStatus
} from '@/hooks/usePoolRequests';
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
  ArrowRight,
  Loader2
} from 'lucide-react';

type PoolHealth = 'on-track' | 'at-risk' | 'not-viable';

interface SupplyBlock {
  id: string;
  batchRef: string;
  region: string;
  readiness: 'confirmed' | 'soft_committed' | 'forecast';
  grade: string;
  heads: number;
}

const getStatusBadge = (status: PoolRequestStatus) => {
  switch (status) {
    case 'fulfilled':
      return <Badge className="bg-status-confirmed-bg text-status-confirmed border-0">Fulfilled</Badge>;
    case 'partial':
      return <Badge className="bg-status-soft-bg text-status-soft border-0">Partial</Badge>;
    case 'pending':
      return <Badge className="bg-status-forecast-bg text-status-forecast border-0">Pending</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
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
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());

  const { data: requests, isLoading: requestsLoading } = usePoolRequests();
  const { data: batches, isLoading: batchesLoading } = useAvailableBatchesForMatching();
  const updateRequest = useUpdatePoolRequest();
  const createMatch = useCreatePoolMatch();

  const activeRequest = requests?.find(r => r.id === activeRequestId);

  // Transform batches to supply blocks
  const supplyBlocks: SupplyBlock[] = useMemo(() => {
    if (!batches) return [];
    return batches.map(b => ({
      id: b.id,
      batchRef: b.batch_number,
      region: b.region,
      readiness: b.status as 'confirmed' | 'soft_committed' | 'forecast',
      grade: b.grade,
      heads: b.heads,
    }));
  }, [batches]);

  // Filter supply based on active request
  const filteredSupply = useMemo(() => {
    if (!activeRequest) return [];
    return supplyBlocks.filter(s => {
      const gradeMatch = activeRequest.required_grade === 'A/B' 
        ? ['A', 'B'].includes(s.grade)
        : s.grade === activeRequest.required_grade;
      const regionMatch = activeRequest.regions.includes('Any') || activeRequest.regions.includes(s.region);
      return gradeMatch && regionMatch;
    });
  }, [activeRequest, supplyBlocks]);

  const selectedSupply = filteredSupply.filter(s => selectedBatchIds.has(s.id));
  const selectedHeads = selectedSupply.reduce((sum, s) => sum + s.heads, 0);
  const totalMatchedVolume = activeRequest ? activeRequest.matched_volume + selectedHeads : 0;
  const remainingVolume = activeRequest ? Math.max(0, activeRequest.required_volume - totalMatchedVolume) : 0;
  const fillPercentage = activeRequest ? Math.min(100, (totalMatchedVolume / activeRequest.required_volume) * 100) : 0;

  // Calculate readiness mix
  const readinessMix = {
    confirmed: selectedSupply.filter(s => s.readiness === 'confirmed').reduce((sum, s) => sum + s.heads, 0),
    soft: selectedSupply.filter(s => s.readiness === 'soft_committed').reduce((sum, s) => sum + s.heads, 0),
    forecast: selectedSupply.filter(s => s.readiness === 'forecast').reduce((sum, s) => sum + s.heads, 0),
  };

  // Determine pool health
  const getPoolHealth = (): PoolHealth => {
    if (selectedHeads === 0) return 'not-viable';
    const forecastRatio = readinessMix.forecast / selectedHeads;
    if (fillPercentage >= 90 && forecastRatio < 0.3) return 'on-track';
    if (fillPercentage >= 50) return 'at-risk';
    return 'not-viable';
  };

  const toggleSupplySelection = (id: string) => {
    setSelectedBatchIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedBatchIds(new Set(filteredSupply.map(s => s.id)));
  };

  const clearSelection = () => {
    setSelectedBatchIds(new Set());
  };

  const handleSelectRequest = (id: string) => {
    setActiveRequestId(id);
    clearSelection();
  };

  const handleProposeMatch = async () => {
    if (!activeRequest || selectedSupply.length === 0) return;

    const matches = selectedSupply.map(s => ({
      request_id: activeRequest.id,
      batch_id: s.id,
      heads_matched: s.heads,
      status: 'proposed',
    }));

    await createMatch.mutateAsync(matches);
    
    // Update the request's matched volume
    const newMatchedVolume = activeRequest.matched_volume + selectedHeads;
    const newStatus: PoolRequestStatus = newMatchedVolume >= activeRequest.required_volume ? 'fulfilled' : 'partial';
    
    await updateRequest.mutateAsync({
      id: activeRequest.id,
      matched_volume: newMatchedVolume,
      status: newStatus,
    });

    clearSelection();
  };

  const handleMarkFulfilled = async () => {
    if (!activeRequest) return;
    await updateRequest.mutateAsync({
      id: activeRequest.id,
      status: 'fulfilled',
    });
  };

  const handleReopen = async () => {
    if (!activeRequest) return;
    await updateRequest.mutateAsync({
      id: activeRequest.id,
      status: activeRequest.matched_volume > 0 ? 'partial' : 'pending',
    });
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
              {requestsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : requests?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="font-medium text-foreground mb-1">No active pool requests.</p>
                  <p className="text-sm text-muted-foreground">
                    Pool requests appear once MPKs submit demand.
                  </p>
                </div>
              ) : (
                requests?.map(request => {
                  const fillRate = Math.round((request.matched_volume / request.required_volume) * 100);
                  const isActive = request.id === activeRequestId;
                  
                  return (
                    <div
                      key={request.id}
                      onClick={() => handleSelectRequest(request.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{request.request_number}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p><span className="text-foreground">{request.mpk_name}</span> · {request.target_week}</p>
                        <p>{request.required_volume} heads · Grade {request.required_grade}</p>
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
                })
              )}
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
                  Filtered for {activeRequest.request_number}: Grade {activeRequest.required_grade} · {activeRequest.regions.join(', ')}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {batchesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !activeRequest ? (
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
                        selectedBatchIds.has(block.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedBatchIds.has(block.id)}
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
                      <span className="text-sm font-medium text-foreground">{activeRequest.required_volume} heads</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Previously Matched</span>
                      <span className="text-sm text-foreground">{activeRequest.matched_volume} heads</span>
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
                      disabled={selectedHeads === 0 || createMatch.isPending}
                      onClick={handleProposeMatch}
                    >
                      {createMatch.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Propose Match
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Settings2 className="w-4 h-4 mr-1" />
                        Adjust Request
                      </Button>
                      {activeRequest.status === 'partial' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleMarkFulfilled}
                          disabled={updateRequest.isPending}
                        >
                          <CheckCheck className="w-4 h-4 mr-1" />
                          Mark Fulfilled
                        </Button>
                      )}
                      {activeRequest.status === 'fulfilled' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleReopen}
                          disabled={updateRequest.isPending}
                        >
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
