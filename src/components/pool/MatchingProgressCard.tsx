import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp 
} from 'lucide-react';
import { type PoolRequest } from '@/hooks/usePoolRequests';
import {
  calculateMatchingProgress,
  getMatchingProgressStatus,
  getProgressStatusStyle,
  type MatchingProgress,
} from '@/lib/pool-request-lifecycle';

interface MatchingProgressCardProps {
  request: PoolRequest;
  selectedHeads?: number;
  showSelection?: boolean;
  compact?: boolean;
}

export function MatchingProgressCard({ 
  request, 
  selectedHeads = 0, 
  showSelection = false,
  compact = false 
}: MatchingProgressCardProps) {
  const progress = calculateMatchingProgress(
    request.required_volume,
    request.matched_volume,
    selectedHeads
  );
  const progressStatus = getMatchingProgressStatus(progress);
  const statusStyle = getProgressStatusStyle(progressStatus);

  const getStatusIcon = () => {
    switch (progressStatus) {
      case 'fulfilled':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'near-complete':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'not-started':
        return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = () => {
    switch (progressStatus) {
      case 'fulfilled':
        return 'Fulfilled';
      case 'near-complete':
        return 'Near Complete';
      case 'partial':
        return 'Partial';
      case 'at-risk':
        return 'At Risk';
      case 'not-started':
        return 'Not Started';
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div className="flex-1">
            <Progress 
              value={progress.fillPercentage} 
              className={`h-2 ${statusStyle.progressClass}`}
            />
          </div>
          <span className={`text-sm font-semibold ${statusStyle.textClass}`}>
            {progress.fillPercentage}%
          </span>
        </div>
        
        {/* Metrics row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progress.matchedVolume} / {progress.requestedVolume} heads</span>
          <Badge variant="outline" className={`text-xs ${statusStyle.badgeClass}`}>
            {getStatusLabel()}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Matching Progress</CardTitle>
          <Badge variant="outline" className={statusStyle.badgeClass}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusLabel()}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Fill Progress</span>
            <span className={`font-semibold ${statusStyle.textClass}`}>
              {progress.fillPercentage}%
            </span>
          </div>
          <Progress 
            value={progress.fillPercentage} 
            className={`h-3 ${statusStyle.progressClass}`}
          />
        </div>

        {/* Volume Metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-semibold text-foreground">
              {progress.requestedVolume}
            </p>
            <p className="text-xs text-muted-foreground">Requested</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className={`text-lg font-semibold ${statusStyle.textClass}`}>
              {progress.matchedVolume}
            </p>
            <p className="text-xs text-muted-foreground">Matched</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className={`text-lg font-semibold ${progress.remainingVolume === 0 ? 'text-emerald-600' : 'text-foreground'}`}>
              {progress.remainingVolume}
            </p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>

        {/* Selection Preview */}
        {showSelection && selectedHeads > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">With Selection</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Selected</span>
                <span className="text-sm font-medium text-primary">+{selectedHeads} heads</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Total</span>
                <span className="text-sm font-medium">
                  {progress.matchedVolume + selectedHeads} heads
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Remaining</span>
                <span className={`text-sm font-medium ${
                  progress.remainingVolume - selectedHeads <= 0 ? 'text-emerald-600' : ''
                }`}>
                  {Math.max(0, progress.remainingVolume - selectedHeads)} heads
                </span>
              </div>
              {/* Preview progress bar */}
              <div className="mt-2">
                <Progress 
                  value={progress.projectedFillPercentage} 
                  className={`h-2 ${
                    progress.projectedFillPercentage >= 100 
                      ? '[&>div]:bg-emerald-500' 
                      : '[&>div]:bg-primary'
                  }`}
                />
                <p className="text-xs text-right mt-1 text-muted-foreground">
                  Projected: {progress.projectedFillPercentage}%
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Inline progress display for list views
 */
interface MatchingProgressInlineProps {
  request: PoolRequest;
}

export function MatchingProgressInline({ request }: MatchingProgressInlineProps) {
  const progress = calculateMatchingProgress(
    request.required_volume,
    request.matched_volume
  );
  const progressStatus = getMatchingProgressStatus(progress);
  const statusStyle = getProgressStatusStyle(progressStatus);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {progress.matchedVolume} / {progress.requestedVolume}
        </span>
        <span className={statusStyle.textClass}>{progress.fillPercentage}%</span>
      </div>
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${statusStyle.barClass}`}
          style={{ width: `${progress.fillPercentage}%` }}
        />
      </div>
    </div>
  );
}
