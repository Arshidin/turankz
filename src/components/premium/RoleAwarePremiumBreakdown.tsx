import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Lock, Award, Clock, BarChart3, TrendingUp, Info, Eye, EyeOff } from 'lucide-react';
import { PremiumBreakdown, PremiumEligibility } from '@/lib/premium-eligibility';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRole } from '@/contexts/RoleContext';

interface RoleAwarePremiumBreakdownProps {
  breakdown: PremiumBreakdown;
  isLocked?: boolean;
  lockedAt?: string | null;
  compact?: boolean;
  // For farmer view - show detailed reasons
  showDetailedReasons?: boolean;
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

// MPK-visible labels (aggregated, no farmer-specific scoring)
const MPK_PREMIUM_LABELS: Record<string, string> = {
  standard: 'Quality Premium',
  predictability: 'Timing Premium',
  volume_consistency: 'Supplier Premium',
  reliability: 'Supplier Premium', // Combined with volume_consistency for MPK view
};

// Premiums visible to each role
const ROLE_VISIBLE_PREMIUMS: Record<string, string[]> = {
  admin: ['standard', 'predictability', 'volume_consistency', 'reliability'],
  farmer: ['standard', 'predictability', 'volume_consistency', 'reliability'],
  mpk: ['standard', 'predictability'], // MPK sees aggregated supplier premium separately
};

// Premiums that reveal farmer-specific scoring (hidden details for MPK)
const FARMER_SENSITIVE_PREMIUMS = ['reliability', 'volume_consistency'];

function PremiumRowFarmer({ premium }: { premium: PremiumEligibility }) {
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
                {premium.eligible && (
                  <p className="text-xs text-emerald-600 mt-1">✓ You earned this premium!</p>
                )}
                {!premium.eligible && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tip: {getImprovementTip(premium.type)}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {premium.eligible ? (
          <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            +{premium.value} ₸/kg
          </Badge>
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

function PremiumRowMpk({ premium, aggregatedValue }: { premium: PremiumEligibility; aggregatedValue?: number }) {
  const displayValue = aggregatedValue ?? premium.value;
  const label = MPK_PREMIUM_LABELS[premium.type];
  
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{PREMIUM_ICONS[premium.type]}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Badge variant={displayValue > 0 ? 'default' : 'secondary'} className={displayValue > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'opacity-60'}>
        +{displayValue} ₸/kg
      </Badge>
    </div>
  );
}

function PremiumRowAdmin({ premium }: { premium: PremiumEligibility }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{PREMIUM_ICONS[premium.type]}</span>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{PREMIUM_LABELS[premium.type]}</span>
          <span className="text-xs text-muted-foreground">
            {premium.levelName} - {premium.reason.slice(0, 50)}
          </span>
        </div>
      </div>
      <Badge variant={premium.eligible ? 'default' : 'secondary'} className={premium.eligible ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'opacity-60'}>
        {premium.eligible ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
        +{premium.eligible ? premium.value : 0} ₸/kg
      </Badge>
    </div>
  );
}

function getImprovementTip(premiumType: string): string {
  switch (premiumType) {
    case 'standard':
      return 'Ensure your batch meets all grid criteria for age, weight, and breed.';
    case 'predictability':
      return 'Confirm your batch before the lock date and avoid post-confirmation edits.';
    case 'volume_consistency':
      return 'Fulfill more batches consistently to increase your supplier tier.';
    case 'reliability':
      return 'Maintain a high confirmation rate to improve your grading.';
    default:
      return 'Continue meeting market requirements.';
  }
}

export function RoleAwarePremiumBreakdown({ 
  breakdown, 
  isLocked, 
  lockedAt, 
  compact,
  showDetailedReasons = true,
}: RoleAwarePremiumBreakdownProps) {
  const { role } = useRole();

  // Compact view for all roles
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
        {/* Total Price removed - show only components to avoid price-setting appearance */}
        {isLocked && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Lock className="h-3 w-3" />
            <span>Locked</span>
          </div>
        )}
      </div>
    );
  }

  // Farmer view - full details with improvement tips
  if (role === 'farmer') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Your Indicative Price Breakdown</CardTitle>
            {isLocked && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Final
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 bg-muted/50 rounded-lg px-3">
            <span className="font-medium">Reference Price (Market Grid)</span>
            <span className="font-semibold">{breakdown.basePricePerKg} ₸/kg</span>
          </div>

          <div className="divide-y">
            {breakdown.premiums.map((premium) => (
              <PremiumRowFarmer key={premium.type} premium={premium} />
            ))}
          </div>

          <Separator className="my-2" />

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Total Premiums Earned</span>
            <span className="font-medium text-emerald-600">+{breakdown.totalPremium} ₸/kg</span>
          </div>

          {/* Disclaimer - Reference pricing only */}
          <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Reference pricing only.</strong> These prices are indicative market benchmarks. TURAN does not set, enforce, or guarantee transaction prices. Actual prices are negotiated between parties.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // MPK view - aggregated, no farmer-specific scoring
  if (role === 'mpk') {
    // Aggregate reliability + volume_consistency into "Supplier Premium"
    const standardPremium = breakdown.premiums.find(p => p.type === 'standard');
    const predictabilityPremium = breakdown.premiums.find(p => p.type === 'predictability');
    const reliabilityPremium = breakdown.premiums.find(p => p.type === 'reliability');
    const volumeConsistencyPremium = breakdown.premiums.find(p => p.type === 'volume_consistency');
    
    const supplierPremiumValue = 
      (reliabilityPremium?.eligible ? reliabilityPremium.value : 0) + 
      (volumeConsistencyPremium?.eligible ? volumeConsistencyPremium.value : 0);

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Price Summary</CardTitle>
            {isLocked && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Confirmed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 bg-muted/50 rounded-lg px-3">
            <span className="font-medium">Reference Price</span>
            <span className="font-semibold">{breakdown.basePricePerKg} ₸/kg</span>
          </div>

          <div className="divide-y">
            {standardPremium && (
              <PremiumRowMpk premium={standardPremium} />
            )}
            {predictabilityPremium && (
              <PremiumRowMpk premium={predictabilityPremium} />
            )}
            {/* Aggregated supplier premium - hides farmer-specific scoring */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground"><TrendingUp className="h-4 w-4" /></span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Supplier Premium</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Aggregated supplier-level premium</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Badge variant={supplierPremiumValue > 0 ? 'default' : 'secondary'} className={supplierPremiumValue > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'opacity-60'}>
                +{supplierPremiumValue} ₸/kg
              </Badge>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Disclaimer - Reference pricing only */}
          <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Reference pricing only.</strong> These prices are indicative market benchmarks. TURAN does not set, enforce, or guarantee transaction prices. Actual prices are negotiated between parties.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Admin view - full details
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-base">Full Indicative Price Breakdown</CardTitle>
            {isLocked && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
        </div>
      </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 bg-muted/50 rounded-lg px-3">
            <span className="font-medium">Reference Price (Grid)</span>
            <span className="font-semibold">{breakdown.basePricePerKg} ₸/kg</span>
        </div>

        <div className="divide-y">
          {breakdown.premiums.map((premium) => (
            <PremiumRowAdmin key={premium.type} premium={premium} />
          ))}
        </div>

        <Separator className="my-2" />

        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground">Total Premiums</span>
          <span className="font-medium text-emerald-600">+{breakdown.totalPremium} ₸/kg</span>
        </div>

        {/* Disclaimer - Reference pricing only */}
        <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Reference pricing only.</strong> These prices are indicative market benchmarks. TURAN does not set, enforce, or guarantee transaction prices. Actual prices are negotiated between parties.
          </p>
        </div>

        {isLocked && lockedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Locked on {new Date(lockedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}