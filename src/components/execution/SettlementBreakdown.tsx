/**
 * SettlementBreakdown Component
 *
 * Sprint 7-8: Shows the settlement calculation formula and breakdown.
 * Formula: Indicative Total = Reference Price + Premiums Applied
 */

import {
  Calculator,
  Info,
  TrendingUp,
  Award,
  HelpCircle,
  Receipt,
  Scale,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PremiumBreakdown {
  name: string;
  nameRu: string;
  value: number;
}

interface SettlementBreakdownProps {
  referencePrice: number;
  premiumsApplied: number;
  premiumBreakdown?: PremiumBreakdown[];
  deliveredVolume?: number;
  averageWeight?: number;
  variant?: 'compact' | 'full' | 'card';
  lang?: 'en' | 'ru';
  showDisclaimer?: boolean;
  className?: string;
}

export function SettlementBreakdown({
  referencePrice,
  premiumsApplied,
  premiumBreakdown = [],
  deliveredVolume,
  averageWeight = 350,
  variant = 'full',
  lang = 'ru',
  showDisclaimer = true,
  className,
}: SettlementBreakdownProps) {
  const indicativeTotal = referencePrice + premiumsApplied;
  const estimatedTotalKg = deliveredVolume ? deliveredVolume * averageWeight : null;
  const estimatedTotalValue = estimatedTotalKg ? estimatedTotalKg * indicativeTotal : null;

  const t = lang === 'ru' ? {
    title: 'Расшифровка расчёта',
    subtitle: 'Формула индикативного расчёта',
    referencePrice: 'Референсная цена',
    referencePriceDesc: 'Рыночная цена на момент доставки',
    premiums: 'Применённые премии',
    premiumsDesc: 'Заработанные поощрительные премии',
    total: 'Индикативный итог',
    formula: 'Формула',
    deliveredVolume: 'Доставленный объём',
    averageWeight: 'Средний вес',
    estimatedTotal: 'Примерная сумма',
    heads: 'голов',
    perKg: 'за кг',
    disclaimer: 'TURAN не осуществляет платежи. Это индикативный расчёт только для справки.',
    noPremiums: 'Премии не применены',
    premiumDetails: 'Детали премий',
  } : {
    title: 'Settlement Breakdown',
    subtitle: 'Indicative calculation formula',
    referencePrice: 'Reference Price',
    referencePriceDesc: 'Market reference at delivery time',
    premiums: 'Premiums Applied',
    premiumsDesc: 'Earned incentive premiums',
    total: 'Indicative Total',
    formula: 'Formula',
    deliveredVolume: 'Delivered Volume',
    averageWeight: 'Average Weight',
    estimatedTotal: 'Estimated Total',
    heads: 'heads',
    perKg: 'per kg',
    disclaimer: 'TURAN does not handle payments. This is an indicative settlement for reference only.',
    noPremiums: 'No premiums applied',
    premiumDetails: 'Premium Details',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US').format(value);
  };

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-1.5 text-sm cursor-help', className)}>
              <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{formatCurrency(referencePrice)}</span>
              <span className="text-emerald-600">+{formatCurrency(premiumsApplied)}</span>
              <span className="font-medium">=</span>
              <span className="font-semibold text-primary">{formatCurrency(indicativeTotal)} ₸/kg</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px]">
            <div className="space-y-1 text-xs">
              <p><strong>{t.referencePrice}:</strong> {formatCurrency(referencePrice)} ₸</p>
              <p><strong>{t.premiums}:</strong> +{formatCurrency(premiumsApplied)} ₸</p>
              <p className="pt-1 border-t font-medium">{t.total}: {formatCurrency(indicativeTotal)} ₸/kg</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const content = (
    <div className="space-y-4">
      {/* Formula visualization */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          {t.formula}
        </div>
        <div className="flex items-center justify-center gap-2 text-lg font-mono flex-wrap">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">{t.referencePrice}</div>
            <Badge variant="outline" className="text-sm px-2 py-1">
              {formatCurrency(referencePrice)} ₸
            </Badge>
          </div>
          <span className="text-xl text-emerald-600">+</span>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">{t.premiums}</div>
            <Badge className="text-sm px-2 py-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
              {formatCurrency(premiumsApplied)} ₸
            </Badge>
          </div>
          <span className="text-xl">=</span>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">{t.total}</div>
            <Badge className="text-sm px-2 py-1 bg-primary text-primary-foreground">
              {formatCurrency(indicativeTotal)} ₸/kg
            </Badge>
          </div>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{t.referencePrice}</p>
              <p className="text-xs text-muted-foreground">{t.referencePriceDesc}</p>
            </div>
          </div>
          <span className="font-medium tabular-nums">{formatCurrency(referencePrice)} ₸</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{t.premiums}</p>
              <p className="text-xs text-muted-foreground">{t.premiumsDesc}</p>
            </div>
          </div>
          <span className="font-medium tabular-nums text-emerald-600">
            +{formatCurrency(premiumsApplied)} ₸
          </span>
        </div>

        {premiumBreakdown.length > 0 && (
          <div className="ml-10 pl-4 border-l-2 border-emerald-500/30 space-y-2">
            <p className="text-xs text-muted-foreground">{t.premiumDetails}:</p>
            {premiumBreakdown.map((premium, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {lang === 'ru' ? premium.nameRu : premium.name}
                </span>
                <span className="text-emerald-600">+{formatCurrency(premium.value)} ₸</span>
              </div>
            ))}
          </div>
        )}

        {premiumsApplied === 0 && (
          <div className="ml-10 text-xs text-muted-foreground italic">{t.noPremiums}</div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t.total}</p>
              <p className="text-xs text-muted-foreground">{t.perKg}</p>
            </div>
          </div>
          <span className="text-lg font-bold text-primary tabular-nums">
            {formatCurrency(indicativeTotal)} ₸
          </span>
        </div>
      </div>

      {deliveredVolume && estimatedTotalValue && (
        <>
          <Separator />
          <div className="p-3 bg-muted/20 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{t.estimatedTotal}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-muted-foreground">{t.deliveredVolume}:</span>
              <span className="text-right">{formatCurrency(deliveredVolume)} {t.heads}</span>
              <span className="text-muted-foreground">{t.averageWeight}:</span>
              <span className="text-right">{averageWeight} kg</span>
              <span className="font-medium border-t pt-1">{t.estimatedTotal}:</span>
              <span className="text-right font-semibold text-primary border-t pt-1">
                ~{formatCurrency(estimatedTotalValue)} ₸
              </span>
            </div>
          </div>
        </>
      )}

      {showDisclaimer && (
        <Alert className="border-blue-500/30 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-700">{t.disclaimer}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {t.title}
          </CardTitle>
          <CardDescription className="text-xs">{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}

export default SettlementBreakdown;
