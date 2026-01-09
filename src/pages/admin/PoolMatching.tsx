import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { getAdminBreadcrumbs } from '@/lib/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  usePoolRequests,
  useUpdatePoolRequest,
  useCreatePoolMatch,
  PoolRequest,
  getAcceptanceCriteria
} from '@/hooks/usePoolRequests';
import { useConfirmedBatches } from '@/hooks/useConfirmedBatches';
import { useBulkUpdateStandardStatus, useAutoCalculateStandardStatus, type StandardStatus } from '@/hooks/useAdminBatches';
import { checkBatchMatch, formatCriteriaDisplay } from '@/lib/livestock-criteria';
import { validateDeliveryPeriodOverlap, calculateMatchConfidence } from '@/lib/matching-validation';
import { getStatusFromProgress, calculateMatchingProgress } from '@/lib/pool-request-lifecycle';
import { PoolRequestOverrideDialog } from '@/components/admin/PoolRequestOverrideDialog';
import { PoolRequestAuditHistory } from '@/components/admin/PoolRequestAuditHistory';
import { MatchingListPanel } from '@/components/admin/MatchingListPanel';
import { PoolRequestsListView } from '@/components/admin/PoolRequestsListView';
import { MatchingWindowLockBanner } from '@/components/admin/MatchingWindowLockBanner';
import { MatchingWorkspace } from '@/components/admin/MatchingWorkspace';
import {
  SupplyBlock,
  SupplyFilterControls,
  SupplyBlockList,
  MatchingSummaryPanel,
  PoolRequestsList,
} from '@/components/admin/pool-matching';
import { List, Link2, LayoutGrid } from 'lucide-react';

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
  const { data: confirmedBatches, isLoading: batchesLoading } = useConfirmedBatches();
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
      
      // Calculate match level (legacy) and match confidence (new - Sprint 6)
      if (activeCriteria && activeRequest) {
        // Legacy match level for backward compatibility
        block.matchLevel = checkBatchMatch(
          { breed: b.breed, gender: b.gender, age_min: b.age_min, age_max: b.age_max, weight_min: b.weight_min, weight_max: b.weight_max },
          activeCriteria
        );

        // New match confidence scoring (Sprint 6 Task 9.5.2)
        block.matchConfidence = calculateMatchConfidence(
          {
            region: b.region,
            grade: b.grade,
            age_min: b.age_min || undefined,
            age_max: b.age_max || undefined,
            weight_min: b.weight_min || undefined,
            weight_max: b.weight_max || undefined,
            delivery_period: b.delivery_period || undefined,
          },
          {
            regions: activeRequest.regions,
            required_grade: activeRequest.required_grade,
            target_delivery_period: activeRequest.target_delivery_period,
            ...activeCriteria,
          }
        );
      }

      return block;
    });
  }, [confirmedBatches, activeCriteria, activeRequest]);

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
      // Updated to use matchConfidence (Sprint 6)
      filtered = filtered.filter(s => {
        if (s.matchConfidence) {
          return s.matchConfidence.level !== 'poor';
        }
        // Fallback to legacy matchLevel
        return s.matchLevel === 'full' || s.matchLevel === 'partial';
      });
    }

    // Sort by match confidence score (descending) - Sprint 6 improvement
    return filtered.sort((a, b) => {
      const scoreA = a.matchConfidence?.score || 0;
      const scoreB = b.matchConfidence?.score || 0;

      // If confidence scores are available, use them
      if (scoreA > 0 || scoreB > 0) {
        return scoreB - scoreA; // Higher score first
      }

      // Fallback to legacy matchLevel sorting
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
        description="Rules-based matching execution following window timing and criteria"
        breadcrumbs={getAdminBreadcrumbs('pool-matching', 'Pool Matching')}
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
              <PoolRequestsList
                requests={requests}
                isLoading={requestsLoading}
                activeRequestId={activeRequestId}
                onSelectRequest={handleSelectRequest}
                onEdit={(request) => setOverrideDialog({ open: true, request, mode: 'edit' })}
                onStatusOverride={(request) => setOverrideDialog({ open: true, request, mode: 'status' })}
                onViewAudit={(requestId) => {
                  setActiveRequestId(requestId);
                  setShowAuditHistory(true);
                }}
              />
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

              {activeRequest && (
                <SupplyFilterControls
                  readinessFilter={readinessFilter}
                  onReadinessFilterChange={setReadinessFilter}
                  showOnlyMatching={showOnlyMatching}
                  onShowOnlyMatchingChange={setShowOnlyMatching}
                  hasCriteria={hasCriteria}
                  criteriaDisplay={criteriaDisplay}
                  matchCounts={matchCounts}
                  selectedBatchCount={selectedBatchIds.size}
                  onBulkStandardStatus={handleBulkStandardStatus}
                  onAutoCalculate={handleAutoCalculate}
                  autoCalculateLoading={autoCalculateStatus.isPending}
                  requestNumber={activeRequest.request_number}
                  requiredGrade={activeRequest.required_grade}
                  regions={activeRequest.regions}
                  targetDeliveryPeriod={activeRequest.target_delivery_period}
                  targetWeek={activeRequest.target_week}
                />
              )}
            </CardHeader>
            <CardContent>
              <SupplyBlockList
                supplyBlocks={filteredSupply}
                selectedBatchIds={selectedBatchIds}
                onToggleSelection={toggleSupplySelection}
                isLoading={batchesLoading}
                hasActiveRequest={!!activeRequest}
              />
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
              <MatchingSummaryPanel
                activeRequest={activeRequest}
                selectedHeads={selectedHeads}
                totalMatchedVolume={totalMatchedVolume}
                remainingVolume={remainingVolume}
                fillPercentage={fillPercentage}
                selectedSupplyCount={selectedSupply.length}
                validationIssues={validationIssues}
                readinessMix={readinessMix}
                onProposeMatch={handleProposeMatch}
                onMarkFulfilled={handleMarkFulfilled}
                onReopen={handleReopen}
                isProposeLoading={createMatch.isPending}
                isStatusUpdateLoading={updateRequest.isPending}
              />
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
