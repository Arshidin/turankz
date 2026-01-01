/**
 * RELEVANT MARKET SIGNALS
 * 
 * Informational component showing market signals potentially relevant to farmer's batches.
 * Read-only, no commitments, no MPK identities exposed.
 * 
 * Matching logic:
 * - Region overlap
 * - Delivery period overlap
 * - Cattle category (grade/breed) compatibility
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAggregatedDemand } from '@/hooks/useAggregatedDemand';
import { useBatches } from '@/hooks/useBatches';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCurrentFarmer } from '@/hooks/useCurrentFarmer';
import { 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Scale, 
  Info,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RelevantSignal {
  target_week: string;
  regions: string[];
  required_grade: string;
  total_volume: number;
  total_matched: number;
  request_count: number;
  weight_min: number | null;
  weight_max: number | null;
  age_min: number | null;
  age_max: number | null;
  matchReasons: string[];
  relevanceScore: number;
}

export function RelevantMarketSignals() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { data: farmer } = useCurrentFarmer();
  const { data: demands, isLoading: demandsLoading } = useAggregatedDemand();
  const { data: batches = [], isLoading: batchesLoading } = useBatches();

  // Filter batches for current farmer
  const farmerBatches = useMemo(() => {
    if (!user?.id) return [];
    return batches.filter(b => b.user_id === user.id && b.status !== 'draft');
  }, [batches, user?.id]);

  // Calculate relevant signals by matching farmer batches with aggregated demand
  const relevantSignals = useMemo(() => {
    if (!demands || !farmerBatches.length) return [];

    const signals: RelevantSignal[] = [];

    demands.forEach(demand => {
      const matchReasons: string[] = [];
      let relevanceScore = 0;

      // Check if any farmer batch matches this demand signal
      const hasMatch = farmerBatches.some(batch => {
        let batchMatches = false;
        const reasons: string[] = [];

        // 1. Region matching
        const regionMatch = demand.regions.includes('Any') || 
                          demand.regions.includes(batch.region) ||
                          batch.region && demand.regions.some(r => r === batch.region);
        
        if (regionMatch) {
          reasons.push('region');
          relevanceScore += 3;
          batchMatches = true;
        }

        // 2. Delivery period overlap
        // Note: Aggregated demand doesn't include target_delivery_period, so we'll
        // use a more lenient matching - if batch has a delivery period, it's potentially relevant
        // The actual matching will happen at the admin level with full request details
        if (batch.delivery_period) {
          // Consider all batches with delivery periods as potentially relevant
          // This is informational only - actual matching requires full request details
          reasons.push('delivery_period');
          relevanceScore += 1;
          batchMatches = true;
        }

        // 3. Grade/category matching
        const gradeMatch = 
          demand.required_grade === 'Any' ||
          demand.required_grade === batch.grade ||
          (demand.required_grade === 'A/B' && ['A', 'B'].includes(batch.grade)) ||
          (demand.required_grade === 'B/C' && ['B', 'C'].includes(batch.grade));
        
        if (gradeMatch) {
          reasons.push('grade');
          relevanceScore += 2;
          batchMatches = true;
        }

        // 4. Weight range overlap (if specified)
        if (demand.weight_min !== null || demand.weight_max !== null) {
          const batchWeight = batch.avg_weight || batch.weight_min || batch.weight_max;
          if (batchWeight) {
            const weightMatch = 
              (demand.weight_min === null || batchWeight >= demand.weight_min) &&
              (demand.weight_max === null || batchWeight <= demand.weight_max);
            
            if (weightMatch) {
              reasons.push('weight');
              relevanceScore += 1;
            }
          }
        }

        // 5. Age range overlap (if specified)
        if (demand.age_min !== null || demand.age_max !== null) {
          const batchAge = batch.age_min || batch.age_max;
          if (batchAge) {
            const ageMatch = 
              (demand.age_min === null || batchAge >= demand.age_min) &&
              (demand.age_max === null || batchAge <= demand.age_max);
            
            if (ageMatch) {
              reasons.push('age');
              relevanceScore += 1;
            }
          }
        }

        if (batchMatches && reasons.length > 0) {
          matchReasons.push(...reasons);
        }

        return batchMatches && reasons.length >= 2; // At least 2 criteria must match
      });

      if (hasMatch && relevanceScore > 0) {
        signals.push({
          ...demand,
          matchReasons: [...new Set(matchReasons)], // Remove duplicates
          relevanceScore,
        });
      }
    });

    // Sort by relevance score (highest first)
    return signals.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5); // Top 5 most relevant
  }, [demands, farmerBatches]);

  const isLoading = demandsLoading || batchesLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relevant Market Signals</CardTitle>
          <CardDescription>Market signals potentially relevant to your farm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!farmerBatches.length) {
    return null; // Don't show if farmer has no batches
  }

  if (relevantSignals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Relevant Market Signals</CardTitle>
          <CardDescription>Market signals potentially relevant to your farm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Info className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="font-medium text-foreground mb-1">No relevant signals found</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Market signals will appear here when they match your farm's region, delivery period, and cattle category.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRemainingDemand = relevantSignals.reduce(
    (sum, s) => sum + (s.total_volume - s.total_matched),
    0
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base mb-1">Relevant Market Signals</CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Market signals potentially relevant to your farm
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-semibold text-primary">
              {totalRemainingDemand.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">heads needed</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3">
          {relevantSignals.map((signal, idx) => {
            const remaining = signal.total_volume - signal.total_matched;
            const fulfillment = signal.total_volume > 0
              ? Math.round((signal.total_matched / signal.total_volume) * 100)
              : 0;

            return (
              <div
                key={`${signal.target_week}-${signal.required_grade}-${idx}`}
                className="p-4 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  {/* Left: Key info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{signal.target_week}</span>
                      <Badge variant="outline" className="text-xs">
                        Grade {signal.required_grade}
                      </Badge>
                      {signal.matchReasons.length > 0 && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          {signal.matchReasons.length} match{signal.matchReasons.length > 1 ? 'es' : ''}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{signal.regions.join(', ')}</span>
                    </div>
                    {signal.matchReasons.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>
                          Matches: {signal.matchReasons.map(r => {
                            const labels: Record<string, string> = {
                              region: 'Region',
                              delivery_period: 'Delivery period',
                              grade: 'Grade',
                              weight: 'Weight',
                              age: 'Age',
                            };
                            return labels[r] || r;
                          }).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Volume */}
                  <div className="text-right shrink-0">
                    <p className="text-xl font-semibold text-primary">
                      {remaining.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">heads needed</p>
                  </div>
                </div>

                {/* Fulfillment progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Market fulfillment</span>
                    <span>{fulfillment}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${fulfillment}%` }}
                    />
                  </div>
                </div>

                {/* Criteria row */}
                <div className="flex flex-wrap gap-2">
                  {(signal.weight_min || signal.weight_max) && (
                    <Badge variant="secondary" className="text-xs">
                      <Scale className="h-3 w-3 mr-1" />
                      {signal.weight_min ?? '—'}–{signal.weight_max ?? '—'} kg
                    </Badge>
                  )}
                  {(signal.age_min || signal.age_max) && (
                    <Badge variant="secondary" className="text-xs">
                      {signal.age_min ?? '—'}–{signal.age_max ?? '—'} mo
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {signal.request_count} buyer{signal.request_count > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

