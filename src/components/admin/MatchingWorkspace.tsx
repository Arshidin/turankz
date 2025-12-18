import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ConfirmedBatchesList } from './ConfirmedBatchesList';
import { MatchingRequestsList } from './MatchingRequestsList';
import { CreateMatchingDialog } from './CreateMatchingDialog';
import { MatchingWorkspaceFilters, type WorkspaceFilters } from './MatchingWorkspaceFilters';
import { MatchingWindowLockBanner } from './MatchingWindowLockBanner';
import { useConfirmedBatchRegions } from '@/hooks/useConfirmedBatches';
import { useMatchingRequestRegions } from '@/hooks/useMatchingRequests';
import type { ConfirmedBatch } from '@/hooks/useConfirmedBatches';
import type { MatchingPoolRequest } from '@/hooks/useMatchingRequests';
import { Link2, Package, Target, ArrowRight } from 'lucide-react';

export function MatchingWorkspace() {
  // Filter state
  const [filters, setFilters] = useState<WorkspaceFilters>({
    region: 'all',
    minWeight: undefined,
    maxWeight: undefined,
    minAge: undefined,
    maxAge: undefined,
    minVolume: undefined,
  });

  // Selection state
  const [selectedBatch, setSelectedBatch] = useState<ConfirmedBatch | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MatchingPoolRequest | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Get regions for filter dropdown
  const batchRegions = useConfirmedBatchRegions();
  const requestRegions = useMatchingRequestRegions();
  const allRegions = useMemo(() => {
    const combined = new Set([...batchRegions, ...requestRegions]);
    return Array.from(combined).sort();
  }, [batchRegions, requestRegions]);

  // Convert workspace filters to specific filter types
  const batchFilters = useMemo(() => ({
    region: filters.region !== 'all' ? filters.region : undefined,
    minWeight: filters.minWeight,
    maxWeight: filters.maxWeight,
    minAge: filters.minAge,
    maxAge: filters.maxAge,
    minAvailableVolume: filters.minVolume,
  }), [filters]);

  const requestFilters = useMemo(() => ({
    region: filters.region !== 'all' ? filters.region : undefined,
    minWeight: filters.minWeight,
    maxWeight: filters.maxWeight,
    minAge: filters.minAge,
    maxAge: filters.maxAge,
    minRemainingVolume: filters.minVolume,
  }), [filters]);

  const handleSelectBatch = (batch: ConfirmedBatch) => {
    setSelectedBatch(batch);
  };

  const handleSelectRequest = (request: MatchingPoolRequest) => {
    setSelectedRequest(request);
  };

  const handleClearSelection = () => {
    setSelectedBatch(null);
    setSelectedRequest(null);
  };

  const handleCreateSuccess = () => {
    handleClearSelection();
  };

  const canCreateMatching = selectedBatch && selectedRequest && 
    selectedBatch.available_heads > 0 && 
    selectedRequest.remaining_volume > 0;

  return (
    <div className="space-y-4">
      {/* Matching Window Status */}
      <MatchingWindowLockBanner />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <MatchingWorkspaceFilters
          filters={filters}
          onFiltersChange={setFilters}
          regions={allRegions}
        />

        <div className="flex items-center gap-2">
          {(selectedBatch || selectedRequest) && (
            <Button variant="ghost" size="sm" onClick={handleClearSelection}>
              Clear Selection
            </Button>
          )}
          <Button
            onClick={() => setCreateDialogOpen(true)}
            disabled={!canCreateMatching}
            className="gap-2"
          >
            <Link2 className="h-4 w-4" />
            Create Matching
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedBatch || selectedRequest) && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Selected Batch */}
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {selectedBatch ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{selectedBatch.batch_number}</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedBatch.available_heads} avail.
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Select batch</span>
                  )}
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground" />

                {/* Selected Request */}
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  {selectedRequest ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{selectedRequest.request_number}</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedRequest.remaining_volume} remain.
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Select request</span>
                  )}
                </div>
              </div>

              {canCreateMatching && (
                <div className="text-sm text-muted-foreground">
                  Max match: <span className="font-medium text-foreground">
                    {Math.min(selectedBatch!.available_heads, selectedRequest!.remaining_volume)} heads
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConfirmedBatchesList
          filters={batchFilters}
          selectedBatchId={selectedBatch?.id || null}
          onSelectBatch={handleSelectBatch}
        />
        <MatchingRequestsList
          filters={requestFilters}
          selectedRequestId={selectedRequest?.id || null}
          onSelectRequest={handleSelectRequest}
        />
      </div>

      {/* Create Matching Dialog */}
      <CreateMatchingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        selectedBatch={selectedBatch}
        selectedRequest={selectedRequest}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
