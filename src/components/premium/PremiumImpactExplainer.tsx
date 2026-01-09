/**
 * PremiumImpactExplainer Component
 *
 * Sprint 9-10: Explains how each premium type affects farmer income.
 * Provides clear, educational content about the premium system.
 */

import {
  Award,
  TrendingUp,
  ShieldCheck,
  Clock,
  BarChart3,
  Calculator,
  Info,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  PREMIUM_TYPE_LABELS,
  PREMIUM_TYPE_DESCRIPTIONS,
  DEFAULT_PREMIUM_VALUES,
  STANDARD_COMPLIANCE_LEVELS,
  PREDICTABILITY_LEVELS,
  RELIABILITY_TIERS,
  VOLUME_CONSISTENCY_TIERS,
} from '@/lib/premium-config';

interface PremiumImpactExplainerProps {
  /** Display variant */
  variant?: 'inline' | 'full';
  /** Language */
  lang?: 'en' | 'ru';
  /** Highlight a specific premium type */
  highlightType?: 'standard' | 'reliability' | 'predictability' | 'volume_consistency';
  /** Custom className */
  className?: string;
}

const PREMIUM_ICONS = {
  standard: ShieldCheck,
  reliability: Award,
  predictability: Clock,
  volume_consistency: BarChart3,
};

const PREMIUM_COLORS = {
  standard: { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/30' },
  reliability: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/30' },
  predictability: { bg: 'bg-purple-500/10', text: 'text-purple-700', border: 'border-purple-500/30' },
  volume_consistency: { bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/30' },
};

export function PremiumImpactExplainer({
  variant = 'inline',
  lang = 'ru',
  highlightType,
  className,
}: PremiumImpactExplainerProps) {
  const t = lang === 'ru' ? {
    title: 'Как премии влияют на ваш доход',
    subtitle: 'Понимание системы премий TURAN',
    formula: 'Формула расчёта',
    formulaDesc: 'Итоговая цена = Базовая цена + Все применимые премии',
    maxPremium: 'Максимальная премия',
    perKg: 'за кг',
    example: 'Пример расчёта',
    exampleDesc: 'При базовой цене 500 ₸/кг и максимальных премиях:',
    totalExample: 'Итого',
    disclaimer: 'Премии являются индикативными. TURAN не осуществляет платежи напрямую.',
    levels: 'Уровни',
    howToImprove: 'Как улучшить',
  } : {
    title: 'How Premiums Affect Your Income',
    subtitle: 'Understanding the TURAN premium system',
    formula: 'Calculation Formula',
    formulaDesc: 'Final Price = Base Price + All Applicable Premiums',
    maxPremium: 'Maximum Premium',
    perKg: 'per kg',
    example: 'Example Calculation',
    exampleDesc: 'With base price of 500 ₸/kg and maximum premiums:',
    totalExample: 'Total',
    disclaimer: 'Premiums are indicative. TURAN does not handle payments directly.',
    levels: 'Levels',
    howToImprove: 'How to Improve',
  };

  // Calculate max total premium
  const maxStandard = Math.max(...Object.values(DEFAULT_PREMIUM_VALUES.standard));
  const maxReliability = Math.max(...Object.values(DEFAULT_PREMIUM_VALUES.reliability));
  const maxPredictability = Math.max(...Object.values(DEFAULT_PREMIUM_VALUES.predictability));
  const maxVolumeConsistency = Math.max(...Object.values(DEFAULT_PREMIUM_VALUES.volume_consistency));
  const maxTotalPremium = maxStandard + maxReliability + maxPredictability + maxVolumeConsistency;

  // Inline variant
  if (variant === 'inline') {
    return (
      <Alert className={cn('border-blue-500/30 bg-blue-500/5', className)}>
        <Calculator className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <span className="font-medium text-blue-700">{t.title}</span>
          <span className="text-muted-foreground block mt-1">
            {t.formulaDesc} ({t.maxPremium}: {maxTotalPremium} ₸/kg)
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // Full version
  const premiumTypes = [
    { key: 'standard', values: DEFAULT_PREMIUM_VALUES.standard },
    { key: 'reliability', values: DEFAULT_PREMIUM_VALUES.reliability },
    { key: 'predictability', values: DEFAULT_PREMIUM_VALUES.predictability },
    { key: 'volume_consistency', values: DEFAULT_PREMIUM_VALUES.volume_consistency },
  ] as const;

  return (
    <Card className={cn('border-blue-500/30 bg-blue-500/5', className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formula */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <HelpCircle className="h-4 w-4" />
            {t.formula}
          </div>
          <div className="font-mono text-sm bg-background/50 p-3 rounded border">
            {t.formulaDesc}
          </div>
        </div>

        {/* Premium Types */}
        <div className="space-y-4">
          {premiumTypes.map(({ key, values }) => {
            const Icon = PREMIUM_ICONS[key];
            const colors = PREMIUM_COLORS[key];
            const maxValue = Math.max(...Object.values(values));
            const isHighlighted = highlightType === key;

            return (
              <div
                key={key}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  isHighlighted ? `${colors.bg} ${colors.border}` : 'bg-muted/30 border-transparent'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', colors.bg)}>
                      <Icon className={cn('h-5 w-5', colors.text)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {PREMIUM_TYPE_LABELS[key][lang]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {PREMIUM_TYPE_DESCRIPTIONS[key][lang]}
                      </p>
                    </div>
                  </div>
                  <Badge className={cn('text-sm', colors.bg, colors.text, colors.border)}>
                    до +{maxValue} ₸
                  </Badge>
                </div>

                {/* Levels */}
                <div className="mt-3 ml-13 space-y-1">
                  {Object.entries(values).map(([levelKey, value]) => (
                    <div key={levelKey} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground capitalize">
                        {levelKey.replace(/_/g, ' ')}
                      </span>
                      <span className={value > 0 ? 'font-medium' : 'text-muted-foreground'}>
                        {value > 0 ? `+${value} ₸/kg` : '0 ₸'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Example Calculation */}
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-800 mb-3">
            <TrendingUp className="h-4 w-4" />
            {t.example}
          </div>
          <p className="text-xs text-muted-foreground mb-3">{t.exampleDesc}</p>
          <div className="space-y-1 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Price</span>
              <span>500 ₸</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">+ Standard (High)</span>
              <span className="text-blue-600">+{maxStandard} ₸</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">+ Reliability</span>
              <span className="text-emerald-600">+{maxReliability} ₸</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">+ Predictability</span>
              <span className="text-purple-600">+{maxPredictability} ₸</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">+ Volume Consistency</span>
              <span className="text-amber-600">+{maxVolumeConsistency} ₸</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>{t.totalExample}</span>
              <span className="text-emerald-700">{500 + maxTotalPremium} ₸/kg</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <Alert className="border-blue-500/30 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-700">
            {t.disclaimer}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default PremiumImpactExplainer;
