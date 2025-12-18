import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Lock, Award, Clock, BarChart3, TrendingUp, Info } from 'lucide-react';
import { PremiumBreakdown, PremiumEligibility } from '@/lib/premium-eligibility';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PremiumBreakdownCardProps {
  breakdown: PremiumBreakdown;
  isLocked?: boolean;
  lockedAt?: string | null;
  compact?: boolean;
}

const PREMIUM_ICONS: Record<string, React.ReactNode> = {
  standard: <Award className="h-4 w-4" />,
  predictability: <Clock className="h-4 w-4" />,
  volume_consistency: <BarChart3 className="h-4 w-4" />,
  reliability: <TrendingUp className="h-4 w-4" />,
};

const PREMIUM_LABELS: Record<string, string> = {
  standard: 'Standard Compliance',
  predictability: 'Predictability',
  volume_consistency: 'Volume Consistency',
  reliability: 'Reliability',
};

function PremiumRow({ premium }: { premium: PremiumEligibility }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{PREMIUM_ICONS[premium.type]}</span>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{PREMIUM_LABELS[premium.type]}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                  {premium.levelName}
                  <Info className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">{premium.reason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {premium.eligible ? (
          <>
            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              +{premium.value} ₸/kg
            </Badge>
          </>
        ) : (
          <Badge variant="secondary" className="opacity-60">
            <XCircle className="h-3 w-3 mr-1" />
            +0 ₸/kg
          </Badge>
        )}
      </div>
    </div>
  );
}

export function PremiumBreakdownCard({ breakdown, isLocked, lockedAt, compact }: PremiumBreakdownCardProps) {
  if (compact) {
    return (
      <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reference Price</span>
          <span className="font-medium">{breakdown.basePricePerKg} ₸/kg</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Premium</span>
          <span className="font-medium text-emerald-600">+{breakdown.totalPremium} ₸/kg</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-medium">Indicative Price</span>
          <span className="font-bold text-lg">{breakdown.totalPricePerKg} ₸/kg</span>
        </div>
        {isLocked && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Lock className="h-3 w-3" />
            <span>Locked</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Indicative Price Breakdown</CardTitle>
          {isLocked && (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Reference Price */}
        <div className="flex items-center justify-between py-2 bg-muted/50 rounded-lg px-3">
          <span className="font-medium">Reference Price (from Grid)</span>
          <span className="font-semibold">{breakdown.basePricePerKg} ₸/kg</span>
        </div>

        {/* Premium Rows */}
        <div className="divide-y">
          {breakdown.premiums.map((premium) => (
            <PremiumRow key={premium.type} premium={premium} />
          ))}
        </div>

        <Separator className="my-2" />

        {/* Total Premium */}
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground">Total Premiums</span>
          <span className="font-medium text-emerald-600">+{breakdown.totalPremium} ₸/kg</span>
        </div>

        {/* Final Price - now labeled as Indicative */}
        <div className="flex items-center justify-between py-3 bg-primary/5 rounded-lg px-3 border border-primary/10">
          <span className="font-semibold">Indicative Price per kg</span>
          <span className="font-bold text-xl">{breakdown.totalPricePerKg} ₸/kg</span>
        </div>

        {isLocked && lockedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Premium eligibility locked on {new Date(lockedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}