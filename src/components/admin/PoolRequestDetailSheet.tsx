import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PoolRequestAuditHistory } from './PoolRequestAuditHistory';
import { PoolRequestAdminOverrideBadge } from './PoolRequestAdminOverrideBadge';
import { usePoolMatches, type PoolRequest, type PoolRequestStatus } from '@/hooks/usePoolRequests';
import { useExecutions } from '@/hooks/useExecutions';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Target, 
  Scale,
  Package,
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  History,
  Link2
} from 'lucide-react';

interface PoolRequestDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PoolRequest | null;
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
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getDeliveryPeriodLabel = (period: 'short_term' | 'mid_term' | 'long_term' | null) => {
  switch (period) {
    case 'short_term':
      return 'Short Term (0-2 weeks)';
    case 'mid_term':
      return 'Mid Term (2-4 weeks)';
    case 'long_term':
      return 'Long Term (4+ weeks)';
    default:
      return 'Not specified';
  }
};

export function PoolRequestDetailSheet({
  open,
  onOpenChange,
  request,
}: PoolRequestDetailSheetProps) {
  const { data: matches } = usePoolMatches(request?.id || null);
  const { data: executions } = useExecutions();

  if (!request) return null;

  const isLocked = ['fulfilled', 'closed', 'cancelled'].includes(request.status);
  const fillPercentage = request.required_volume > 0 
    ? Math.min(100, (request.matched_volume / request.required_volume) * 100)
    : 0;
  const remainingVolume = Math.max(0, request.required_volume - request.matched_volume);

  // Filter executions related to this request
  const requestExecutions = executions?.filter(e => e.request_id === request.id) || [];

  // Get active matches count
  const activeMatches = matches?.filter(m => m.status === 'active' || m.status === 'finalized') || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px] sm:max-w-[600px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <SheetHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <SheetTitle className="flex items-center gap-2 text-xl">
                    {request.request_number}
                    {(request as any).admin_modified && (
                      <PoolRequestAdminOverrideBadge
                        isModified={true}
                        modifiedBy={(request as any).admin_modified_by}
                        modifiedAt={(request as any).admin_modified_at}
                        reason={(request as any).admin_modification_reason}
                        size="sm"
                      />
                    )}
                  </SheetTitle>
                  <SheetDescription className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {request.mpk_name}
                  </SheetDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(request.status)}
                  {isLocked ? (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
                      <Lock className="h-3 w-3" />
                      Locked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground gap-1">
                      <Unlock className="h-3 w-3" />
                      Open
                    </Badge>
                  )}
                </div>
              </div>
            </SheetHeader>

            {/* Matching Progress */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Matching Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {request.matched_volume} / {request.required_volume} heads matched
                      </span>
                      <span className="font-medium">{Math.round(fillPercentage)}%</span>
                    </div>
                    <Progress value={fillPercentage} className="h-2" />
                  </div>

                  {/* Volume Metrics */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-semibold">{request.required_volume}</p>
                      <p className="text-xs text-muted-foreground">Requested</p>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${
                      fillPercentage >= 100 
                        ? 'bg-status-confirmed-bg text-status-confirmed' 
                        : fillPercentage > 0 
                        ? 'bg-status-soft-bg text-status-soft'
                        : 'bg-muted/50'
                    }`}>
                      <p className="text-lg font-semibold">{request.matched_volume}</p>
                      <p className="text-xs opacity-80">Matched</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-semibold">{remainingVolume}</p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demand Parameters */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Demand Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Target Week</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {request.target_week}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Delivery Period</p>
                    <p className="font-medium">{getDeliveryPeriodLabel(request.target_delivery_period)}</p>
                  </div>
                </div>

                <Separator />

                {/* Quality Requirements */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Required Grade</p>
                    <Badge variant="outline" className="font-medium">Grade {request.required_grade}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Regions</p>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{request.regions.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Acceptance Criteria */}
                {(request.accepted_breeds?.length > 0 || 
                  request.accepted_genders?.length > 0 || 
                  request.weight_range_min || 
                  request.age_range_min) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Acceptance Criteria</p>
                      <div className="flex flex-wrap gap-1.5">
                        {request.accepted_breeds?.map(breed => (
                          <Badge key={breed} variant="outline" className="text-xs">{breed}</Badge>
                        ))}
                        {request.accepted_genders?.map(gender => (
                          <Badge key={gender} variant="outline" className="text-xs">{gender}</Badge>
                        ))}
                        {(request.weight_range_min || request.weight_range_max) && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Scale className="h-3 w-3" />
                            {request.weight_range_min || '–'}–{request.weight_range_max || '–'} kg
                          </Badge>
                        )}
                        {(request.age_range_min || request.age_range_max) && (
                          <Badge variant="outline" className="text-xs">
                            {request.age_range_min || '–'}–{request.age_range_max || '–'} months
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Notes */}
                {request.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{request.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Matching Summary */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Matching Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Active Matches</span>
                    </div>
                    <p className="text-xl font-semibold">{activeMatches.length}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Executions</span>
                    </div>
                    <p className="text-xl font-semibold">{requestExecutions.length}</p>
                  </div>
                </div>

                {/* Execution Status Breakdown */}
                {requestExecutions.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Execution Status</p>
                    <div className="space-y-2">
                      {requestExecutions.slice(0, 5).map(execution => (
                        <div 
                          key={execution.id} 
                          className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{execution.matched_volume} heads</span>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {execution.status}
                          </Badge>
                        </div>
                      ))}
                      {requestExecutions.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{requestExecutions.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PoolRequestAuditHistory requestId={request.id} />
              </CardContent>
            </Card>

            {/* Timestamps */}
            <div className="mt-6 pt-4 border-t text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Created: {format(new Date(request.created_at), 'PPpp')}
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Updated: {format(new Date(request.updated_at), 'PPpp')}
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
