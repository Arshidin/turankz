import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckCircle2,
  TrendingUp,
  Clock,
  AlertTriangle,
  Target,
  MoreVertical,
  Edit,
  ShieldAlert,
  History,
  Filter,
} from 'lucide-react';
import { PoolRequest, getAcceptanceCriteria } from '@/hooks/usePoolRequests';
import { PoolRequestAdminOverrideBadge } from '@/components/admin/PoolRequestAdminOverrideBadge';
import { formatCriteriaDisplay } from '@/lib/livestock-criteria';
import {
  calculateMatchingProgress,
  getMatchingProgressStatus,
  getProgressStatusStyle,
} from '@/lib/pool-request-lifecycle';
import { getStatusBadge } from './helpers';

interface PoolRequestCardProps {
  request: PoolRequest;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (request: PoolRequest) => void;
  onStatusOverride: (request: PoolRequest) => void;
  onViewAudit: (requestId: string) => void;
}

export function PoolRequestCard({
  request,
  isActive,
  onSelect,
  onEdit,
  onStatusOverride,
  onViewAudit,
}: PoolRequestCardProps) {
  const progress = calculateMatchingProgress(request.required_volume, request.matched_volume);
  const progressStatus = getMatchingProgressStatus(progress);
  const statusStyle = getProgressStatusStyle(progressStatus);
  const reqCriteria = getAcceptanceCriteria(request);
  const hasCrit = formatCriteriaDisplay(reqCriteria).length > 0;

  return (
    <div
      onClick={() => onSelect(request.id)}
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'
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
              <DropdownMenuItem onClick={() => onEdit(request)}>
                <Edit className="h-3 w-3 mr-2" />
                Override: Edit Fields
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusOverride(request)}>
                <ShieldAlert className="h-3 w-3 mr-2" />
                Override: Change Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewAudit(request.id)}>
                <History className="h-3 w-3 mr-2" />
                View Audit History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          <span className="text-foreground">{request.mpk_name}</span> · {request.target_week}
        </p>
        <p>
          {request.required_volume} heads · Grade {request.required_grade}
        </p>
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
          <span className={`text-xs font-semibold ${statusStyle.textClass}`}>{progress.fillPercentage}%</span>
        </div>
        <Progress value={progress.fillPercentage} className={`h-1.5 ${statusStyle.progressClass}`} />
        {progress.remainingVolume > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{progress.remainingVolume} heads remaining</p>
        )}
      </div>
    </div>
  );
}
