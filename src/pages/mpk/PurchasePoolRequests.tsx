import { useState, useMemo } from 'react';
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
  Info, 
  MapPin, 
  Medal, 
  CalendarClock,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { usePoolRequests, useCancelPoolRequest, useUpdatePoolRequest, type PoolRequest, type PoolRequestStatus } from '@/hooks/usePoolRequests';
import { useMpks } from '@/hooks/useMpks';
import { NewRequestDialog } from '@/components/mpk/NewRequestDialog';
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
import { toast } from '@/hooks/use-toast';

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

export default function PurchasePoolRequests() {
  const { data: requests, isLoading, error } = usePoolRequests();
  const { data: mpks } = useMpks();
  const cancelRequest = useCancelPoolRequest();
  const updateRequest = useUpdatePoolRequest();
  
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<string | null>(null);

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

  const handleExpandRegions = async (request: PoolRequest) => {
    // Add all regions
    const allRegions = ['Almaty', 'Astana', 'Shymkent', 'Aktobe', 'Karaganda', 'Pavlodar', 'Kostanay', 'East Kazakhstan', 'West Kazakhstan', 'North Kazakhstan'];
    await updateRequest.mutateAsync({
      id: request.id,
      regions: allRegions,
    });
    toast({
      title: 'Regions expanded',
      description: 'Request now accepts supply from all regions.',
    });
  };

  const handleLowerGrade = async (request: PoolRequest) => {
    const gradeProgression: Record<string, string> = {
      'A': 'A/B',
      'A/B': 'B',
      'B': 'B/C',
      'B/C': 'C',
    };
    const newGrade = gradeProgression[request.required_grade] || 'Any';
    await updateRequest.mutateAsync({
      id: request.id,
      required_grade: newGrade,
    });
    toast({
      title: 'Grade requirement lowered',
      description: `Request now accepts Grade ${newGrade}.`,
    });
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

      {/* Timing Context */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">How Matching Works</p>
              <p className="text-sm text-muted-foreground mt-1">
                Matching continues until the start of the target week. Adjust request parameters to improve fill rates before the deadline.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Active Requests</CardTitle>
          <Button size="sm" onClick={() => setNewRequestOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </CardHeader>
        <CardContent>
          {activeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <CalendarClock className="w-10 h-10 text-muted-foreground/60" />
              </div>
              <p className="font-medium text-foreground mb-1">No purchase requests created yet.</p>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Requests define your demand for upcoming matching windows.
              </p>
              <Button onClick={() => setNewRequestOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Pool Request
              </Button>
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
                          <DropdownMenuItem onClick={() => handleExpandRegions(request)}>
                            <MapPin className="w-4 h-4 mr-2" />
                            Expand Regions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLowerGrade(request)}>
                            <Medal className="w-4 h-4 mr-2" />
                            Lower Grade Requirement
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setCancelDialogOpen(request.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Progress Section */}
                    <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Fill Rate</span>
                        <span className={`text-lg font-bold ${
                          fillRate >= 100 ? 'text-emerald-600' : 
                          fillRate >= 50 ? 'text-foreground' : 'text-amber-600'
                        }`}>
                          {fillRate}%
                        </span>
                      </div>
                      <Progress 
                        value={fillRate} 
                        className={`h-3 ${atRisk ? '[&>div]:bg-amber-500' : ''}`}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{request.matched_volume}</span> / {request.required_volume} heads matched
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {request.required_volume - request.matched_volume} remaining
                        </span>
                      </div>
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

                    {/* Quick Actions for At-Risk Requests */}
                    {isActionable && atRisk && (
                      <div className="pt-3 mt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Optimization options:</p>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handleExpandRegions(request)}
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            Expand Regions
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handleLowerGrade(request)}
                          >
                            <Medal className="w-3 h-3 mr-1" />
                            Lower Grade
                          </Button>
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
