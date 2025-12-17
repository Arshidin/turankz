import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Info } from 'lucide-react';
import { useReliabilityPremiums, getPremiumByLevel } from '@/hooks/usePremiums';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReliabilityPremiumCardProps {
  farmerGrading: string;
  className?: string;
}

export function ReliabilityPremiumCard({ farmerGrading, className }: ReliabilityPremiumCardProps) {
  const { t } = useTranslation();
  const { data: reliabilityPremiums } = useReliabilityPremiums();
  const currentPremium = getPremiumByLevel(reliabilityPremiums, farmerGrading);
  
  const gradingConfig: Record<string, { labelKey: string; color: string }> = {
    observer: { labelKey: 'farmers.observer', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    declared_supplier: { labelKey: 'farmers.declaredSupplier', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    standard_supplier: { labelKey: 'farmers.standardSupplier', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  };
  
  const gradingInfo = gradingConfig[farmerGrading] || gradingConfig.observer;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            {t('premium.reliabilityPremium')}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('premium.premiumTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>{t('premium.yourReliabilityStatus')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={gradingInfo.color}>
              {t(gradingInfo.labelKey)}
            </Badge>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-semibold text-primary">
              <TrendingUp className="h-4 w-4" />
              +{currentPremium?.premium_value ?? 0} ₸/кг
            </div>
          </div>
        </div>
        
        {currentPremium?.criteria && currentPremium.criteria.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">{t('premium.currentLevelCriteria')}:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {currentPremium.criteria.map((criterion, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-primary">•</span>
                  {criterion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
