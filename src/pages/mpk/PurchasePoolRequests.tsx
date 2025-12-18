import { useState, useMemo, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Medal, 
  CalendarClock,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Pencil,
  Lock,
  Target,
  TrendingUp
} from 'lucide-react';
import { usePoolRequests, useCancelPoolRequest, type PoolRequest, type PoolRequestStatus } from '@/hooks/usePoolRequests';
import { useMpks } from '@/hooks/useMpks';
import { NewRequestDialog } from '@/components/mpk/NewRequestDialog';
import { EditRequestDialog } from '@/components/mpk/EditRequestDialog';
import { MatchingWindowStatusBanner } from '@/components/mpk/MatchingWindowStatusBanner';
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
  calculateMatchingProgress,
  getMatchingProgressStatus,
  getProgressStatusStyle,
  getMatchingProgressLabel,
  type PoolRequestLifecycleStatus,
  type PoolRequestRole,
} from '@/lib/pool-request-lifecycle';
import { type MatchingWindow } from '@/lib/matching-window';

const statusConfig: Record<PoolRequestStatus, {
  label: string;
  icon: typeof CheckCircle2;
  className: string;
  description: string;
}> = {
  draft: {
    label: 'Draft',
    icon: Clock,
    className: 'bg-muted text-muted-foreground border-border',
    description: 'Request is being prepared. Not yet submitted.'
  },
  submitted: { 
    label: 'Submitted', 
    icon: Clock, 
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    description: 'Request submitted. Awaiting Admin review.'
  },
  matching: { 
    label: 'Matching', 
    icon: Clock, 
    className: 'bg-violet-500/10 text-violet-600 border-violet-500/30',
    description: 'Admin is actively matching supply to this request.'
  },
  partial: { 
    label: 'Partial', 
    icon: Clock, 
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    description: 'Some supply matched. Matching continues for remaining volume.'
  },
  fulfilled: { 
    label: 'Fulfilled', 
    icon: CheckCircle2, 
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    description: 'Request fully matched. Awaiting delivery confirmation.'
  },
  closed: {
    label: 'Closed',
    icon: CheckCircle2,
    className: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
    description: 'Request completed. No further changes allowed.'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/30',
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

  // For demo, use first MPK or default values
  const currentMpk = mpks?.[0] || { id: 'demo', mpk_id: 'MPK-001', name: 'Demo MPK' };

  // Filter out cancelled requests from main view
  const activeRequests = useMemo(() => 
    requests?.filter(r => r.status !== 'cancelled') || [],
    [requests]
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

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader title="Purchase Pool Requests" description="Loading..." />
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
        <PageHeader title="Purchase Pool Requests" description="Manage procurement requests" />
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
                          <Badge variant="outline" className={config.className}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
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

                    {/* Enhanced Progress Section */}
                    {(() => {
                      const progress = calculateMatchingProgress(request.required_volume, request.matched_volume);
                      const progressStatus = getMatchingProgressStatus(progress);
                      const statusStyle = getProgressStatusStyle(progressStatus);
                      
                      return (
                        <div className={`rounded-lg p-4 mb-4 border ${statusStyle.badgeClass}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {progressStatus === 'fulfilled' && <CheckCircle2 className="w-4 h-4" />}
                              {progressStatus === 'near-complete' && <TrendingUp className="w-4 h-4" />}
                              {progressStatus === 'partial' && <Clock className="w-4 h-4" />}
                              {progressStatus === 'at-risk' && <AlertTriangle className="w-4 h-4" />}
                              {progressStatus === 'not-started' && <Target className="w-4 h-4" />}
                              <span className="text-sm font-medium">{getMatchingProgressLabel(progressStatus)}</span>
                            </div>
                            <span className={`text-lg font-bold ${statusStyle.textClass}`}>
                              {progress.fillPercentage}%
                            </span>
                          </div>
                          <Progress 
                            value={progress.fillPercentage} 
                            className={`h-3 ${statusStyle.progressClass}`}
                          />
                          <div className="flex items-center justify-between mt-2 text-sm">
                            <span>
                              <span className="font-semibold">{progress.matchedVolume}</span> / {progress.requestedVolume} heads
                            </span>
                            <span className="text-xs">
                              {progress.remainingVolume} remaining
                            </span>
                          </div>
                        </div>
                      );
                    })()}

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

                    {/* Quick Actions for At-Risk Requests - Only in draft status */}
                    {request.status === 'draft' && atRisk && (
                      <div className="pt-3 mt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => setEditRequest(request)}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit Request
                          </Button>
                        </div>
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
        mpkId={currentMpk.id}
        mpkName={currentMpk.name}
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
