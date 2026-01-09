import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  TrendingUp,
  Clock,
  AlertTriangle,
  Target,
  ArrowRight,
  Send,
  Settings2,
  CheckCheck,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { PoolRequest } from '@/hooks/usePoolRequests';
import {
  calculateMatchingProgress,
  getMatchingProgressStatus,
  getProgressStatusStyle,
} from '@/lib/pool-request-lifecycle';

interface MatchingSummaryPanelProps {
  activeRequest: PoolRequest | null;
  selectedHeads: number;
  totalMatchedVolume: number;
  remainingVolume: number;
  fillPercentage: number;
  selectedSupplyCount: number;
  validationIssues: string[];
  readinessMix: {
    confirmed: number;
    soft: number;
    forecast: number;
  };
  onProposeMatch: () => void;
  onMarkFulfilled: () => void;
  onReopen: () => void;
  isProposeLoading: boolean;
  isStatusUpdateLoading: boolean;
}

export function MatchingSummaryPanel({
  activeRequest,
  selectedHeads,
  totalMatchedVolume,
  remainingVolume,
  fillPercentage,
  selectedSupplyCount,
  validationIssues,
  readinessMix,
  onProposeMatch,
  onMarkFulfilled,
  onReopen,
  isProposeLoading,
  isStatusUpdateLoading,
}: MatchingSummaryPanelProps) {
  if (!activeRequest) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ArrowRight className="w-10 h-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">Select a request to begin matching</p>
      </div>
    );
  }

  const currentProgress = calculateMatchingProgress(
    activeRequest.required_volume,
    activeRequest.matched_volume,
    selectedHeads
  );
  const currentStatus = getMatchingProgressStatus(currentProgress);
  const currentStyle = getProgressStatusStyle(currentStatus);

  return (
    <div className="space-y-4">
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
            <p className="text-xs opacity-80">{currentProgress.fillPercentage}% matched</p>
          </div>
        </div>
      </div>

      {/* Volume Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-lg font-semibold text-foreground">{activeRequest.required_volume}</p>
          <p className="text-xs text-muted-foreground">Requested</p>
        </div>
        <div className={`p-3 rounded-lg ${currentStyle.badgeClass}`}>
          <p className="text-lg font-semibold">{activeRequest.matched_volume}</p>
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
          <span className={currentStyle.textClass}>{currentProgress.fillPercentage}%</span>
        </div>
        <Progress value={currentProgress.fillPercentage} className={`h-2.5 ${currentStyle.progressClass}`} />
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
              currentProgress.projectedFillPercentage >= 100 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-primary'
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
          onClick={onProposeMatch}
          disabled={selectedSupplyCount === 0 || isProposeLoading || validationIssues.length > 0}
        >
          {isProposeLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Propose Match ({selectedSupplyCount})
          {validationIssues.length > 0 && <span className="ml-2 text-xs opacity-80">(Issues must be fixed)</span>}
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
              onClick={onMarkFulfilled}
              disabled={isStatusUpdateLoading}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark Fulfilled
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="text-xs" onClick={onReopen} disabled={isStatusUpdateLoading}>
              <RotateCcw className="w-3 h-3 mr-1" />
              Reopen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
