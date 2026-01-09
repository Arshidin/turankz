import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PremiumBadge } from '@/components/premium';
import { Target, AlertTriangle } from 'lucide-react';
import { SupplyBlock } from './types';
import { getReadinessBadge } from './helpers';
import { MatchLevel } from '@/lib/livestock-criteria';
import { MatchConfidenceIndicator } from '@/components/matching/MatchConfidenceIndicator';

interface SupplyBlockListProps {
  supplyBlocks: SupplyBlock[];
  selectedBatchIds: Set<string>;
  onToggleSelection: (id: string) => void;
  isLoading?: boolean;
  hasActiveRequest: boolean;
}

export function SupplyBlockList({
  supplyBlocks,
  selectedBatchIds,
  onToggleSelection,
  isLoading,
  hasActiveRequest,
}: SupplyBlockListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!hasActiveRequest) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="w-10 h-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">Select a purchase request to view matching supply</p>
      </div>
    );
  }

  if (supplyBlocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="w-10 h-10 text-status-forecast/50 mb-3" />
        <p className="text-sm text-muted-foreground">No matching supply available for this request</p>
        <p className="text-xs text-muted-foreground mt-1">Consider adjusting region or grade requirements</p>
      </div>
    );
  }

  // Group batches by match confidence level (Sprint 6 improvement)
  const grouped = supplyBlocks.reduce((acc, block) => {
    // Use new matchConfidence if available, fallback to legacy matchLevel
    let level: 'perfect' | 'good' | 'acceptable' | 'poor' | 'none';

    if (block.matchConfidence) {
      level = block.matchConfidence.level;
    } else {
      // Fallback to legacy matchLevel
      const legacyLevel = block.matchLevel || 'none';
      level = legacyLevel === 'full' ? 'perfect' : legacyLevel === 'partial' ? 'acceptable' : 'none';
    }

    if (!acc[level]) acc[level] = [];
    acc[level].push(block);
    return acc;
  }, {} as Record<'perfect' | 'good' | 'acceptable' | 'poor' | 'none', typeof supplyBlocks>);

  const sections: Array<{
    level: 'perfect' | 'good' | 'acceptable' | 'poor' | 'none';
    label: string;
    description: string;
    items: typeof supplyBlocks;
  }> = [];

  if (grouped['perfect']) {
    sections.push({
      level: 'perfect',
      label: 'Perfect Match',
      description: '90-100 points: All criteria match perfectly',
      items: grouped['perfect'].sort((a, b) => (b.matchConfidence?.score || 0) - (a.matchConfidence?.score || 0)),
    });
  }
  if (grouped['good']) {
    sections.push({
      level: 'good',
      label: 'Good Match',
      description: '70-89 points: Strong match with minor variations',
      items: grouped['good'].sort((a, b) => (b.matchConfidence?.score || 0) - (a.matchConfidence?.score || 0)),
    });
  }
  if (grouped['acceptable']) {
    sections.push({
      level: 'acceptable',
      label: 'Acceptable Match',
      description: '50-69 points: Review carefully before matching',
      items: grouped['acceptable'].sort((a, b) => (b.matchConfidence?.score || 0) - (a.matchConfidence?.score || 0)),
    });
  }
  if (grouped['poor']) {
    sections.push({
      level: 'poor',
      label: 'Poor Match',
      description: '0-49 points: Significant mismatches (admin override)',
      items: grouped['poor'].sort((a, b) => (b.matchConfidence?.score || 0) - (a.matchConfidence?.score || 0)),
    });
  }
  if (grouped['none']) {
    sections.push({
      level: 'none',
      label: 'No Match Data',
      description: 'Match confidence not calculated',
      items: grouped['none'],
    });
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.level} className="space-y-2">
          <div className="flex items-center gap-2 px-1 pb-1 border-b border-border/50">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
              {section.label}
            </h4>
            <Badge
              variant={
                section.level === 'perfect' || section.level === 'good'
                  ? 'default'
                  : section.level === 'acceptable'
                  ? 'secondary'
                  : 'outline'
              }
              className={`text-xs h-5 px-1.5 ${
                section.level === 'perfect'
                  ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                  : section.level === 'good'
                  ? 'bg-blue-500/15 text-blue-700 border-blue-500/30'
                  : section.level === 'acceptable'
                  ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                  : section.level === 'poor'
                  ? 'bg-red-500/15 text-red-700 border-red-500/30'
                  : ''
              }`}
            >
              {section.items.length}
            </Badge>
            <span className="text-xs text-muted-foreground flex-1">{section.description}</span>
          </div>
          <div className="space-y-2">
            {section.items.map((block) => (
              <div
                key={block.id}
                className={`p-3 rounded-lg border transition-colors ${
                  selectedBatchIds.has(block.id)
                    ? 'border-primary bg-primary/5'
                    : section.level === 'poor' || section.level === 'none'
                    ? 'border-border bg-muted/30 opacity-60'
                    : section.level === 'perfect'
                    ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5'
                    : section.level === 'good'
                    ? 'border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={selectedBatchIds.has(block.id)} onCheckedChange={() => onToggleSelection(block.id)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{block.batchRef}</span>
                        <PremiumBadge status={block.standard_status || 'non_standard'} size="sm" />
                        {/* Match confidence badge - Sprint 6 Task 9.5.2 */}
                        {block.matchConfidence && (
                          <MatchConfidenceIndicator confidence={block.matchConfidence} variant="badge" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">{getReadinessBadge(block.readiness)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">{block.region}</span>
                        <span>·</span>
                        <span>Grade {block.grade}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground justify-end">
                        {block.available_heads < block.heads ? (
                          <span className="font-medium text-foreground">
                            {block.available_heads} / {block.heads} avail.
                          </span>
                        ) : (
                          <span className="font-medium text-foreground">{block.heads} heads</span>
                        )}
                        {block.matched_heads > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-muted-foreground">{block.matched_heads} matched</span>
                          </>
                        )}
                      </div>
                      {(block.delivery_period || block.target_week) && (
                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                          {block.delivery_period && <span className="text-xs">{block.delivery_period.replace('_', ' ')}</span>}
                          {block.target_week && (
                            <>
                              {block.delivery_period && <span>·</span>}
                              <span className="text-xs">{block.target_week}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Show batch characteristics if available */}
                    {(block.breed || block.gender || block.age_min || block.weight_min) && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {block.breed && (
                          <Badge variant="outline" className="text-xs font-normal py-0">
                            {block.breed}
                          </Badge>
                        )}
                        {block.gender && (
                          <Badge variant="outline" className="text-xs font-normal py-0">
                            {block.gender}
                          </Badge>
                        )}
                        {(block.age_min || block.age_max) && (
                          <Badge variant="outline" className="text-xs font-normal py-0">
                            {block.age_min || '–'}–{block.age_max || '–'} mo
                          </Badge>
                        )}
                        {(block.weight_min || block.weight_max) && (
                          <Badge variant="outline" className="text-xs font-normal py-0">
                            {block.weight_min || '–'}–{block.weight_max || '–'} kg
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
