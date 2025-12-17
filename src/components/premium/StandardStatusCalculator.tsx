import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { calculateStandardStatus, getStandardStatusDisplay, type StandardStatus } from '@/lib/standard-status';
import { PremiumBadge } from './PremiumBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BatchCharacteristics {
  breed: string | null;
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  weight_min: number | null;
  weight_max: number | null;
}

interface StandardStatusCalculatorProps {
  batch: BatchCharacteristics;
  currentStatus?: string;
  showCard?: boolean;
}

export function StandardStatusCalculator({ batch, currentStatus, showCard = true }: StandardStatusCalculatorProps) {
  const result = useMemo(() => calculateStandardStatus(batch), [batch]);
  const displayInfo = getStandardStatusDisplay(result.status);
  
  const isCurrentDifferent = currentStatus && currentStatus !== result.status;

  const content = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PremiumBadge status={result.status} premiumValue={displayInfo.premium} showValue />
          {isCurrentDifferent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-amber-600 border-amber-500/50 text-xs gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Recalculated
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Current status differs from calculated. Admin may update.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Homogeneity Status */}
      <div className="flex items-center gap-2 text-xs">
        {result.isHomogeneous ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-status-confirmed" />
            <span className="text-status-confirmed">Homogeneous batch</span>
          </>
        ) : (
          <>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Not homogeneous</span>
          </>
        )}
      </div>

      {/* Adjustments */}
      {result.adjustments.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Price Adjustments:</p>
          {result.adjustments.map((adj, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{adj.category}: {adj.reason}</span>
              <span className={adj.value < 0 ? 'text-destructive' : 'text-foreground'}>
                {adj.value > 0 ? '+' : ''}{adj.value} ₸/kg
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Reasons */}
      <div className="pt-2 border-t">
        <p className="text-xs font-medium text-muted-foreground mb-1">Status Criteria:</p>
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {result.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-1">
              <span className="text-primary">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  if (!showCard) return content;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Standard Status Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
