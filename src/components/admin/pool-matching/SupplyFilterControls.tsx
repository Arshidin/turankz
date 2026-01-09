import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Award, Wand2, Filter } from 'lucide-react';
import { StandardStatus } from '@/hooks/useAdminBatches';

interface SupplyFilterControlsProps {
  // Readiness filter
  readinessFilter: 'all' | 'confirmed' | 'soft_committed' | 'forecast';
  onReadinessFilterChange: (filter: 'all' | 'confirmed' | 'soft_committed' | 'forecast') => void;

  // Criteria matching filter
  showOnlyMatching: boolean;
  onShowOnlyMatchingChange: (show: boolean) => void;
  hasCriteria: boolean;
  criteriaDisplay: string[];
  matchCounts: {
    full: number;
    partial: number;
    none: number;
  };

  // Standard status assignment
  selectedBatchCount: number;
  onBulkStandardStatus: (status: StandardStatus) => void;
  onAutoCalculate: () => void;
  autoCalculateLoading: boolean;

  // Request info
  requestNumber?: string;
  requiredGrade?: string;
  regions?: string[];
  targetDeliveryPeriod?: string | null;
  targetWeek?: string | null;
}

export function SupplyFilterControls({
  readinessFilter,
  onReadinessFilterChange,
  showOnlyMatching,
  onShowOnlyMatchingChange,
  hasCriteria,
  criteriaDisplay,
  matchCounts,
  selectedBatchCount,
  onBulkStandardStatus,
  onAutoCalculate,
  autoCalculateLoading,
  requestNumber,
  requiredGrade,
  regions,
  targetDeliveryPeriod,
  targetWeek,
}: SupplyFilterControlsProps) {
  return (
    <div className="space-y-3">
      {/* Readiness Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Readiness:</span>
        <div className="flex gap-1">
          <Button
            variant={readinessFilter === 'all' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => onReadinessFilterChange('all')}
          >
            All
          </Button>
          <Button
            variant={readinessFilter === 'confirmed' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => onReadinessFilterChange('confirmed')}
          >
            Confirmed
          </Button>
          <Button
            variant={readinessFilter === 'soft_committed' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => onReadinessFilterChange('soft_committed')}
          >
            Soft
          </Button>
          <Button
            variant={readinessFilter === 'forecast' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => onReadinessFilterChange('forecast')}
          >
            Forecast
          </Button>
        </div>
      </div>

      {/* Standard Status Assignment Controls */}
      {selectedBatchCount > 0 && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-foreground">
                {selectedBatchCount} batch{selectedBatchCount > 1 ? 'es' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Assign:</span>
              <Select onValueChange={(value) => onBulkStandardStatus(value as StandardStatus)}>
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
                onClick={onAutoCalculate}
                disabled={autoCalculateLoading}
              >
                <Wand2 className="h-3 w-3" />
                {autoCalculateLoading ? 'Calculating...' : 'Auto-Calculate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info and Criteria */}
      {requestNumber && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Filtered for {requestNumber}: Grade {requiredGrade} · {regions?.join(', ')}
            {targetDeliveryPeriod && (
              <> · Delivery: {targetDeliveryPeriod.replace('_', ' ')}</>
            )}
            {targetWeek && (
              <> · Week: {targetWeek}</>
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
                    onCheckedChange={(checked) => onShowOnlyMatchingChange(!!checked)}
                    className="h-3 w-3"
                  />
                  <span className="text-muted-foreground">Show matching only</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
