/**
 * PremiumProgressDashboard Component
 *
 * Sprint 9-10: Dashboard showing farmer's premium status and progress to next tier.
 * Provides clear visibility into:
 * - Current premium tier status
 * - Progress bars for each criterion
 * - Requirements to reach next tier
 * - Estimated income impact
 */

import {
  Award,
  TrendingUp,
  Package,
  Truck,
  Calendar,
  Target,
  ChevronRight,
  Info,
  Star,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  VOLUME_CONSISTENCY_TIERS,
  PREMIUM_TYPE_LABELS,
  DEFAULT_PREMIUM_VALUES,
  getNextVolumeConsistencyTier,
  calculateTierProgress,
  type VolumeConsistencyThreshold,
} from '@/lib/premium-config';

interface PremiumProgressDashboardProps {
  /** Number of fulfilled batches */
  fulfilledBatches: number;
  /** Delivery rate percentage (0-100) */
  deliveryRate: number;
  /** Months active on platform */
  monthsActive: number;
  /** Current farmer grading */
  farmerGrading: 'observer' | 'declared_supplier' | 'standard_supplier';
  /** Current standard status for latest batch */
  standardStatus?: 'non_standard' | 'standard' | 'high_standard';
  /** Average batch weight (for income estimation) */
  avgBatchWeight?: number;
  /** Language */
  lang?: 'en' | 'ru';
  /** Show compact version */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  platinum: { bg: 'bg-violet-500/10', text: 'text-violet-700', border: 'border-violet-500/30' },
  gold: { bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/30' },
  silver: { bg: 'bg-slate-400/10', text: 'text-slate-600', border: 'border-slate-400/30' },
  standard: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
};

const GRADING_LABELS: Record<string, { en: string; ru: string }> = {
  observer: { en: 'Observer', ru: 'Наблюдатель' },
  declared_supplier: { en: 'Declared Supplier', ru: 'Заявленный поставщик' },
  standard_supplier: { en: 'Standard Supplier', ru: 'Стандартный поставщик' },
};

export function PremiumProgressDashboard({
  fulfilledBatches,
  deliveryRate,
  monthsActive,
  farmerGrading,
  standardStatus,
  avgBatchWeight = 350,
  lang = 'ru',
  compact = false,
  className,
}: PremiumProgressDashboardProps) {
  const { currentTier, nextTier, requirements } = getNextVolumeConsistencyTier(
    fulfilledBatches,
    deliveryRate,
    monthsActive
  );

  const progress = calculateTierProgress(fulfilledBatches, deliveryRate, monthsActive);

  const t = lang === 'ru' ? {
    title: 'Ваш прогресс по премиям',
    subtitle: 'Отслеживайте свой путь к более высоким премиям',
    currentTier: 'Текущий уровень',
    nextTier: 'Следующий уровень',
    toReach: 'Для достижения',
    criteria: 'Критерии',
    batches: 'Партий',
    deliveryRate: 'Выполнение',
    monthsActive: 'Месяцев',
    needed: 'нужно',
    more: 'ещё',
    reliability: 'Надёжность',
    volumeConsistency: 'Стабильность объёмов',
    maxTier: 'Вы достигли максимального уровня!',
    potentialIncome: 'Потенциальный доход',
    perBatch: 'за партию',
    currentPremium: 'Текущая премия',
    nextPremium: 'Премия след. уровня',
    improvement: 'Улучшение',
    tips: 'Советы',
  } : {
    title: 'Your Premium Progress',
    subtitle: 'Track your path to higher premiums',
    currentTier: 'Current Tier',
    nextTier: 'Next Tier',
    toReach: 'To reach',
    criteria: 'Criteria',
    batches: 'Batches',
    deliveryRate: 'Delivery',
    monthsActive: 'Months',
    needed: 'needed',
    more: 'more',
    reliability: 'Reliability',
    volumeConsistency: 'Volume Consistency',
    maxTier: 'You have reached the maximum tier!',
    potentialIncome: 'Potential Income',
    perBatch: 'per batch',
    currentPremium: 'Current Premium',
    nextPremium: 'Next Tier Premium',
    improvement: 'Improvement',
    tips: 'Tips',
  };

  const currentColors = TIER_COLORS[currentTier.tierKey] || TIER_COLORS.standard;
  const nextColors = nextTier ? TIER_COLORS[nextTier.tierKey] : null;

  // Calculate current and potential premiums
  const currentVolumeConsistencyPremium = DEFAULT_PREMIUM_VALUES.volume_consistency[currentTier.tierKey as keyof typeof DEFAULT_PREMIUM_VALUES.volume_consistency] || 0;
  const nextVolumeConsistencyPremium = nextTier
    ? DEFAULT_PREMIUM_VALUES.volume_consistency[nextTier.tierKey as keyof typeof DEFAULT_PREMIUM_VALUES.volume_consistency] || 0
    : currentVolumeConsistencyPremium;

  const reliabilityPremium = DEFAULT_PREMIUM_VALUES.reliability[farmerGrading as keyof typeof DEFAULT_PREMIUM_VALUES.reliability] || 0;

  const currentTotalPremium = currentVolumeConsistencyPremium + reliabilityPremium;
  const potentialTotalPremium = nextVolumeConsistencyPremium + reliabilityPremium;
  const premiumImprovement = potentialTotalPremium - currentTotalPremium;

  // Estimated income impact
  const estimatedIncomeImprovement = premiumImprovement * avgBatchWeight;

  // Compact version
  if (compact) {
    return (
      <Card className={cn('border-primary/20', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', currentColors.bg)}>
                <Award className={cn('h-5 w-5', currentColors.text)} />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {lang === 'ru' ? currentTier.tierNameRu : currentTier.tierName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.volumeConsistency}: +{currentVolumeConsistencyPremium} ₸/kg
                </p>
              </div>
            </div>
            {nextTier && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t.nextTier}</p>
                <Badge variant="outline" className={cn('text-xs', nextColors?.bg, nextColors?.text, nextColors?.border)}>
                  {lang === 'ru' ? nextTier.tierNameRu : nextTier.tierName}
                </Badge>
              </div>
            )}
          </div>
          {nextTier && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{t.toReach}:</span>
                <span>{progress.overallProgress}%</span>
              </div>
              <Progress value={progress.overallProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full dashboard
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current & Next Tier */}
        <div className="flex items-stretch gap-4">
          {/* Current Tier */}
          <div className={cn('flex-1 p-4 rounded-lg border-2', currentColors.bg, currentColors.border)}>
            <div className="flex items-center gap-2 mb-2">
              <Award className={cn('h-5 w-5', currentColors.text)} />
              <span className="text-sm font-medium">{t.currentTier}</span>
            </div>
            <p className={cn('text-lg font-semibold', currentColors.text)}>
              {lang === 'ru' ? currentTier.tierNameRu : currentTier.tierName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              +{currentVolumeConsistencyPremium} ₸/kg
            </p>
          </div>

          {/* Arrow */}
          {nextTier && (
            <div className="flex items-center">
              <ChevronRight className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          {/* Next Tier */}
          {nextTier ? (
            <div className={cn('flex-1 p-4 rounded-lg border-2 border-dashed', nextColors?.border, 'bg-muted/30')}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{t.nextTier}</span>
              </div>
              <p className={cn('text-lg font-semibold', nextColors?.text)}>
                {lang === 'ru' ? nextTier.tierNameRu : nextTier.tierName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                +{nextVolumeConsistencyPremium} ₸/kg
              </p>
            </div>
          ) : (
            <div className="flex-1 p-4 rounded-lg border-2 border-dashed bg-emerald-500/5 border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">{t.maxTier}</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bars */}
        {nextTier && requirements && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                {t.toReach} {lang === 'ru' ? nextTier.tierNameRu : nextTier.tierName}
              </h4>

              {/* Batches */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{t.batches}</span>
                  </div>
                  <span className="tabular-nums">
                    {fulfilledBatches} / {nextTier.minBatches}
                    {requirements.batchesNeeded > 0 && (
                      <span className="text-muted-foreground ml-1">
                        ({t.more} {requirements.batchesNeeded})
                      </span>
                    )}
                  </span>
                </div>
                <Progress value={progress.batchProgress} className="h-2" />
              </div>

              {/* Delivery Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span>{t.deliveryRate}</span>
                  </div>
                  <span className="tabular-nums">
                    {Math.round(deliveryRate)}% / {nextTier.minDeliveryRate}%
                    {requirements.deliveryRateNeeded > 0 && (
                      <span className="text-muted-foreground ml-1">
                        (+{Math.round(requirements.deliveryRateNeeded)}%)
                      </span>
                    )}
                  </span>
                </div>
                <Progress value={progress.deliveryProgress} className="h-2" />
              </div>

              {/* Months Active */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{t.monthsActive}</span>
                  </div>
                  <span className="tabular-nums">
                    {monthsActive} / {nextTier.minMonthsActive}
                    {requirements.monthsNeeded > 0 && (
                      <span className="text-muted-foreground ml-1">
                        ({t.more} {requirements.monthsNeeded})
                      </span>
                    )}
                  </span>
                </div>
                <Progress value={progress.monthsProgress} className="h-2" />
              </div>
            </div>
          </>
        )}

        {/* Income Impact */}
        {nextTier && premiumImprovement > 0 && (
          <>
            <Separator />
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-emerald-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t.potentialIncome}
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">{t.currentPremium}</p>
                  <p className="text-lg font-semibold">{currentTotalPremium} ₸/kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.nextPremium}</p>
                  <p className="text-lg font-semibold text-emerald-700">{potentialTotalPremium} ₸/kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.improvement}</p>
                  <p className="text-lg font-semibold text-emerald-600">+{premiumImprovement} ₸/kg</p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                ≈ +{estimatedIncomeImprovement.toLocaleString()} ₸ {t.perBatch} ({avgBatchWeight} kg)
              </p>
            </div>
          </>
        )}

        {/* Reliability Status */}
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{t.reliability}</span>
          </div>
          <div className="text-right">
            <Badge variant="outline">
              {GRADING_LABELS[farmerGrading]?.[lang] || farmerGrading}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              +{reliabilityPremium} ₸/kg
            </p>
          </div>
        </div>

        {/* Tips */}
        {nextTier && (
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-700">
              {lang === 'ru'
                ? `Совет: Выполняйте партии регулярно и поддерживайте высокий уровень доставки для достижения ${nextTier.tierNameRu}.`
                : `Tip: Fulfill batches regularly and maintain high delivery rate to reach ${nextTier.tierName}.`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default PremiumProgressDashboard;
