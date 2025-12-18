import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Lock, Calculator, RefreshCw } from 'lucide-react';
import { useCalculatePremiumEligibility, useLockedPremiumBreakdown } from '@/hooks/usePremiumEligibility';
import { PremiumBreakdownCard } from '@/components/premium/PremiumBreakdownCard';
import { PremiumBreakdown } from '@/lib/premium-eligibility';

interface MatchingPremiumPanelProps {
  matchId: string;
  batchId: string;
  farmerId: string;
  isFinalized: boolean;
  onCalculateComplete?: (breakdown: PremiumBreakdown) => void;
}

export function MatchingPremiumPanel({
  matchId,
  batchId,
  farmerId,
  isFinalized,
  onCalculateComplete,
}: MatchingPremiumPanelProps) {
  const [calculatedBreakdown, setCalculatedBreakdown] = useState<PremiumBreakdown | null>(null);

  // For finalized matches, use locked breakdown
  const { data: lockedBreakdown, isLoading: loadingLocked } = useLockedPremiumBreakdown(
    isFinalized ? matchId : null
  );

  // For active matches, calculate eligibility
  const { data: liveBreakdown, isLoading: loadingLive, refetch } = useCalculatePremiumEligibility(
    !isFinalized ? batchId : null,
    !isFinalized ? farmerId : null
  );

  useEffect(() => {
    if (liveBreakdown && !isFinalized) {
      setCalculatedBreakdown(liveBreakdown);
      onCalculateComplete?.(liveBreakdown);
    }
  }, [liveBreakdown, isFinalized, onCalculateComplete]);

  const isLoading = isFinalized ? loadingLocked : loadingLive;
  const breakdown = isFinalized ? lockedBreakdown : calculatedBreakdown;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Premium Eligibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Premium Eligibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Unable to calculate premium eligibility.</p>
            {!isFinalized && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <PremiumBreakdownCard
      breakdown={breakdown}
      isLocked={isFinalized}
      lockedAt={isFinalized ? new Date().toISOString() : null}
    />
  );
}

// Compact inline version for tables
interface InlinePremiumSummaryProps {
  matchId: string;
  isFinalized: boolean;
  totalPricePerKg?: number | null;
  totalPremium?: number | null;
  premiumLocked?: boolean;
}

export function InlinePremiumSummary({
  matchId,
  isFinalized,
  totalPricePerKg,
  totalPremium,
  premiumLocked,
}: InlinePremiumSummaryProps) {
  if (!isFinalized || totalPricePerKg === null || totalPricePerKg === undefined) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Calculator className="h-3 w-3" />
        Pending
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="default" className="gap-1">
        {totalPricePerKg} ₸/kg
      </Badge>
      {totalPremium !== null && totalPremium !== undefined && totalPremium > 0 && (
        <Badge variant="secondary" className="gap-1 text-emerald-600">
          +{totalPremium}
        </Badge>
      )}
      {premiumLocked && (
        <Lock className="h-3 w-3 text-muted-foreground" />
      )}
    </div>
  );
}