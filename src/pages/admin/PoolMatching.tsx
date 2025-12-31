import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  usePoolRequests, 
  useUpdatePoolRequest, 
  useCreatePoolMatch,
  PoolRequest,
  PoolRequestStatus,
  getAcceptanceCriteria
} from '@/hooks/usePoolRequests';
import { useConfirmedBatches } from '@/hooks/useConfirmedBatches';
import { useBulkUpdateStandardStatus, useAutoCalculateStandardStatus, type StandardStatus } from '@/hooks/useAdminBatches';
import { useStandardPremiums, getPremiumByLevel } from '@/hooks/usePremiums';
import { PremiumBadge } from '@/components/premium';
import { checkBatchMatch, formatCriteriaDisplay, type MatchLevel } from '@/lib/livestock-criteria';
import { validateDeliveryPeriodOverlap } from '@/lib/matching-validation';
import { 
  calculateMatchingProgress,
  getMatchingProgressStatus,
  getProgressStatusStyle,
  getStatusFromProgress,
} from '@/lib/pool-request-lifecycle';
import { PoolRequestOverrideDialog } from '@/components/admin/PoolRequestOverrideDialog';
import { PoolRequestAuditHistory } from '@/components/admin/PoolRequestAuditHistory';
import { PoolRequestAdminOverrideBadge } from '@/components/admin/PoolRequestAdminOverrideBadge';
import { MatchingListPanel } from '@/components/admin/MatchingListPanel';
import { PoolRequestsListView } from '@/components/admin/PoolRequestsListView';
import { MatchingWindowLockBanner } from '@/components/admin/MatchingWindowLockBanner';
import { MatchingWorkspace } from '@/components/admin/MatchingWorkspace';
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
  Loader2,
  Filter,
  Award,
  Wand2,
  TrendingUp,
  ShieldAlert,
  MoreVertical,
  List,
  Edit,
  History,
  Link2,
  LayoutGrid
} from 'lucide-react';

type PoolHealth = 'on-track' | 'at-risk' | 'not-viable';

interface SupplyBlock {
  id: string;
  batchRef: string;
  region: string;
  readiness: 'confirmed' | 'soft_committed' | 'forecast';
  grade: string;
  heads: number;
  available_heads: number; // Available volume after existing matchings
  matched_heads: number; // Already matched volume
  target_week: string; // Target week for delivery
  delivery_period: 'short_term' | 'mid_term' | 'long_term' | null; // Delivery period
  // Livestock criteria
  breed: string | null;
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  weight_min: number | null;
  weight_max: number | null;
  // Standard status
  standard_status: string | null;
  // Computed match level
  matchLevel?: MatchLevel;
}

const getStatusBadge = (status: PoolRequestStatus) => {
  switch (status) {
    case 'fulfilled':
      return <Badge className="bg-status-confirmed-bg text-status-confirmed border-0">Fulfilled</Badge>;
    case 'partial':
      return <Badge className="bg-status-soft-bg text-status-soft border-0">Partial</Badge>;
    case 'submitted':
      return <Badge className="bg-blue-500/10 text-blue-600 border-0">Submitted</Badge>;
    case 'matching':
      return <Badge className="bg-violet-500/10 text-violet-600 border-0">Matching</Badge>;
    case 'draft':
      return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>;
    case 'closed':
      return <Badge className="bg-slate-500/10 text-slate-600 border-0">Closed</Badge>;
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

const getMatchBadge = (matchLevel: MatchLevel) => {
  switch (matchLevel) {
    case 'full':
      return <Badge className="bg-status-confirmed-bg text-status-confirmed border-0 text-xs">Full Match</Badge>;
    case 'partial':
      return <Badge className="bg-status-soft-bg text-status-soft border-0 text-xs">Partial Match</Badge>;
    case 'none':
      return <Badge variant="outline" className="text-muted-foreground text-xs">No Match</Badge>;
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
  const [showOnlyMatching, setShowOnlyMatching] = useState(false);
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [readinessFilter, setReadinessFilter] = useState<'all' | 'confirmed' | 'soft_committed' | 'forecast'>('all');
  const [overrideDialog, setOverrideDialog] = useState<{ 
    open: boolean; 
    request: PoolRequest | null;
    mode: 'edit' | 'status';
  }>({ open: false, request: null, mode: 'edit' });

  const { data: requests, isLoading: requestsLoading } = usePoolRequests();
  // Use useConfirmedBatches which calculates available_heads correctly
  const { data: confirmedBatches, isLoading: batchesLoading } = useConfirmedBatches();
  const { data: standardPremiums } = useStandardPremiums();
  const updateRequest = useUpdatePoolRequest();
  const createMatch = useCreatePoolMatch();
  const bulkUpdateStatus = useBulkUpdateStandardStatus();
  const autoCalculateStatus = useAutoCalculateStandardStatus();

  const activeRequest = requests?.find(r => r.id === activeRequestId);
  const activeCriteria = activeRequest ? getAcceptanceCriteria(activeRequest) : null;
  const criteriaDisplay = activeCriteria ? formatCriteriaDisplay(activeCriteria) : [];
  const hasCriteria = criteriaDisplay.length > 0;

  // Transform batches to supply blocks with match level
  // Include soft_committed and forecast batches (not just confirmed)
  const supplyBlocks: SupplyBlock[] = useMemo(() => {
    if (!confirmedBatches) return [];
    
    // We need to also fetch soft_committed and forecast batches
    // For now, use confirmed batches and extend with other statuses if needed
    return confirmedBatches.map(b => {
      const block: SupplyBlock = {
        id: b.id,
        batchRef: b.batch_number,
        region: b.region,
        readiness: b.status as 'confirmed' | 'soft_committed' | 'forecast',
        grade: b.grade,
        heads: b.heads,
        available_heads: b.available_heads, // Use calculated available volume
        matched_heads: b.matched_heads, // Already matched volume
        target_week: b.target_week,
        delivery_period: b.delivery_period,
        breed: b.breed,
        gender: b.gender,
        age_min: b.age_min,
        age_max: b.age_max,
        weight_min: b.weight_min,
        weight_max: b.weight_max,
        standard_status: b.standard_status || 'non_standard',
      };
      
      // Calculate match level if we have active criteria
      if (activeCriteria) {
        block.matchLevel = checkBatchMatch(
          { breed: b.breed, gender: b.gender, age_min: b.age_min, age_max: b.age_max, weight_min: b.weight_min, weight_max: b.weight_max },
          activeCriteria
        );
      }
      
      return block;
    });
  }, [confirmedBatches, activeCriteria]);

  // Filter supply based on active request
  const filteredSupply = useMemo(() => {
    if (!activeRequest) return [];
    let filtered = supplyBlocks.filter(s => {
      // Grade matching
      const gradeMatch = activeRequest.required_grade === 'A/B' 
        ? ['A', 'B'].includes(s.grade)
        : activeRequest.required_grade === 'B/C'
        ? ['B', 'C'].includes(s.grade)
        : activeRequest.required_grade === 'Any'
        ? true
        : s.grade === activeRequest.required_grade;
      
      // Region matching
      const regionMatch = activeRequest.regions.includes('Any') || activeRequest.regions.includes(s.region);
      
      // Delivery period matching
      const deliveryPeriodCheck = validateDeliveryPeriodOverlap(
        s.delivery_period,
        activeRequest.target_delivery_period
      );
      const deliveryPeriodMatch = deliveryPeriodCheck.compatible;
      
      // Target week matching (exact match or flexible if request doesn't specify)
      // For now, we'll show all batches but could add strict matching later
      const targetWeekMatch = true; // Could add strict matching: s.target_week === activeRequest.target_week
      
      return gradeMatch && regionMatch && deliveryPeriodMatch && targetWeekMatch;
    });

    // Filter by readiness (confirmed, soft_committed, forecast)
    if (readinessFilter !== 'all') {
      filtered = filtered.filter(s => s.readiness === readinessFilter);
    }

    // Optionally filter by criteria match
    if (showOnlyMatching && hasCriteria) {
      filtered = filtered.filter(s => s.matchLevel === 'full' || s.matchLevel === 'partial');
    }

    // Sort by match level (full first, then partial, then none)
    return filtered.sort((a, b) => {
      const order = { full: 0, partial: 1, none: 2 };
      return (order[a.matchLevel || 'none'] || 2) - (order[b.matchLevel || 'none'] || 2);
    });
  }, [activeRequest, supplyBlocks, showOnlyMatching, hasCriteria, readinessFilter]);

  const selectedSupply = useMemo(
    () => filteredSupply.filter(s => selectedBatchIds.has(s.id)),
    [filteredSupply, selectedBatchIds]
  );
  
  // Calculate selected heads using available_heads (not total heads)
  // This is the maximum we can match from selected batches
  const selectedHeadsMax = useMemo(() => {
    return selectedSupply.reduce((sum, s) => sum + s.available_heads, 0);
  }, [selectedSupply]);
  
  // Calculate actual selected heads respecting remaining_volume of the request
  const selectedHeads = useMemo(() => {
    if (!activeRequest) return 0;
    const remainingVolume = activeRequest.required_volume - activeRequest.matched_volume;
    // Don't exceed remaining volume
    return Math.min(selectedHeadsMax, remainingVolume);
  }, [selectedHeadsMax, activeRequest]);
  
  const totalMatchedVolume = activeRequest ? activeRequest.matched_volume + selectedHeads : 0;
  const remainingVolume = activeRequest ? Math.max(0, activeRequest.required_volume - totalMatchedVolume) : 0;
  const fillPercentage = activeRequest ? Math.min(100, (totalMatchedVolume / activeRequest.required_volume) * 100) : 0;
  
  // Validation: Check for issues before creating match
  const validationIssues = useMemo(() => {
    if (!activeRequest || selectedSupply.length === 0) return [];
    const issues: string[] = [];
    
    // Check for batches with no match (only if criteria exist)
    if (hasCriteria) {
      const noMatchBatches = selectedSupply.filter(s => s.matchLevel === 'none');
      if (noMatchBatches.length > 0) {
        issues.push(`${noMatchBatches.length} batch(es) have no match with acceptance criteria`);
      }
    }
    
    // Check for batches with no available volume
    const noAvailableBatches = selectedSupply.filter(s => s.available_heads <= 0);
    if (noAvailableBatches.length > 0) {
      issues.push(`${noAvailableBatches.length} batch(es) have no available volume`);
    }
    
    // Note: We don't warn about exceeding remaining volume as we'll automatically limit it
    
    return issues;
  }, [selectedSupply, activeRequest, hasCriteria]);

  // Count by match level
  const matchCounts = useMemo(() => {
    return {
      full: filteredSupply.filter(s => s.matchLevel === 'full').length,
      partial: filteredSupply.filter(s => s.matchLevel === 'partial').length,
      none: filteredSupply.filter(s => s.matchLevel === 'none').length,
    };
  }, [filteredSupply]);

  // Calculate readiness mix
  const readinessMix = useMemo(() => ({
    confirmed: selectedSupply.filter(s => s.readiness === 'confirmed').reduce((sum, s) => sum + s.heads, 0),
    soft: selectedSupply.filter(s => s.readiness === 'soft_committed').reduce((sum, s) => sum + s.heads, 0),
    forecast: selectedSupply.filter(s => s.readiness === 'forecast').reduce((sum, s) => sum + s.heads, 0),
  }), [selectedSupply]);

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

  const selectFullMatches = () => {
    setSelectedBatchIds(new Set(filteredSupply.filter(s => s.matchLevel === 'full').map(s => s.id)));
  };

  const clearSelection = () => {
    setSelectedBatchIds(new Set());
  };

  const handleSelectRequest = (id: string) => {
    setActiveRequestId(id);
    clearSelection();
  };

  const handleBulkStandardStatus = (status: StandardStatus) => {
    if (selectedBatchIds.size === 0) return;
    bulkUpdateStatus.mutate({
      batchIds: Array.from(selectedBatchIds),
      standardStatus: status,
    });
  };

  const handleAutoCalculate = () => {
    if (selectedBatchIds.size === 0 || !confirmedBatches) return;
    const selectedBatches = confirmedBatches.filter(b => selectedBatchIds.has(b.id)).map(b => ({
      id: b.id,
      breed: b.breed,
      gender: b.gender,
      age_min: b.age_min,
      age_max: b.age_max,
      weight_min: b.weight_min,
      weight_max: b.weight_max,
    }));
    autoCalculateStatus.mutate(selectedBatches);
  };

  const handleProposeMatch = async () => {
    if (!activeRequest || selectedSupply.length === 0) return;

    // Validate before creating match
    if (validationIssues.length > 0) {
      // Show validation errors - will be handled by UI warnings
      return;
    }

    // Calculate remaining volume for the request
    const requestRemainingVolume = activeRequest.required_volume - activeRequest.matched_volume;
    
    // Create matches, respecting both available_heads and remaining_volume
    const matches: Array<{ request_id: string; batch_id: string; heads_matched: number }> = [];
    let totalMatched = 0;
    
    for (const s of selectedSupply) {
      if (totalMatched >= requestRemainingVolume) break;
      
      // Use available_heads, but don't exceed remaining volume
      const headsToMatch = Math.min(
        s.available_heads,
        requestRemainingVolume - totalMatched
      );
      
      if (headsToMatch > 0) {
        matches.push({
          request_id: activeRequest.id,
          batch_id: s.id,
          heads_matched: headsToMatch,
        });
        totalMatched += headsToMatch;
      }
    }

    if (matches.length === 0) {
      // No valid matches to create
      return;
    }

    await createMatch.mutateAsync(matches);
    
    // Calculate new progress and determine appropriate status
    const newMatchedVolume = activeRequest.matched_volume + totalMatched;
    const newProgress = calculateMatchingProgress(activeRequest.required_volume, newMatchedVolume);
    const newStatus = getStatusFromProgress(newProgress);
    
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
      status: activeRequest.matched_volume > 0 ? 'partial' : 'matching',
    });
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Pool Matching" 
        description="Coordinate supply and demand to form matched pools" 
      />

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests" className="gap-2">
            <List className="h-4 w-4" />
            Pool Requests
          </TabsTrigger>
          <TabsTrigger value="workspace" className="gap-2">
            <Link2 className="h-4 w-4" />
            Matching Workspace
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Pool Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <PoolRequestsListView />
        </TabsContent>

        <TabsContent value="workspace">
          <MatchingWorkspace />
        </TabsContent>

        <TabsContent value="overview">
          {/* Matching Window Lock Status */}
          <div className="mb-6">
            <MatchingWindowLockBanner />
          </div>
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
                requests
                  ?.filter(request => request.status !== 'draft') // Don't show draft requests in matching
                  .map(request => {
                  const progress = calculateMatchingProgress(request.required_volume, request.matched_volume);
                  const progressStatus = getMatchingProgressStatus(progress);
                  const statusStyle = getProgressStatusStyle(progressStatus);
                  const isActive = request.id === activeRequestId;
                  const reqCriteria = getAcceptanceCriteria(request);
                  const hasCrit = formatCriteriaDisplay(reqCriteria).length > 0;
                  
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{request.request_number}</span>
                          {(request as any).admin_modified && (
                            <PoolRequestAdminOverrideBadge
                              isModified={true}
                              modifiedBy={(request as any).admin_modified_by}
                              modifiedAt={(request as any).admin_modified_at}
                              reason={(request as any).admin_modification_reason}
                              size="sm"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusBadge(request.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => setOverrideDialog({ 
                                open: true, 
                                request, 
                                mode: 'edit' 
                              })}>
                                <Edit className="h-3 w-3 mr-2" />
                                Override: Edit Fields
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setOverrideDialog({ 
                                open: true, 
                                request, 
                                mode: 'status' 
                              })}>
                                <ShieldAlert className="h-3 w-3 mr-2" />
                                Override: Change Status
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setActiveRequestId(request.id);
                                setShowAuditHistory(true);
                              }}>
                                <History className="h-3 w-3 mr-2" />
                                View Audit History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p><span className="text-foreground">{request.mpk_name}</span> · {request.target_week}</p>
                        <p>{request.required_volume} heads · Grade {request.required_grade}</p>
                        <p className="text-xs">{request.regions.join(', ')}</p>
                      </div>
                      {hasCrit && (
                        <div className="mt-2 flex items-center gap-1">
                          <Filter className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Has acceptance criteria</span>
                        </div>
                      )}
                      
                      {/* Enhanced Progress Display */}
                      <div className="mt-3 pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {progressStatus === 'fulfilled' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {progressStatus === 'near-complete' && <TrendingUp className="w-3 h-3 text-blue-600" />}
                            {progressStatus === 'partial' && <Clock className="w-3 h-3 text-amber-600" />}
                            {progressStatus === 'at-risk' && <AlertTriangle className="w-3 h-3 text-orange-600" />}
                            {progressStatus === 'not-started' && <Target className="w-3 h-3 text-muted-foreground" />}
                            <span className="text-xs text-muted-foreground">
                              {progress.matchedVolume} / {progress.requestedVolume}
                            </span>
                          </div>
                          <span className={`text-xs font-semibold ${statusStyle.textClass}`}>
                            {progress.fillPercentage}%
                          </span>
                        </div>
                        <Progress 
                          value={progress.fillPercentage} 
                          className={`h-1.5 ${statusStyle.progressClass}`}
                        />
                        {progress.remainingVolume > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {progress.remainingVolume} heads remaining
                          </p>
                        )}
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
                    {hasCriteria && (
                      <Button variant="ghost" size="sm" onClick={selectFullMatches} className="text-xs h-7">
                        Select Matches
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={selectAllFiltered} className="text-xs h-7">
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs h-7">
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Readiness Filter */}
              {activeRequest && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Readiness:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={readinessFilter === 'all' ? 'default' : 'ghost'}
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => setReadinessFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={readinessFilter === 'confirmed' ? 'default' : 'ghost'}
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => setReadinessFilter('confirmed')}
                    >
                      Confirmed
                    </Button>
                    <Button
                      variant={readinessFilter === 'soft_committed' ? 'default' : 'ghost'}
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => setReadinessFilter('soft_committed')}
                    >
                      Soft
                    </Button>
                    <Button
                      variant={readinessFilter === 'forecast' ? 'default' : 'ghost'}
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => setReadinessFilter('forecast')}
                    >
                      Forecast
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Standard Status Assignment Controls */}
              {selectedBatchIds.size > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-foreground">
                        {selectedBatchIds.size} batch{selectedBatchIds.size > 1 ? 'es' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Assign:</span>
                      <Select onValueChange={(value) => handleBulkStandardStatus(value as StandardStatus)}>
                        <SelectTrigger className="w-[130px] h-7 text-xs">
                          <SelectValue placeholder="Manual..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="non_standard">Non-Standard</SelectItem>
                          <SelectItem value="standard">Standard (+50₸)</SelectItem>
                          <SelectItem value="high_standard">High Standard (+100₸)</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground">or</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={handleAutoCalculate}
                        disabled={autoCalculateStatus.isPending}
                      >
                        <Wand2 className="h-3 w-3" />
                        {autoCalculateStatus.isPending ? 'Calculating...' : 'Auto-Calculate'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeRequest && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Filtered for {activeRequest.request_number}: Grade {activeRequest.required_grade} · {activeRequest.regions.join(', ')}
                    {activeRequest.target_delivery_period && (
                      <> · Delivery: {activeRequest.target_delivery_period.replace('_', ' ')}</>
                    )}
                    {activeRequest.target_week && (
                      <> · Week: {activeRequest.target_week}</>
                    )}
                  </p>
                  
                  {/* Acceptance Criteria Display */}
                  {hasCriteria && (
                    <div className="p-2 rounded-lg bg-muted/50 border">
                      <p className="text-xs font-medium mb-1">Acceptance Criteria:</p>
                      <div className="flex flex-wrap gap-1">
                        {criteriaDisplay.map((crit, i) => (
                          <Badge key={i} variant="outline" className="text-xs font-normal">
                            {crit}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-status-confirmed">{matchCounts.full} full</span>
                        <span className="text-status-soft">{matchCounts.partial} partial</span>
                        <span className="text-muted-foreground">{matchCounts.none} none</span>
                        <label className="flex items-center gap-1 ml-auto cursor-pointer">
                          <Checkbox 
                            checked={showOnlyMatching} 
                            onCheckedChange={(checked) => setShowOnlyMatching(!!checked)}
                            className="h-3 w-3"
                          />
                          <span className="text-muted-foreground">Show matching only</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
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
                <div className="space-y-4">
                  {(() => {
                    // Group batches by match level
                    const grouped = filteredSupply.reduce((acc, block) => {
                      const level = block.matchLevel || 'none';
                      if (!acc[level]) acc[level] = [];
                      acc[level].push(block);
                      return acc;
                    }, {} as Record<MatchLevel | 'none', typeof filteredSupply>);

                    const sections: Array<{ level: MatchLevel | 'none'; label: string; description: string; items: typeof filteredSupply }> = [];
                    
                    if (grouped['full']) {
                      sections.push({
                        level: 'full',
                        label: 'Full Match',
                        description: 'All criteria match perfectly',
                        items: grouped['full']
                      });
                    }
                    if (grouped['partial']) {
                      sections.push({
                        level: 'partial',
                        label: 'Partial Match',
                        description: 'Some criteria match',
                        items: grouped['partial']
                      });
                    }
                    if (grouped['none']) {
                      sections.push({
                        level: 'none',
                        label: 'No Match',
                        description: 'Criteria do not match (admin override possible)',
                        items: grouped['none']
                      });
                    }

                    return sections.map(section => (
                      <div key={section.level} className="space-y-2">
                        <div className="flex items-center gap-2 px-1 pb-1 border-b border-border/50">
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                            {section.label}
                          </h4>
                          <Badge 
                            variant={section.level === 'full' ? 'default' : section.level === 'partial' ? 'secondary' : 'outline'} 
                            className="text-xs h-5 px-1.5"
                          >
                            {section.items.length}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex-1">
                            {section.description}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {section.items.map(block => (
                            <div 
                              key={block.id}
                              className={`p-3 rounded-lg border transition-colors ${
                                selectedBatchIds.has(block.id) 
                                  ? 'border-primary bg-primary/5' 
                                  : section.level === 'none' 
                                  ? 'border-border bg-muted/30 opacity-60'
                                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  checked={selectedBatchIds.has(block.id)}
                                  onCheckedChange={() => toggleSupplySelection(block.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-foreground">{block.batchRef}</span>
                                      <PremiumBadge status={block.standard_status || 'non_standard'} size="sm" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {getReadinessBadge(block.readiness)}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <span className="font-medium text-foreground">{block.region}</span>
                                      <span>·</span>
                                      <span>Grade {block.grade}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                                      {block.available_heads < block.heads ? (
                                        <span className="font-medium text-foreground">
                                          {block.available_heads} / {block.heads} avail.
                                        </span>
                                      ) : (
                                        <span className="font-medium text-foreground">{block.heads} heads</span>
                                      )}
                                      {block.matched_heads > 0 && (
                                        <>
                                          <span>·</span>
                                          <span className="text-muted-foreground">{block.matched_heads} matched</span>
                                        </>
                                      )}
                                    </div>
                                    {(block.delivery_period || block.target_week) && (
                                      <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                        {block.delivery_period && (
                                          <span className="text-xs">{block.delivery_period.replace('_', ' ')}</span>
                                        )}
                                        {block.target_week && (
                                          <>
                                            {block.delivery_period && <span>·</span>}
                                            <span className="text-xs">{block.target_week}</span>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {/* Show batch characteristics if available */}
                                  {(block.breed || block.gender || block.age_min || block.weight_min) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {block.breed && (
                                        <Badge variant="outline" className="text-xs font-normal py-0">{block.breed}</Badge>
                                      )}
                                      {block.gender && (
                                        <Badge variant="outline" className="text-xs font-normal py-0">{block.gender}</Badge>
                                      )}
                                      {(block.age_min || block.age_max) && (
                                        <Badge variant="outline" className="text-xs font-normal py-0">
                                          {block.age_min || '–'}–{block.age_max || '–'} mo
                                        </Badge>
                                      )}
                                      {(block.weight_min || block.weight_max) && (
                                        <Badge variant="outline" className="text-xs font-normal py-0">
                                          {block.weight_min || '–'}–{block.weight_max || '–'} kg
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
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
                  {/* Current Status */}
                  {(() => {
                    const currentProgress = calculateMatchingProgress(
                      activeRequest.required_volume, 
                      activeRequest.matched_volume, 
                      selectedHeads
                    );
                    const currentStatus = getMatchingProgressStatus(currentProgress);
                    const currentStyle = getProgressStatusStyle(currentStatus);
                    
                    return (
                      <>
                        {/* Status Indicator */}
                        <div className={`p-4 rounded-lg border ${currentStyle.badgeClass}`}>
                          <div className="flex items-center gap-2">
                            {currentStatus === 'fulfilled' && <CheckCircle2 className="w-5 h-5" />}
                            {currentStatus === 'near-complete' && <TrendingUp className="w-5 h-5" />}
                            {currentStatus === 'partial' && <Clock className="w-5 h-5" />}
                            {currentStatus === 'at-risk' && <AlertTriangle className="w-5 h-5" />}
                            {currentStatus === 'not-started' && <Target className="w-5 h-5" />}
                            <div>
                              <span className="font-medium">
                                {currentStatus === 'fulfilled' && 'Fulfilled'}
                                {currentStatus === 'near-complete' && 'Near Complete'}
                                {currentStatus === 'partial' && 'Partial Fill'}
                                {currentStatus === 'at-risk' && 'At Risk'}
                                {currentStatus === 'not-started' && 'Not Started'}
                              </span>
                              <p className="text-xs opacity-80">
                                {currentProgress.fillPercentage}% matched
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Volume Metrics Grid */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-lg font-semibold text-foreground">
                              {activeRequest.required_volume}
                            </p>
                            <p className="text-xs text-muted-foreground">Requested</p>
                          </div>
                          <div className={`p-3 rounded-lg ${currentStyle.badgeClass}`}>
                            <p className="text-lg font-semibold">
                              {activeRequest.matched_volume}
                            </p>
                            <p className="text-xs opacity-80">Matched</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className={`text-lg font-semibold ${remainingVolume === 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                              {remainingVolume}
                            </p>
                            <p className="text-xs text-muted-foreground">Remaining</p>
                          </div>
                        </div>

                        {/* Fill Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Fill Progress</span>
                            <span className={currentStyle.textClass}>
                              {currentProgress.fillPercentage}%
                            </span>
                          </div>
                          <Progress 
                            value={currentProgress.fillPercentage} 
                            className={`h-2.5 ${currentStyle.progressClass}`}
                          />
                        </div>

                        {/* Validation Warnings */}
                        {validationIssues.length > 0 && (
                          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              <p className="text-xs font-medium text-amber-600">Validation Issues</p>
                            </div>
                            {validationIssues.map((issue, i) => (
                              <p key={i} className="text-xs text-amber-700 dark:text-amber-500">
                                • {issue}
                              </p>
                            ))}
                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-2">
                              Please fix these issues before creating the match.
                            </p>
                          </div>
                        )}

                        {/* Validation Warnings */}
                        {validationIssues.length > 0 && (
                          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 space-y-1 mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              <p className="text-xs font-medium text-amber-600">Validation Issues</p>
                            </div>
                            {validationIssues.map((issue, i) => (
                              <p key={i} className="text-xs text-amber-700 dark:text-amber-500">
                                • {issue}
                              </p>
                            ))}
                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-2">
                              Please fix these issues before creating the match.
                            </p>
                          </div>
                        )}

                        {/* Selection Preview */}
                        {selectedHeads > 0 && (
                          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                            <p className="text-xs font-medium text-primary">With Current Selection</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Adding</span>
                              <span className="font-medium text-primary">+{selectedHeads} heads</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">New Total</span>
                              <span className="font-medium">{totalMatchedVolume} heads</span>
                            </div>
                            <Progress 
                              value={currentProgress.projectedFillPercentage} 
                              className={`h-2 ${
                                currentProgress.projectedFillPercentage >= 100 
                                  ? '[&>div]:bg-emerald-500' 
                                  : '[&>div]:bg-primary'
                              }`}
                            />
                            <p className="text-xs text-right text-muted-foreground">
                              Projected: {currentProgress.projectedFillPercentage}%
                              {currentProgress.projectedFillPercentage >= 100 && (
                                <span className="ml-1 text-emerald-600">✓ Will fulfill</span>
                              )}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* Readiness Mix */}
                  {selectedHeads > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Readiness Mix</p>
                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-status-confirmed" />
                          <span className="text-foreground">{readinessMix.confirmed} confirmed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-status-soft" />
                          <span className="text-foreground">{readinessMix.soft} soft</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-status-forecast" />
                          <span className="text-foreground">{readinessMix.forecast} forecast</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={handleProposeMatch}
                      disabled={
                        selectedSupply.length === 0 || 
                        createMatch.isPending || 
                        validationIssues.length > 0
                      }
                    >
                      {createMatch.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Propose Match ({selectedSupply.length})
                      {validationIssues.length > 0 && (
                        <span className="ml-2 text-xs opacity-80">(Issues must be fixed)</span>
                      )}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Settings2 className="w-3 h-3 mr-1" />
                        Adjust Request
                      </Button>
                      {activeRequest.status !== 'fulfilled' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={handleMarkFulfilled}
                          disabled={updateRequest.isPending}
                        >
                          <CheckCheck className="w-3 h-3 mr-1" />
                          Mark Fulfilled
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={handleReopen}
                          disabled={updateRequest.isPending}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
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

        {/* Matchings Side Panel */}
        {activeRequestId && !showAuditHistory && activeRequest && (
          <div className="lg:col-span-3">
            <MatchingListPanel 
              requestId={activeRequestId} 
              compact 
              requestInfo={{
                requestNumber: activeRequest.request_number,
                mpkName: activeRequest.mpk_name,
                targetWeek: activeRequest.target_week,
              }}
            />
          </div>
        )}

        {/* Audit History Side Panel */}
        {showAuditHistory && activeRequestId && (
          <div className="lg:col-span-3">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Audit History</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAuditHistory(false)}>
                  Close
                </Button>
              </div>
              <PoolRequestAuditHistory requestId={activeRequestId} compact />
            </div>
          </div>
        )}
      </div>
        </TabsContent>
      </Tabs>

      {/* Admin Override Dialog */}
      {overrideDialog.request && (
        <PoolRequestOverrideDialog
          open={overrideDialog.open}
          onOpenChange={(open) => setOverrideDialog({ ...overrideDialog, open })}
          request={overrideDialog.request}
          mode={overrideDialog.mode}
        />
      )}
    </MainLayout>
  );
}
