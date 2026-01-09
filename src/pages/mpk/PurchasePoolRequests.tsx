import { useState, useMemo, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { getMpkBreadcrumbs } from '@/lib/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PoolStatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Clock,
  CheckCircle2,
  MapPin,
  Medal,
  CalendarClock,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Pencil,
  Lock,
  Loader2
} from 'lucide-react';
import { usePoolRequests, useCancelPoolRequest, useTransitionPoolRequestStatus, type PoolRequest, type PoolRequestStatus } from '@/hooks/usePoolRequests';
import { useMpks } from '@/hooks/useMpks';
import { useCurrentMpk } from '@/hooks/useCurrentMpk';
import { NewRequestDialog } from '@/components/mpk/NewRequestDialog';
import type { AcceptanceCriteria } from '@/lib/livestock-criteria';
import { EditRequestDialog } from '@/components/mpk/EditRequestDialog';
import { MatchingWindowStatusBanner } from '@/components/mpk/MatchingWindowStatusBanner';
import { MpkMatchingView } from '@/components/pool/MpkMatchingView';
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  canEditPoolRequest,
  getPoolRequestLockedTooltip,
  type PoolRequestLifecycleStatus,
  type PoolRequestRole,
} from '@/lib/pool-request-lifecycle';
import { FillRateIndicator } from '@/components/pool/FillRateIndicator';
import { type MatchingWindow } from '@/lib/matching-window';

const statusConfig: Record<PoolRequestStatus, {
  icon: typeof CheckCircle2;
  description: string;
}> = {
  draft: {
    icon: Clock,
    description: 'Request is being prepared. Not yet submitted.'
  },
  submitted: {
    icon: Clock,
    description: 'Request submitted. Awaiting Admin review.'
  },
  matching: {
    icon: Clock,
    description: 'Admin is actively matching supply to this request.'
  },
  partial: {
    icon: Clock,
    description: 'Some supply matched. Matching continues for remaining volume.'
  },
  fulfilled: {
    icon: CheckCircle2,
    description: 'Request fully matched. Awaiting delivery confirmation.'
  },
  closed: {
    icon: CheckCircle2,
    description: 'Request completed. No further changes allowed.'
  },
  cancelled: {
    icon: XCircle,
    description: 'Request has been cancelled.'
  },
};

// Check if request is at risk (low fill rate, approaching deadline)
function isAtRisk(request: PoolRequest): boolean {
  if (request.status === 'fulfilled' || request.status === 'cancelled' || request.status === 'closed' || request.status === 'draft') return false;
  const fillRate = request.required_volume > 0 ? request.matched_volume / request.required_volume : 0;
  // Consider at risk if less than 50% filled
  return fillRate < 0.5;
}

// MPK role for edit permissions
const USER_ROLE: PoolRequestRole = 'mpk';

export default function PurchasePoolRequests() {
  const { data: requests, isLoading, error } = usePoolRequests();
  const { data: mpks } = useMpks();
  const cancelRequest = useCancelPoolRequest();
  const transitionStatus = useTransitionPoolRequestStatus();
  
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<string | null>(null);
  const [editRequest, setEditRequest] = useState<PoolRequest | null>(null);
  const [canSubmitRequests, setCanSubmitRequests] = useState(false);
  const [currentWindow, setCurrentWindow] = useState<MatchingWindow | null>(null);

  // Callback to receive submission status from banner
  const handleSubmissionStatusChange = useCallback((canSubmit: boolean, window: MatchingWindow | null) => {
    setCanSubmitRequests(canSubmit);
    setCurrentWindow(window);
  }, []);

  // Get current MPK profile
  const { data: currentMpkData } = useCurrentMpk();
  const currentMpk = currentMpkData || mpks?.[0] || { id: 'demo', mpk_id: 'MPK-001', name: 'Demo MPK' };

  // Prepare default criteria from MPK profile for pre-filling new request form
  const defaultCriteria: AcceptanceCriteria | undefined = currentMpkData ? {
    accepted_breeds: [], // Can be extended in future
    accepted_genders: [], // Can be extended in future
    age_range_min: currentMpkData.default_age_range_min ?? null,
    age_range_max: currentMpkData.default_age_range_max ?? null,
    weight_range_min: currentMpkData.default_weight_range_min ?? null,
    weight_range_max: currentMpkData.default_weight_range_max ?? null,
  } : undefined;

  // Prepare default regions from MPK profile
  const defaultRegions = currentMpkData?.intake_regions || [];

  // Filter requests: only show requests belonging to current MPK
  // This is a defense-in-depth measure - RLS should already filter, but this adds extra protection
  const filteredRequests = useMemo(() => {
    if (!currentMpkData?.mpk_id) return [];
    return requests?.filter(r => r.mpk_id === currentMpkData.mpk_id) || [];
  }, [requests, currentMpkData?.mpk_id]);

  // Filter out cancelled requests from main view
  const activeRequests = useMemo(() => 
    filteredRequests.filter(r => r.status !== 'cancelled'),
    [filteredRequests]
  );

  const stats = useMemo(() => {
    if (!activeRequests.length) return { total: 0, requested: 0, matched: 0, fillRate: 0, atRisk: 0 };
    
    const requested = activeRequests.reduce((sum, r) => sum + r.required_volume, 0);
    const matched = activeRequests.reduce((sum, r) => sum + r.matched_volume, 0);
    
    return {
      total: activeRequests.length,
      requested,
      matched,
      fillRate: requested > 0 ? Math.round((matched / requested) * 100) : 0,
      atRisk: activeRequests.filter(isAtRisk).length,
    };
  }, [activeRequests]);

  const handleCancel = async () => {
    if (!cancelDialogOpen) return;
    await cancelRequest.mutateAsync(cancelDialogOpen);
    setCancelDialogOpen(null);
  };

  const handleSubmitDraft = async (requestId: string) => {
    const request = requests?.find(r => r.id === requestId);
    if (!request || request.status !== 'draft') return;
    
    await transitionStatus.mutateAsync({
      id: requestId,
      fromStatus: 'draft',
      toStatus: 'submitted',
      role: 'mpk',
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader
          title="Purchase Pool Requests"
          description="Loading..."
          breadcrumbs={getMpkBreadcrumbs('requests', 'Purchase Pool Requests')}
        />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <PageHeader
          title="Purchase Pool Requests"
          description="Manage procurement requests"
          breadcrumbs={getMpkBreadcrumbs('requests', 'Purchase Pool Requests')}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Failed to load requests</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Purchase Pool Requests"
        description="Monitor procurement progress and manage request parameters"
        breadcrumbs={getMpkBreadcrumbs('requests', 'Purchase Pool Requests')}
      />

      {/* Matching Window Status Banner */}
      <MatchingWindowStatusBanner onSubmissionStatusChange={handleSubmissionStatusChange} />

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Active Requests</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    size="sm" 
                    onClick={() => setNewRequestOpen(true)}
                    disabled={!canSubmitRequests}
                    title={!canSubmitRequests ? 'Submissions are closed. Wait for an active matching window.' : undefined}
                  >
                    {canSubmitRequests ? (
                      <Plus className="w-4 h-4 mr-2" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    New Request
                  </Button>
                </div>
              </TooltipTrigger>
              {!canSubmitRequests && (
                <TooltipContent>
                  <p>Submissions are closed. Wait for an active matching window.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          {activeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <CalendarClock className="w-10 h-10 text-muted-foreground/60" />
              </div>
              <p className="font-medium text-foreground mb-1">No purchase requests created yet.</p>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                {canSubmitRequests 
                  ? 'Requests define your demand for upcoming matching windows.'
                  : 'Wait for an active matching window to submit requests.'}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        onClick={() => setNewRequestOpen(true)}
                        disabled={!canSubmitRequests}
                      >
                        {canSubmitRequests ? (
                          <Plus className="w-4 h-4 mr-2" />
                        ) : (
                          <Lock className="w-4 h-4 mr-2" />
                        )}
                        Create Pool Request
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canSubmitRequests && (
                    <TooltipContent>
                      <p>Submissions are closed. Wait for an active matching window.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRequests.map((request) => {
                const config = statusConfig[request.status];
                const StatusIcon = config.icon;
                const fillRate = request.required_volume > 0 
                  ? Math.round((request.matched_volume / request.required_volume) * 100) 
                  : 0;
                const atRisk = isAtRisk(request);
                const isActionable = request.status === 'submitted' || request.status === 'matching' || request.status === 'partial';
                
                return (
                  <div 
                    key={request.id} 
                    className={`p-4 border rounded-lg transition-colors ${
                      atRisk 
                        ? 'border-amber-500/50 bg-amber-500/5' 
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{request.request_number}</p>
                          <PoolStatusBadge status={request.status} />
                          {atRisk && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              At Risk
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(() => {
                            const canEdit = canEditPoolRequest(request.status as PoolRequestLifecycleStatus, USER_ROLE);
                            const lockTooltip = getPoolRequestLockedTooltip(request.status as PoolRequestLifecycleStatus, USER_ROLE);
                            
                            return (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <DropdownMenuItem 
                                        onClick={() => setEditRequest(request)}
                                        disabled={!canEdit}
                                        className={!canEdit ? 'opacity-50 cursor-not-allowed' : ''}
                                      >
                                        {canEdit ? (
                                          <Pencil className="w-4 h-4 mr-2" />
                                        ) : (
                                          <Lock className="w-4 h-4 mr-2" />
                                        )}
                                        Edit Request
                                      </DropdownMenuItem>
                                    </div>
                                  </TooltipTrigger>
                                  {!canEdit && lockTooltip && (
                                    <TooltipContent side="left">
                                      <p>{lockTooltip}</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })()}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setCancelDialogOpen(request.id)}
                            disabled={request.status === 'closed' || request.status === 'fulfilled'}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Fill Rate Progress */}
                    <div className="mb-4">
                      <FillRateIndicator
                        requiredVolume={request.required_volume}
                        matchedVolume={request.matched_volume}
                        variant="full"
                        showDetails={true}
                      />
                    </div>

                    {/* Request Parameters */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-t">
                      <div className="flex items-center gap-2">
                        <Medal className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Grade</p>
                          <p className="text-sm font-medium">{request.required_grade}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Regions</p>
                          <p className="text-sm font-medium">
                            {request.regions.length > 2 
                              ? `${request.regions.slice(0, 2).join(', ')} +${request.regions.length - 2}`
                              : request.regions.join(', ') || 'Any'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Target Week</p>
                          <p className="text-sm font-medium">{request.target_week}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions for Draft Requests */}
                    {request.status === 'draft' && (
                      <div className="pt-3 mt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Draft request - actions:</p>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => setEditRequest(request)}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handleSubmitDraft(request.id)}
                            disabled={transitionStatus.isPending || !canSubmitRequests}
                          >
                            {transitionStatus.isPending ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Target className="w-3 h-3 mr-1" />
                            )}
                            Submit Request
                          </Button>
                        </div>
                        {!canSubmitRequests && (
                          <p className="text-xs text-amber-600 mt-2">
                            Submissions are closed. Wait for an active matching window to submit.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Locked status indicator */}
                    {request.status !== 'draft' && request.status !== 'cancelled' && request.status !== 'closed' && (
                      <div className="pt-3 mt-3 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          <span>
                            {getPoolRequestLockedTooltip(request.status as PoolRequestLifecycleStatus, USER_ROLE)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Matching View - Show for requests with matches or in matching status */}
                    {(request.status === 'matching' || request.status === 'partial' || request.status === 'fulfilled' || request.matched_volume > 0) && (
                      <div className="pt-4 mt-4 border-t">
                        <MpkMatchingView requestId={request.id} />
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-3 mt-3 border-t text-xs text-muted-foreground flex justify-between">
                      <span>Created {format(parseISO(request.created_at), 'MMM d, yyyy')}</span>
                      <span>{request.mpk_name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Request Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Active Requests</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-semibold">{stats.requested}</p>
              <p className="text-sm text-muted-foreground">Heads Requested</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-semibold">{stats.matched}</p>
              <p className="text-sm text-muted-foreground">Heads Matched</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-semibold text-primary">{stats.fillRate}%</p>
              <p className="text-sm text-muted-foreground">Overall Fill Rate</p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg text-center border border-amber-500/30">
              <p className="text-2xl font-semibold text-amber-600">{stats.atRisk}</p>
              <p className="text-sm text-muted-foreground">At Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <NewRequestDialog 
        open={newRequestOpen} 
        onOpenChange={setNewRequestOpen}
        mpkId={currentMpk.mpk_id}
        mpkName={currentMpk.name}
        defaultCriteria={defaultCriteria}
        defaultRegions={defaultRegions}
        commonTargetWeeks={currentMpkData?.common_target_weeks || []}
      />

      {/* Edit Request Dialog */}
      {editRequest && (
        <EditRequestDialog
          open={!!editRequest}
          onOpenChange={(open) => !open && setEditRequest(null)}
          request={editRequest}
          userRole={USER_ROLE}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelDialogOpen} onOpenChange={() => setCancelDialogOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this purchase request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
